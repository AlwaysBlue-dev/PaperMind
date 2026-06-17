import { tokenize } from "@/lib/prediction/keywords";

/** Build IDF weights from a corpus of texts. */
export function buildIdf(corpus: string[]): Map<string, number> {
  const docCount = corpus.length;
  const df = new Map<string, number>();

  for (const text of corpus) {
    const seen = new Set(tokenize(text));
    for (const term of seen) {
      df.set(term, (df.get(term) ?? 0) + 1);
    }
  }

  const idf = new Map<string, number>();
  for (const [term, count] of df) {
    idf.set(term, Math.log((docCount + 1) / (count + 1)) + 1);
  }
  return idf;
}

function toTfidfVector(
  text: string,
  idf: Map<string, number>
): Map<string, number> {
  const tokens = tokenize(text);
  const tf = new Map<string, number>();
  for (const t of tokens) {
    tf.set(t, (tf.get(t) ?? 0) + 1);
  }
  const vec = new Map<string, number>();
  for (const [term, count] of tf) {
    const weight = idf.get(term);
    if (weight) vec.set(term, count * weight);
  }
  return vec;
}

/** Cosine similarity between two texts using TF-IDF vectors. */
export function textSimilarity(
  a: string,
  b: string,
  idf: Map<string, number>
): number {
  const va = toTfidfVector(a, idf);
  const vb = toTfidfVector(b, idf);
  if (va.size === 0 || vb.size === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const [term, weight] of va) {
    normA += weight * weight;
    if (vb.has(term)) dot += weight * (vb.get(term) ?? 0);
  }
  for (const weight of vb.values()) {
    normB += weight * weight;
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
