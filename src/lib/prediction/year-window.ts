export type YearWindow = {
  minYear: number;
  maxYear: number;
};

/** Inclusive analysis window anchored to the latest available paper year. */
export function getYearWindow(
  targetYear: number,
  yearRange: number,
  latestDataYear?: number | null
): YearWindow {
  const examMaxYear = targetYear - 1;
  const maxYear =
    latestDataYear != null
      ? Math.min(examMaxYear, latestDataYear)
      : examMaxYear;
  const minYear = maxYear - yearRange + 1;
  return { minYear, maxYear };
}

export function isYearInRange(
  year: number,
  minYear: number,
  maxYear: number
): boolean {
  return year >= minYear && year <= maxYear;
}

export function filterByYearRange<T extends { year: number }>(
  items: T[],
  minYear: number,
  maxYear: number
): T[] {
  return items.filter((q) => isYearInRange(q.year, minYear, maxYear));
}
