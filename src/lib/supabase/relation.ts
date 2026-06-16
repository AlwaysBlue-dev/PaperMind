/** Supabase embedded selects may return a single row or an array depending on schema inference. */
export function firstRelation<T>(rel: T | T[] | null | undefined): T | null {
  if (rel == null) return null;
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}
