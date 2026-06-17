/** Next exam season the app targets (e.g. 2027 when run in 2026). */
export function getDefaultTargetYear(): number {
  return new Date().getFullYear() + 1;
}

export function parseTargetYear(raw: string | null | undefined): number | null {
  if (!raw?.trim()) return null;
  const year = parseInt(raw, 10);
  if (Number.isNaN(year) || year < 2000 || year > 2100) return null;
  return year;
}

/** URL param overrides default next-exam year. */
export function resolveTargetYear(urlParam?: string | null): number {
  const fromUrl = parseTargetYear(urlParam);
  if (fromUrl != null) return fromUrl;
  return getDefaultTargetYear();
}
