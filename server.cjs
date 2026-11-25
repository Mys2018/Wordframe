const { createServer } = require('node:http');
const { timingSafeEqual } = require('node:crypto');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');
const { deckSpec } = require('./deck.cjs');

const provider = 'https://plusvibeapi.ru/v1';
const haiku = 'claude-haiku-5.5';
const models = [
  { id: 'deepseek-v4-flash-0731:free', label: 'DeepSeek V4 Flash · бесплатно' },
  { id: haiku, label: 'Claude Haiku 5.5 · платно' },
  { id: 'gpt-6.1-terra', label: 'GPT-6.1 Terra · платно' }
];
const allowedModel = id => models.some(model => model.id === id);
const dist = join(__dirname, 'dist');
const assets = new Map([
  ['/index.html', 'text/html; charset=utf-8'], ['/style.css', 'text/css; charset=utf-8'],
  ...['words', 'grammar', 'reverse', 'app'].map(name => ['/' + name + '.js', 'text/javascript; charset=utf-8'])
]);
const types = runInNewContext(
  ['words', 'grammar'].map(name => readFileSync(join(dist, name + '.js'), 'utf8')).join('\n')
  + '\n({cards: new Map(words.map(card => [card.id, card])), topics: new Map(grammarTopics.map(topic => [topic.id, topic]))})'
);
const letters = /[\p{L}]+(?:'[\p{L}]+)*/gu;
const safeText = (value, limit) => typeof value === 'string' && value.trim().length > 0
  && value.length <= limit && !/[<>&\x00-\x1f]/.test(value);
const translated = (value, limit) => safeText(value, limit) && /\p{Script=Cyrillic}/u.test(value);

function generationSpec(kind, id) {
  if (kind === 'context') {
    const card = types.cards.get(id);
    if (!card) return;
    const originals = (card.contexts ?? [card]).map(entry => entry.sentence);
    const targets = originals.map(sentence => sentence.match(/\[([^\]]+)\]/)?.[1]).filter(Boolean);
    const instruction = 'Create one new practice sentence. Use exactly one target from targets inside [square brackets], '
      + 'preserving its spelling and meaning. Return JSON with sentence, translation (natural Russian), and glosses (array of Russian glosses '
      + 'for every English word outside the brackets in order, including articles. Split hyphenated words; count contractions as one word).';
    return {
      instruction,
      input: { word: card.word, meaning: card.right, level: card.level, originals, targets },
      validate(result) {
        if (!safeText(result?.sentence, 280) || !translated(result.translation, 380)) return;
        const marked = [...result.sentence.matchAll(/\[([^\[\]]+)\]/g)];
        const outside = result.sentence.replace(/\[[^\[\]]+\]/g, '');
        if (marked.length !== 1 || /[\[\]\p{Script=Cyrillic}]/u.test(outside)
          || !targets.some(target => target.toLowerCase() === marked[0][1].toLowerCase())
          || originals.some(text => text.toLowerCase() === result.sentence.toLowerCase())) return;
        if (!Array.isArray(result.glosses) || result.glosses.length !== (outside.match(letters) ?? []).length
          || !result.glosses.every(gloss => translated(gloss, 110))) return;
        return { sentence: result.sentence, translation: result.translation, glosses: result.glosses };
      }
    };
  }
  const topic = types.topics.get(id);
  if (!topic) return;
  const input = { topic: topic.title, level: topic.level, rule: topic.rule };
  if (kind === 'examples') return {
    instruction: 'Return JSON with examples: an array of exactly two pairs [new English example, Russian translation]. Apply the grammar rule distinctly in both.',
    input: { ...input, originals: topic.examples },
    validate(result) {
      if (Array.isArray(result?.examples) && result.examples.length === 2 && result.examples.every(pair =>
        Array.isArray(pair) && pair.length === 2 && safeText(pair[0], 280) && !/\p{Script=Cyrillic}/u.test(pair[0])
        && translated(pair[1], 350))) return { examples: result.examples };
    }
  };
  if (kind === 'gap') return {
    instruction: 'Return JSON with sentence (English with exactly one literal ___ gap), cue (base word or phrase), '
      + 'answers (array of one to three distinct correct forms, preferred first), explanation (Russian, one or two sentences). '
      + 'Provide enough context and do not reveal the answer elsewhere in the sentence.',
    input: { ...input, originals: topic.exercises.map(exercise => exercise.sentence) },
    validate(result) {
      if (!safeText(result?.sentence, 280) || result.sentence.split('___').length !== 2
        || /\p{Script=Cyrillic}/u.test(result.sentence) || !safeText(result.cue, 70)
        || !Array.isArray(result.answers) || result.answers.length < 1 || result.answers.length > 3
        || !result.answers.every(answer => safeText(answer, 90) && /[a-z0-9]/i.test(answer)
          && !/\p{Script=Cyrillic}/u.test(answer))
        || !translated(result.explanation, 420)) return;
      return { sentence: result.sentence, cue: result.cue, answers: result.answers, explanation: result.explanation };
    }
  };
}

