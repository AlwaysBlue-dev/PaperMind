export type YearWindow = {
  minYear: number;
  maxYear: number;
};

export type ResolvedYearWindow = YearWindow & {
  /** Distinct exam years with papers included in this analysis */
  yearsWithData: number[];
  /** Calendar years in the span with no paper (e.g. missing 2020) */
  excludedYears: number[];
};

/** Fallback calendar window when no paper years exist yet. */
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

/**
 * Pick the most recent N exam years that have papers, then span min→max.
 * Gaps inside the span (e.g. no 2020 paper) are listed in excludedYears.
 */
export function resolveYearWindowFromPaperYears(
  paperYears: number[],
  yearRange: number,
  maxYearCap: number
): ResolvedYearWindow {
  const eligible = [...new Set(paperYears)]
    .filter((y) => y <= maxYearCap)
    .sort((a, b) => b - a);

  const selected = eligible.slice(0, yearRange).sort((a, b) => a - b);

  if (selected.length === 0) {
    const fallback = getYearWindow(maxYearCap + 1, yearRange, maxYearCap);
    return {
      ...fallback,
      yearsWithData: [],
      excludedYears: [],
    };
  }

  const minYear = selected[0];
  const maxYear = selected[selected.length - 1];
  const selectedSet = new Set(selected);
  const excludedYears: number[] = [];
  for (let y = minYear; y <= maxYear; y++) {
    if (!selectedSet.has(y)) excludedYears.push(y);
  }

  return { minYear, maxYear, yearsWithData: selected, excludedYears };
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
