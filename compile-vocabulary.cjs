const fs = require('node:fs');
const vm = require('node:vm');

const base = fs.readFileSync('dist/words.js', 'utf8').replace(/\r\n/g, '\n').split('\n// Expanded vocabulary\n')[0];
const additions = [];
const expandedParts = {v:'verb', n:'noun', a:'adj', p:'phrasal'};
const partMetadata = part => part === 'phrasal' ? {part:'verb', phrasal:true} : {part};
const baseParts = {
  noun: [
    'cup', 'sister', 'key', 'water', 'break', 'receipt', 'turn', 'route', 'advice', 'setback', 'incentive',
    'concern', 'compromise', 'bridge', 'towel', 'queue', 'wall'
  ],
  verb: [
    'open', 'walk', 'read', 'borrow', 'catch', 'missed', 'share', 'fit', 'book', 'rang', 'spent', 'invite',
    'order', 'forgot', 'afford', 'realise', 'includes', 'manage', 'suggest', 'achieved', 'expect', 'delayed',
    'ease', 'outweigh', 'overlooked', 'overlap', 'allocate', 'pack', 'carry', 'remind', 'cancel', 'recognised',
    'attach', 'replace', 'refused', 'contradict', 'reduce', 'justify', 'offset'
  ],
  adj: [
    'late', 'cold', 'empty', 'closed', 'quiet', 'crowded', 'cheap', 'private', 'similar', 'reliable', 'reluctant',
    'subtle', 'feasible', 'ambiguous', 'crucial', 'rough', 'tempting', 'fresh', 'heavy', 'slippery', 'flexible',
    'shared', 'inevitable', 'preliminary'
  ],
  adv: ['nearby', 'upstairs', 'rather', 'luckily', 'at first glance', 'steadily'],
  prep: ['under'],
  det: ['enough'],
  conj: ['in case'],
  phrasal: ['look after', 'put off', 'ran into', 'deal with', 'backs up', 'rule out', 'ran out of']
};
const common = {
  a:'неопределённый артикль', an:'неопределённый артикль', the:'определённый артикль',
  i:'я', you:'ты / вы', he:'он', she:'она', it:'это / он / она', we:'мы', they:'они',
  me:'мне / меня', him:'ему / его', us:'нам / нас', them:'им / их', my:'мой', your:'твой / ваш',
  his:'его', her:'её / ей', its:'его / её', our:'наш', their:'их',
  this:'этот', that:'тот / что', these:'эти', those:'те', some:'немного / несколько', any:'любой / какой-либо',
  is:'быть · настоящее время', am:'быть · настоящее время', are:'быть · настоящее время', was:'был / была',
  were:'были', be:'быть', can:'мочь', could:'мог бы', would:'бы', should:'стоит', may:'может',
  might:'может', must:'нужно', need:'нужно', will:'показатель будущего времени', so:'поэтому / так',
  have:'иметь / вспомогательный глагол', has:'иметь / вспомогательный глагол', had:'имел / вспомогательный глагол',
  do:'делать / вспомогательный глагол', does:'делать / вспомогательный глагол', not:'не', no:'нет / никакой',
  cannot:'не может', and:'и', or:'или', but:'но', because:'потому что', if:'если', even:'даже',
  for:'для / в течение', on:'на', in:'в', at:'в / у', of:'связь с последующим словом', to:'к / частица инфинитива',
  with:'с', from:'из / от', by:'у / с помощью', after:'после', before:'перед / до того как',
  during:'во время', until:'до / пока не', when:'когда', while:'пока', who:'кто', what:'что',
  why:'почему', how:'как', without:'без', about:'о / об', into:'внутрь / в', over:'над / через',
  under:'под', between:'между', around:'вокруг', through:'через', behind:'за', beside:'рядом с',
  above:'над', inside:'внутри', near:'возле', across:'через / напротив', throughout:'на протяжении',
  against:'от / против', despite:'несмотря на', within:'в пределах', than:'чем', as:'как / по мере того как',
  there:'там / конструкция наличия', here:'здесь', please:'пожалуйста', every:'каждый', each:'каждый',
  another:'ещё один', one:'один', two:'два', three:'три', ten:'десять', twelve:'двенадцать',
  several:'несколько', all:'все', only:'только', less:'меньше', more:'больше', very:'очень', too:'слишком',
  still:'всё ещё', rather:'скорее', case:'случай', away:'вдали', gets:'становится', half:'половина',
  put:'положи', below:'ниже / под', checked:'проверил', take:'брать', prices:'цены', use:'использовать', get:'получить'
};
const wordPattern = /[\p{L}]+(?:'[\p{L}]+)*/gu;
const missing = new Map();

for (const level of ['A2', 'B1', 'B2']) {
  const lines = fs.readFileSync('vocabulary-' + level.toLowerCase() + '.txt', 'utf8').trim().split(/\r?\n/);
  for (const line of lines) {
    const [partCode, annotated, translation] = line.split('|');
    const part = expandedParts[partCode];
    const glosses = [];
    let word, right;
    const sentence = annotated.replace(/\[([^=\]]+)=([^\]]+)\]|([a-zé]+(?:'[a-zé]+)*)(?:=([\p{Script=Cyrillic}0-9]+(?:[ -][\p{Script=Cyrillic}0-9]+)*))?/giu,
      (match, target, targetGloss, plain, plainGloss, offset) => {
        if (target) {
          word = target;
          right = targetGloss;
          return '[' + target + ']';
        }
        let value = plainGloss;
        const key = plain.toLowerCase();
        if (!value && key === 'to') {
          const previous = annotated.slice(0, offset);
          value = /(?:need|want|had|have|has|managed|tried|expected|free|aims|offered|asked|stopped|agreed)(?:=[\p{Script=Cyrillic} -]+)? $/iu.test(previous)
            || /^(?:to \[|to [a-z]+=)/i.test(annotated.slice(offset)) ? 'частица инфинитива' : 'к / в / на';
        }
        value ||= common[key];
        if (!value) {
          if (!missing.has(key)) missing.set(key, annotated);
          value = plain;
        }
        glosses.push(value);
        return plain;
      });
    if (!part || !word || !right || !translation || /[\p{Script=Cyrillic}=]/u.test(sentence)
      || (sentence.replace(/\[[^\]]+\]/, '').match(wordPattern) ?? []).length !== glosses.length) {
      throw new Error('Malformed row: ' + line + '\n' + sentence);
    }
    additions.push({ level, word, sentence, right, translation, glosses, ...partMetadata(part) });
  }
}

if (missing.size) {
  throw new Error([...missing].map(([word, sentence]) => word + ': ' + sentence).join('\n'));
}

const existing = vm.runInNewContext(base + '\nwords');
const baseMetadataByWord = new Map(Object.entries(baseParts).flatMap(([part, members]) =>
  members.map(word => [word, partMetadata(part)])));
const baseMetadata = Object.fromEntries(existing.map(card => {
  const metadata = baseMetadataByWord.get(card.word.toLowerCase());
  if (!metadata) throw new Error('Missing part of speech: ' + card.id + ' ' + card.word);
  return [card.id, metadata];
}));
for (const card of additions) {
  const alternatives = additions.filter(candidate => candidate.level === card.level && candidate.part === card.part
    && candidate.right !== card.right && !card.translation.toLowerCase().includes(candidate.right.toLowerCase()));
  // Use translations from comparable cards, and keep the same four choices on each visit.
  const start = [...card.word].reduce((total, char) => total * 31 + char.charCodeAt(0) >>> 0, 7) % alternatives.length;
  const options = new Set([card.right]);
  for (let i = 0; options.size < 4 && i < alternatives.length; i++) {
    options.add(alternatives[(start + i) % alternatives.length].right);
  }
  if (options.size !== 4) throw new Error('Insufficient choices: ' + card.word);
  card.options = [...options];
  card.hint = '';

}
const gameCollection = 'Casualties Unknown';
const readGameCards = file => fs.readFileSync(file, 'utf8').trim().split(/\r?\n/)
  .filter(line => line && !line.startsWith('#')).map(line => {
    const fields = line.split('|');
    const [part, word, right, game, gameTranslation, simple, simpleTranslation, level] = fields;
    const id = 'cu-' + word.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const contexts = [[game, gameTranslation], [simple, simpleTranslation]].map(([sentence, translation]) => ({sentence, translation}));
    const targetPattern = /\[([^\[\]]+)\]/g;
    if (fields.length !== 8 || fields.some(field => !field || field !== field.trim() || /[<>&]/.test(field))
      || !['A1', 'A2', 'B1', 'B2'].includes(level) || !['noun', 'adj', 'verb', 'phrasal'].includes(part) || game === simple
      || contexts.some(({sentence, translation}) => {
        const targets = [...sentence.matchAll(targetPattern)];
        return targets.length !== 1 || /[\[\]\p{Script=Cyrillic}]/u.test(sentence.replace(targetPattern, '$1'))
          || !/\p{Script=Cyrillic}/u.test(translation);
      })) {
      throw new Error('Malformed game vocabulary row: ' + line);
    }
    return { id, level, collection: gameCollection, word, right, contexts, ...partMetadata(part) };
  });

const originalGameCards = readGameCards('vocabulary-casualties-unknown.txt');
const survivalCards = readGameCards('vocabulary-casualties-unknown-survival.txt');
const gameCards = [...originalGameCards, ...survivalCards];
const gameGlosses = new Map(gameCards.filter(card => /^[a-z]+$/.test(card.word)).map(card => [card.word, card.right]));
const glossOverrides = new Map();
const appliedOverrides = new Set();
const glossaryLines = fs.readFileSync('vocabulary-casualties-unknown-glosses.txt', 'utf8').trim().split(/\r?\n/);
for (const line of glossaryLines) {
  if (!line || line.startsWith('#')) continue;
  const fields = line.split('|');
  const translation = fields.at(-1);
  if (!translation || !/\p{Script=Cyrillic}/u.test(translation)) {
    throw new Error('Missing translation in game glossary: ' + line);
  }
  if (fields.length === 2 && /^[a-z]+(?:'[a-z]+)*$/.test(fields[0])) {
    gameGlosses.set(fields[0], translation);
  } else if (fields.length === 4 && /^[12]$/.test(fields[1])) {
    const key = fields.slice(0, 3).join('|');
    if (glossOverrides.has(key)) throw new Error('Duplicate game glossary override: ' + line);
    glossOverrides.set(key, translation);
  } else {
    throw new Error('Malformed game glossary row: ' + line);
  }
}

for (const card of gameCards) {
  // Keep the same distractors for cards that are already in saved sessions.
  const alternatives = originalGameCards.filter(candidate => candidate.part === card.part && candidate.right !== card.right);
  const start = [...card.id].reduce((total, char) => (total * 31 + char.charCodeAt(0)) >>> 0, 7);
  const options = new Set([card.right]);
  for (let i = 0; options.size < 4 && i < alternatives.length; i++) {
    const { right } = alternatives[(start + i) % alternatives.length];
    if (!card.contexts.some(context => context.translation.toLowerCase().includes(right.toLowerCase()))) options.add(right);
  }
  if (options.size !== 4) throw new Error('Insufficient choices: ' + card.word);
  card.options = [...options];
  for (const [index, context] of card.contexts.entries()) {
    const tokens = context.sentence.replace(/\[[^\]]+\]/, '').match(wordPattern) ?? [];
    context.glosses = tokens.map(token => {
      const word = token.toLowerCase();
      const key = [card.word, index + 1, word].join('|');
      if (glossOverrides.has(key)) appliedOverrides.add(key);
      const translation = glossOverrides.get(key) ?? common[word] ?? gameGlosses.get(word);
      if (!translation) throw new Error('Missing game glossary entry for "' + word + '" in ' + context.sentence);
      return translation;
    });
  }
}
for (const key of glossOverrides.keys()) {
  if (!appliedOverrides.has(key)) throw new Error('Unused game glossary override: ' + key);
}

const output = base + '\n// Expanded vocabulary\nconst baseMetadata = {\n'
  + Object.entries(baseMetadata).map(([id, metadata]) => '  ' + JSON.stringify(id) + ': ' + JSON.stringify(metadata)).join(',\n')
  + '\n};\nfor (const card of words) Object.assign(card, baseMetadata[card.id]);\n\nconst expandedVocabulary = [\n'
  + additions.map(card => '  ' + JSON.stringify(card)).join(',\n')
  + '\n];\nfor (const { glosses: context, ...card } of expandedVocabulary) {\n'
  + "  card.id = card.level + '-extra-' + card.word.toLowerCase().replace(/[^a-z]+/g, '-');\n"
  + '  words.push(card);\n  glosses[card.sentence] = context;\n}\n'
  + '\nconst gameVocabulary = [\n' + gameCards.map(card => '  ' + JSON.stringify(card)).join(',\n')
  + '\n];\nwords.push(...gameVocabulary);\n';
const ids = new Set(existing.map(card => card.id));
for (const card of additions) {
  const id = card.level + '-extra-' + card.word.toLowerCase().replace(/[^a-z]+/g, '-');
  if (ids.has(id)) throw new Error('Duplicate card: ' + id);
  ids.add(id);
}
for (const {id} of gameCards) {
  if (ids.has(id)) throw new Error('Duplicate card: ' + id);
  ids.add(id);
}
fs.writeFileSync('dist/words.js', output);
console.log('Total cards:', ids.size);





