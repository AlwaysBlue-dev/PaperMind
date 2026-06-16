"use client";

import { useEffect, useState } from "react";
import { STATS_FALLBACK, type StatsResponse } from "@/lib/types/stats";

export function useStats() {
  const [stats, setStats] = useState<StatsResponse>(STATS_FALLBACK);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data: StatsResponse) => {
        setStats(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  return { stats, loaded };
}

export function TrustLine() {
  const { stats } = useStats();

  return (
    <p className="text-sm text-foreground-muted">
      <span className="font-medium text-foreground">
        {stats.questions.toLocaleString()}
      </span>{" "}
      questions analysed across{" "}
      <span className="font-medium text-foreground">{stats.boards}</span> boards
    </p>
  );
}
