const reverseChoices = (() => {
  // Keep the alternatives in the same grammatical family for the shortest
  // beginner cards and the handful of cards in rarer parts of speech.
  const authoredDistractors = {
    'A1-0': ['plate', 'spoon', 'bowl'],
    'A1-1': ['aunt', 'daughter', 'grandmother'],
    'A1-2': ['close', 'wash', 'replace'],
    'A1-3': ['above', 'near', 'on'],
    'A1-4': ['early', 'on time', 'cancelled'],
    'A1-5': ['hot', 'bored', 'sad'],
    'A1-6': ['code', 'doorbell', 'lock'],
    'A1-7': ['take the train', 'swim', 'fly'],
    'A1-8': ['bread', 'cheese', 'salt'],
    'A1-9': ['heavy', 'new', 'dirty'],
    'A1-10': ['draw', 'type', 'buy'],
    'A1-11': ['far away', 'crowded', 'open'],
    'A2-0': ['breakdown', 'replacement', 'habit'],
    'A2-1': ['give away', 'repair', 'give back'],
    'A2-2': ['miss', 'call', 'overtake'],
    'A2-3': ['price tag', 'bag', 'shoelace'],
    'A2-4': ['far away', 'upstairs', 'behind'],
    'A2-5': ['too little', 'even less', 'almost as much'],
    'A2-6': ['met', 'noticed', 'stopped'],
    'A2-7': ['bend', 'request', 'victory'],
    'A2-8': ['rent separately', 'clean', 'lock up'],
    'A2-9': ['like', 'belong to', 'inherit'],
    'A2-10': ['set', 'move', 'pay for'],
    'A2-11': ['charged', 'switched off', 'fell'],
    'A2-12': ['cramped', 'empty', 'cold'],
    'A2-13': ['earned', 'saved', 'borrowed'],
    'A2-14': ['see off', 'give a lift', 'thank'],
    'A2-15': ['downstairs', 'outside', 'nearby'],
    'A2-16': ['reheat', 'cook', 'try'],
    'A2-17': ['narrow', 'dark', 'slippery'],
    'A2-18': ['changed', 'wrote down', 'guessed'],
    'A2-19': ['rare', 'extra', 'expensive'],
    'A2-20': ['weigh', 'leave', 'open'],
    'A2-21': ['spicy', 'cold', 'thick'],
    'A2-22': ['leave', 'pack', 'open'],
    'A2-23': ['fence', 'threshold', 'raft'],
    'A2-24': ['soap', 'tap', 'mirror'],
    'A2-25': ['road', 'trip', 'pause'],
    'A2-26': ['soft', 'empty', 'uncomfortable'],
    'A2-27': ['shelf', 'floor', 'table'],
    'B1-7': ['have to', 'be able to', 'promise to'],
    'B1-11': ['as usual', 'by mistake', 'unfortunately'],
    'B1-19': ['even if', 'as soon as', 'because'],
    'B2-4': ['in the end', 'out of habit', 'without a doubt'],
    'B2-14': ['sharply', 'briefly', 'unpredictably']
  };

  const english = value => (value.toLowerCase().match(/[a-z]+(?:'[a-z]+)*/g) ?? []).join(' ');
  const russian = value => (value.toLowerCase().replaceAll('ё', 'е').match(/[а-я]+/g) ?? []).join(' ');
  const englishFamily = value => english(value).replace(/[a-z]{4,}/g, word =>
    word.replace(/(ies|ied)$/, 'y').replace(/(ing|ed|es|s)$/, '').replace(/e$/, '')
  );
  const russianRoots = value => value.split(' ').filter(word => word.length >= 4).map(word => word.slice(0, 5));
  const contained = (text, value) => (' ' + text + ' ').includes(' ' + value + ' ');
  const genericTerms = new Set(('about after again among appear before both called cannot could distinct different ' +
    'each explorer character example found from game has have here into item known listed list means more other ' +
    'said separate shows some special such than that their them then there these they this those used want were ' +
    'what when where which while will with would').split(' '));
  const scope = (part, phrasal, level, collection) => [part, Boolean(phrasal), level, collection].join('|');

  function index(map, key, candidate) {
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(candidate);
  }

  function buildIndex() {
    const profiles = words.map(card => {
      const meaning = russian(card.right);
      const contexts = card.contexts ?? [card];
      const word = english(card.word);
      return {
        card, word, family:englishFamily(card.word), meaning,
        roots:russianRoots(meaning), size:word.split(' ').length,
        sentences:contexts.map(context => english(context.sentence)),
        translations:contexts.map(context => russian(context.translation)),
        terms:new Set(contexts.flatMap(context => english(context.sentence.replace(/\[[^\]]+\]/, '')).split(' ')
          .filter(term => term.length >= 4 && !genericTerms.has(term))))
      };
    }).sort((a,b) => a.card.id.localeCompare(b.card.id));
    const byId = new Map(), byMeaning = new Map(), byTerm = new Map(), byScope = new Map();
    for (const profile of profiles) {
      const {id, part, phrasal, level, collection} = profile.card;
      byId.set(id, profile);
      index(byMeaning, profile.meaning, profile);
      for (const term of profile.terms) index(byTerm, term, profile);
      index(byScope, scope(part, phrasal, level, collection), profile);
      index(byScope, scope(part, phrasal), profile);
    }
    return {profiles, byId, byMeaning, byTerm, byScope};
  }

  function avoidAmbiguity(target, candidate) {
    return target.family === candidate.family
      || contained(target.meaning, candidate.meaning) || contained(candidate.meaning, target.meaning)
      || candidate.roots.some(root => target.roots.includes(root))
      || target.sentences.some(sentence => contained(sentence, candidate.word))
      || target.translations.some(sentence => contained(sentence, candidate.meaning));
  }

  // Rank ties by card IDs so a page reload or a different source order does
  // not change the English answers saved by a workout.
  function stableRank(value) {
    let hash = 2166136261;
    for (const char of value) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
    return hash >>> 0;
  }

  function buildChoices(target, {profiles, byMeaning, byTerm, byScope}) {
    const {card} = target;
    const fixed = authoredDistractors[card.id];
    if (fixed) return [card.word, ...fixed];

    const scores = new Map();
    function score(candidate, weight) {
      const other = candidate.card;
      if (other.part !== card.part || Boolean(other.phrasal) !== Boolean(card.phrasal)) return;
      scores.set(candidate, (scores.get(candidate) ?? 0) + weight);
    }
    for (const [index, option] of card.options.slice(1).entries()) {
      for (const candidate of byMeaning.get(russian(option)) ?? []) {
        score(candidate, (card.collection ? 6 : 16) - index);
      }
    }
    for (const term of target.terms) {
      const peers = byTerm.get(term);
      if (peers.length > 40) continue;
      for (const candidate of peers) score(candidate, peers.length <= 8 ? 9 : 6);
    }
    const ranked = [...scores].map(([candidate, points]) => ({
      candidate,
      points:points + (candidate.card.level === card.level ? 2 : 0)
        + (candidate.card.collection === card.collection ? 1 : 0)
        - Math.min(3, Math.abs(target.size - candidate.size)),
      rank:stableRank(card.id + ':' + candidate.card.id)
    }));
    ranked.sort((a,b) => b.points - a.points || a.rank - b.rank
      || a.candidate.card.id.localeCompare(b.candidate.card.id));

    const options = [card.word];
    const families = new Set([target.family]);
    function collect(candidate) {
      if (families.has(candidate.family) || avoidAmbiguity(target, candidate)) return;
      families.add(candidate.family);
      options.push(candidate.card.word);
    }
    for (const {candidate} of ranked) {
      collect(candidate);
      if (options.length === 4) break;
    }
    const fallbackPools = [
      byScope.get(scope(card.part, card.phrasal, card.level, card.collection)),
      byScope.get(scope(card.part, card.phrasal)),
      profiles
    ];
    for (const pool of fallbackPools) {
      if (!pool || options.length === 4) break;
      const start = stableRank(card.id) % pool.length;
      for (let offset = 0; offset < pool.length && options.length < 4; offset++) {
        collect(pool[(start + offset) % pool.length]);
      }
    }
    if (options.length !== 4) throw new Error('Insufficient English choices for ' + card.id);
    return options;
  }

  const cache = new Map();
  let corpus;
  return id => {
    if (cache.has(id)) return cache.get(id);
    corpus ??= buildIndex();
    const card = corpus.byId.get(id);
    if (!card) return undefined;
    const options = buildChoices(card, corpus);
    cache.set(id, options);
    return options;
  };
})();
