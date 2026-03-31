export type EventType = 'goal' | 'penalty' | 'red' | 'og';
export type EventSide = 'home' | 'away';

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
  type: 'fulltime';
  bgImage: string | null;
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
  type: 'matchday';
  bgImage: string | null;
  competition: string;
  competitionIcon: string | null;
  competitionColor: string;
  homeTeam: Team | null;
  awayTeam: Team | null;
  matchDate: string;
  kickoffTime: string;
  venue: string;
}

export type ViewMode = 'ft' | 'md' | 'teams' | 'comps';

export interface Competition {
  id: string;
  name: string;
  icon: string | null; // base64
  color: string;       // accent hex
}
