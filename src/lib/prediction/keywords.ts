const STOPWORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "had",
  "her", "was", "one", "our", "out", "day", "get", "has", "him", "his",
  "how", "its", "may", "new", "now", "old", "see", "two", "way", "who",
  "boy", "did", "she", "use", "her", "that", "this", "with", "from",
  "they", "been", "have", "were", "said", "each", "which", "their",
  "what", "about", "into", "than", "them", "then", "these", "will",
  "your", "when", "make", "like", "time", "very", "just", "know",
  "take", "come", "made", "find", "long", "down", "most", "over",
  "such", "give", "only", "also", "back", "after", "well", "many",
  "must", "being", "through", "where", "much", "should", "would",
  "could", "there", "other", "while", "during", "between", "under",
  "above", "below", "upon", "within", "without", "against", "along",
  "across", "around", "before", "behind", "beside", "beyond", "inside",
  "outside", "toward", "towards", "explain", "describe", "define",
  "state", "write", "calculate", "derive", "prove", "show", "find",
  "question", "answer", "marks", "mark",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));
}

export function sharedSignificantWords(a: string[], b: string[]): number {
  const setB = new Set(b);
  return a.filter((w) => setB.has(w)).length;
}