function reply(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}

function wordframeServer({ apiKey, password, model = haiku, localSettings = false, request = fetch } = {}) {
  if (!allowedModel(model)) throw new Error('Неизвестная модель Wordframe.');
  let activeKey = apiKey?.trim();
  let activeModel = model;
  const settings = () => ({ configured: Boolean(activeKey), model: activeModel, models });
  let recentCalls = [];
  let busy = false;
  return createServer(async (req, res) => {
    if (localSettings && (req.socket.remoteAddress !== '127.0.0.1'
      || !/^(?:127\.0\.0\.1|localhost)(?::\d{1,5})?$/i.test(req.headers.host ?? ''))) {
      return reply(res, 403, { error: 'Открой Wordframe по адресу localhost.' });
    }
    if (password) {
      const provided = Buffer.from(req.headers.authorization ?? '');
      const expected = Buffer.from('Basic ' + Buffer.from('wordframe:' + password).toString('base64'));
      if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
        res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Wordframe", charset="UTF-8"', 'Cache-Control': 'no-store' });
        res.end();
        return;
      }
    }
    const path = req.url.split('?')[0];
    if (localSettings && req.method === 'GET' && path === '/api/settings') return reply(res, 200, settings());
    if (req.method === 'GET') {
      const file = path === '/' ? '/index.html' : path;
      if (!assets.has(file)) return reply(res, 404, { error: 'Страница не найдена.' });
      let body = readFileSync(join(dist, file.slice(1)));
      if (file === '/index.html' && (activeKey || localSettings)) {
        const tags = (activeKey ? '<meta name="wordframe-ai" content="enabled">' : '')
          + (localSettings ? '<meta name="wordframe-local-settings" content="enabled">' : '')
          + '<meta name="wordframe-ai-batch" content="enabled"><meta name="wordframe-ai-count" content="enabled">';
        body = body.toString('utf8').replace('</head>', tags + '</head>');
      }
      res.writeHead(200, { 'Content-Type': assets.get(file), 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      res.end(body);
      return;
    }
    const changeSettings = localSettings && path === '/api/settings';
    const testModel = localSettings && path === '/api/settings/test';
    if (req.method !== 'POST' || (!changeSettings && !testModel && path !== '/api/generate')) {
      return reply(res, 404, { error: 'Запрос не найден.' });
    }
    if (req.headers['sec-fetch-site'] !== 'same-origin'
      || !/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] ?? '')) {
      return reply(res, 403, { error: 'Запрос должен идти из Wordframe.' });
    }
    let body = '';
    try {
      req.setEncoding('utf8');
      for await (const chunk of req) {
        body += chunk;
        if (body.length > (path === '/api/generate' ? 260_000 : 1024)) return reply(res, 413, { error: 'Слишком большой запрос.' });
      }
      body = JSON.parse(body);
    } catch {
      return reply(res, 400, { error: 'Некорректный запрос.' });
    }
    if (changeSettings) {
      if (!allowedModel(body?.model) || (body.apiKey !== undefined
        && (typeof body.apiKey !== 'string' || !/^sk-pv-[!-~]{1,240}$/.test(body.apiKey)))) {
        return reply(res, 400, { error: 'Выбери модель и проверь формат ключа PlusVibe.' });
      }
      if (body.apiKey) activeKey = body.apiKey;
      activeModel = body.model;
      return reply(res, 200, settings());
    }
    if (!activeKey) return reply(res, 503, { error: 'Добавь ключ PlusVibe в настройках Wordframe.' });
    const chosenModel = testModel ? body?.model : activeModel;
    if (!allowedModel(chosenModel)) return reply(res, 400, { error: 'Неизвестная модель Wordframe.' });
    const batch = !testModel && body?.kind === 'deck';
    const spec = testModel ? generationSpec('gap', 'present-simple')
      : batch ? deckSpec(body, types.cards) : generationSpec(body?.kind, body?.id);
    if (!spec) return reply(res, 400, { error: 'Такой карточки или темы нет.' });
    recentCalls = recentCalls.filter(time => Date.now() - time < 3_600_000);
    if (busy || recentCalls.length >= 40) return reply(res, 429, { error: 'Генерация уже идёт или достигнут лимит. Попробуй позже.' });
    recentCalls.push(Date.now());
    busy = true;
    try {
      const useMessages = chosenModel === haiku;
      const system = 'You write clear English-learning material for Russian speakers. Return only raw JSON, without Markdown. ' + spec.instruction;
      const user = { role: 'user', content: JSON.stringify(spec.input) };
      const payload = useMessages
        ? { model: chosenModel, max_tokens: batch ? Math.min(16000, 1500 + (body.count ?? 6) * 650) : 950, system, thinking: { type: 'disabled' }, messages: [user] }
        : { model: chosenModel, max_tokens: batch ? Math.min(16000, 1500 + (body.count ?? 6) * 650) : 950, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: system }, user] };
      const headers = useMessages ? { 'x-api-key': activeKey, 'anthropic-version': '2023-06-01' }
        : { Authorization: 'Bearer ' + activeKey };
      const upstream = await request(provider + (useMessages ? '/messages' : '/chat/completions'), {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(batch ? 120_000 : 45_000),
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!upstream.ok) {
        const failure = await upstream.json().catch(() => null);
        const code = failure?.error?.code ?? failure?.code;
        const error = code === 'promotion_subscription_required'
          ? 'Для бесплатного DeepSeek нужно привязать Telegram в PlusVibe.'
          : upstream.status === 401 ? 'PlusVibe не принял ключ.'
          : upstream.status === 429 ? 'PlusVibe ограничил запросы. Попробуй позже.'
          : 'PlusVibe отклонил запрос. Проверь доступ к модели и баланс.';
        return reply(res, 502, { error });
      }
      const output = await upstream.json();
      if (useMessages && (upstream.headers.get('x-pv-dropped-params')?.includes('thinking')
        || output.content?.some(block => ['thinking', 'redacted_thinking'].includes(block.type)))) {
        return reply(res, 502, { error: 'PlusVibe не отключил рассуждение для этого запроса Haiku.' });
      }
      const content = useMessages ? output.content?.filter(block => block.type === 'text').map(block => block.text).join('')
        : output.choices?.[0]?.message?.content;
      const jsonBlock = content?.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
      const result = spec.validate(JSON.parse(jsonBlock?.[1] ?? content));
      if (!result) return reply(res, 502, { error: batch?'Не удалось получить нужное количество новых карточек без повторов. Попробуй ещё раз или выбери меньше.':'Не получилось получить корректный пример. Попробуй ещё раз.' });
      reply(res, 200, result);
    } catch {
      reply(res, 502, { error: 'Не получилось получить корректный ответ от модели. Попробуй ещё раз.' });
    } finally {
      busy = false;
    }
  });
}

if (require.main === module) {
  const host = process.env.HOST || '127.0.0.1';
  const password = process.env.WORDFRAME_PASSWORD;
  if (host !== '127.0.0.1' && !password) throw new Error('Для внешнего доступа нужен WORDFRAME_PASSWORD.');
  const localSettings = host === '127.0.0.1' && !password;
  const model = process.env.PLUSVIBE_MODEL || (localSettings ? models[0].id : haiku);
  wordframeServer({ apiKey: process.env.PLUSVIBE_API_KEY, password, model, localSettings }).listen(process.env.PORT || 8080, host, () => {
    console.log('Wordframe слушает на ' + host + ':' + (process.env.PORT || 8080));
  });
}

module.exports = { wordframeServer };
