const textKey = value => value.normalize('NFKC').toLowerCase().replace(/[’‘]/g, "'")
  .replace(/[^\p{L}\p{N}']+/gu, ' ').trim();
const wordKey = value => textKey(value).split(' ').map(word =>
  word.length > 4 ? word.replace(/(?:ing|ed|es|s)$/, '').replace(/e$/, '') : word).join(' ');
const templateKey = sentence => textKey(sentence.replace(/\[[^\]]+\]/g, ' WORDTARGET '));
const letters = /[a-z]+(?:'[a-z]+)*/gi;
const clean = (value, limit) => typeof value === 'string' && value.trim().length > 0 && value.length <= limit
  && !/[<>&\x00-\x1f]/.test(value);
const english = (value, limit) => clean(value, limit) && /[a-z]/i.test(value) && !/\p{Script=Cyrillic}/u.test(value);
const russian = (value, limit) => clean(value, limit) && /\p{Script=Cyrillic}/u.test(value);
const parts = new Set(['all','noun','verb','adj','adv','phrasal','prep','conj','det']);
const englishWord = /^[a-z]+(?:[' -][a-z]+)*$/i;


function deckSpec(body, cards) {
  const size = body.count === undefined ? 6 : body.count;
  if (!Number.isInteger(size) || size < 1 || size > 20) return;
  if (!['A1','A2','B1','B2','C1'].includes(body.level) || !parts.has(body.part)
    || !Array.isArray(body.history) || body.history.length > 800
    || !body.history.every(entry => Array.isArray(entry) && entry.length === 2
      && english(entry[0],70) && englishWord.test(entry[0]) && english(entry[1],260))) return;
  const known = [...cards.values()];
  const words = new Set([...known.map(w => w.word), ...body.history.map(([word]) => word)].map(wordKey));
  const sentences = [...known.flatMap(w => (w.contexts ?? [w]).map(context => context.sentence)), ...body.history.map(([,sentence]) => sentence)];
  const seenText = new Set(sentences.map(textKey));
  const seenTemplates = new Set(sentences.map(templateKey));
  return {
    instruction: `Create ${size + 2} candidate vocabulary exercises` + ' for a Russian speaker, following the CEFR and part of speech. '
      + 'Use new, useful English words not in excludedWords and distinct situations, settings and sentence structures. '
      + 'Return JSON as {"cards":[{"word":"headword","sentence":"English sentence with [headword] exactly once",'
      + '"translation":"Russian sentence","right":"Russian meaning of headword in context","glosses":["one Russian gloss per surrounding English token"],'
      + '"wrongRu":["three plausible but strictly wrong Russian meanings"],"wrongRuEn":["English translation for each wrongRu in the same order"],'
      + '"wrongEn":["three plausible but strictly wrong English words"],"wrongEnRu":["Russian translation for each wrongEn in the same order"]}]}. '
      + (body.sentenceStyle === 'complex' ? 'Use longer, more complex sentences (about 14–24 words), appropriate to the selected level. ' : 'Keep sentences short (5–11 words). ')
      + 'Split hyphenated words for glosses, count contractions as one word and include articles. '
      + 'Do not repeat the target outside brackets, use synonyms as wrong answers, or make multiple correct choices. '
      + 'Use plain text, ASCII letters for English words, and straight apostrophes.',
    input: {
      level:body.level, part:body.part, excludedWords:[...new Set([...known.map(w => w.word),...body.history.slice(-100).map(([word]) => word)])],
      recentContexts:body.history.slice(-10).map(([,sentence])=>sentence)
    },
    validate(data) {
      if (!Array.isArray(data?.cards)) return;
      const deck = [];
      for (const card of data.cards.slice(0,size+2)) {
        if (!english(card?.word,70) || !englishWord.test(card.word) || !english(card.sentence,260)
          || !russian(card.translation,320) || !russian(card.right,110)) continue;
        const target = card.sentence.match(/\[([^\[\]]+)\]/g);
        const outside = card.sentence.replace(/\[[^\[\]]+\]/g, '');
        const term = wordKey(card.word), context = textKey(card.sentence), template = templateKey(card.sentence);
        if (target?.length !== 1 || /[\[\]]/.test(outside) || textKey(target[0]) !== textKey(card.word)
          || (' '+textKey(outside)+' ').includes(' '+textKey(card.word)+' ')
          || words.has(term) || seenText.has(context) || seenTemplates.has(template)
          || !Array.isArray(card.glosses) || card.glosses.length !== (outside.match(letters) ?? []).length
          || !card.glosses.every(gloss => russian(gloss,110))) continue;
        const correct = [card.right,card.word];
        const options = [card.wrongRu, card.wrongEn].map((answers,i)=>{
          const valid = i===0 ? russian : english;
          if (Array.isArray(answers) && answers.length===3 && answers.every(answer=>valid(answer,110))
            && new Set([correct[i],...answers].map(i===0?textKey:wordKey)).size===4) return [correct[i],...answers];
        });
        if (!options.every(Boolean)) continue;
        if (!Array.isArray(card.wrongRuEn) || card.wrongRuEn.length!==3 || !card.wrongRuEn.every(value=>english(value,110))
          || !Array.isArray(card.wrongEnRu) || card.wrongEnRu.length!==3 || !card.wrongEnRu.every(value=>russian(value,110))) continue;
        words.add(term);
        seenText.add(context);
        seenTemplates.add(template);
        deck.push({
          word:card.word,sentence:card.sentence,translation:card.translation,right:card.right,glosses:card.glosses,
          options:options[0],reverseOptions:options[1],optionTranslations:[card.word,...card.wrongRuEn],
          reverseTranslations:[card.right,...card.wrongEnRu],level:body.level
        });
        if (deck.length===size) return {cards:deck};
      }
    }
  };
}

module.exports = { deckSpec };
