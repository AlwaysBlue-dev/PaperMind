export type StatsResponse = {
  papers: number;
  questions: number;
  predictions: number;
  boards: number;
};

export const STATS_FALLBACK: StatsResponse = {
  papers: 2847,
  questions: 45210,
  predictions: 12840,
  boards: 14,
};
