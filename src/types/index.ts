export type EventType = "goal" | "penalty" | "red" | "og";
export type EventSide = "home" | "away";

export interface MatchEvent {
  id: string;
  type: EventType;
  player: string;
  minute: string;
  side: EventSide;
}

export interface Team {
  id: string;
  name: string;
  logo: string | null; // base64 or URL
}

export interface FullTimeData {
  _id?: string; // server-assigned UUID — present after first save
  type: "fulltime" | "halftime";
  bgImage: string | null;
  bgImageFile?: File; // held in memory until uploaded, then cleared
  competition: string;
  competitionIcon: string | null;
  competitionColor: string;
  homeTeam: Team | null;
  awayTeam: Team | null;
  homeScore: number;
  awayScore: number;
  events: MatchEvent[];
}

export interface MatchdayData {
  _id?: string;
  type: "matchday";
  bgImage: string | null;
  bgImageFile?: File;
  competition: string;
  competitionIcon: string | null;
  competitionColor: string;
  homeTeam: Team | null;
  awayTeam: Team | null;
  matchDate: string;
  kickoffTime: string;
  venue: string;
}

export interface StatItem {
  id: string;
  label: string;
  value: string;
  enabled: boolean;
}

export interface StatsData {
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

export interface QuoteData {
  type: "quote";
  bgImage: string | null;
  bgImageFile?: File;
  playerName: string;
  playerRole: string;
  playerImage: string | null;
  playerImageFile?: File;
  quoteText: string;
  competition: string;
  competitionIcon: string | null;
  competitionColor: string;
  accentColor: string;
}

export type ViewMode =
  | "ft"
  | "ht"
  | "md"
  | "stats"
  | "quote"
  | "teams"
  | "comps";

export interface Competition {
  id: string;
  name: string;
  icon: string | null;
  color: string;
}
