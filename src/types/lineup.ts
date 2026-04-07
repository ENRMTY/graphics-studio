import { Team } from "./team";

export interface LineupPlayer {
  id: string;
  name: string;
  number: number | null;
  position: string;
  // fractional pitch coords
  x: number;
  y: number;
  isCaptain?: boolean;
}

export interface LineupData {
  type: "lineup";
  bgImage: string | null;
  bgImageFile?: File;
  formation: string;
  manager: string;
  competition: string;
  competitionIcon: string | null;
  competitionColor: string;
  dotColor?: string;
  homeTeam: Team | null;
  awayTeam: Team | null;
  players: LineupPlayer[];
  subs: LineupPlayer[];
}
