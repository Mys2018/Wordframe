const normalize = value => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
function gapBatchSpec(body, topics, generationSpec) {
  const count = body.count;
  if (!Number.isInteger(count) || count < 1 || count > 20) return;
  if (typeof body.topic !== 'string' || (body.topic !== 'all-topics' && !topics.has(body.topic))) return;
  if (!Array.isArray(body.history) || body.history.length > 100 || !body.history.every(s => typeof s === 'string' && s.length <= 280 && !/[<>&\x00-\x1f\p{Script=Cyrillic}]/u.test(s))) return;
  const choices = body.topic === 'all-topics' ? [...topics.values()] : [topics.get(body.topic)];
  const allowed = new Map(choices.map(topic => [topic.id, topic]));
  const seen = new Set([...body.history, ...choices.flatMap(topic => topic.exercises.map(exercise => exercise.sentence))].map(normalize));
  return {
    instruction: `Create ${count + 2} distinct English grammar gap exercises for a Russian speaker. `
      + 'Use only the supplied topic IDs and apply each topic rule accurately. Vary situations, vocabulary, and sentence structures. '
      + 'Do not copy examples from excludedSentences. Return raw JSON {"cards":[{"topicId":"topic id",'
      + '"sentence":"English sentence with exactly one literal ___ gap","cue":"base word or phrase",'
      + '"answers":["one to three acceptable forms, preferred first"],"explanation":"brief Russian explanation"}]}. '
      + 'Include sufficient context for the answer, and do not reveal the answer elsewhere in the sentence.',
    input: {topics: choices.map(({id,title,level,rule}) => ({id,title,level,rule})), excludedSentences:body.history.slice(-50)},
    validate(data) {
      if (!Array.isArray(data?.cards)) return;
      const result = [];
      for (const item of data.cards.slice(0,count+2)) {
        if (!allowed.has(item?.topicId)) continue;
        const valid = generationSpec('gap', item.topicId)?.validate(item);
        if (!valid) continue;
        const normalized = normalize(valid.sentence);
        if (seen.has(normalized)) continue;
        seen.add(normalized);
        result.push({...valid, topicId:item.topicId});
        if (result.length === count) return {cards:result};
      }
    }
  };
}
module.exports = { gapBatchSpec };
