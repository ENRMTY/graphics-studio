export interface StatItem {
  id: string;
  label: string;
  value: string;
  enabled: boolean;
}

export interface StatsData {
  _id?: string;
  type: "stats";
  bgImage: string | null;
  bgImageFile?: File;
  playerName: string;
  playerImage: string | null;
  playerImageFile?: File;
  competition: string;
  competitionIcon: string | null;
  competitionColor: string;
  stats: StatItem[];
  accentColor: string;
}
