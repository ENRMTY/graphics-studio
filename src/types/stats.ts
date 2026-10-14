export interface StatItem {
  id: string;
  label: string;
  value: string;
  enabled: boolean;
}

export interface StatsData {
  _id?: string;
  type: "stats";
  layout?: "classic" | "overlay" | "big";
  bgImage: string | null;
  bgImageFile?: File;
  playerName: string;
  playerImage: string | null;
  playerImageFile?: File;
  matchContext?: string;
  competition: string;
  competitionIcon: string | null;
  competitionColor: string;
  stats: StatItem[];
  statGap?: number;
  accentColor: string;
}
