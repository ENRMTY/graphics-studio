import { LogoStyle } from "./common";
import { Team } from "./team";
import { MatchEvent } from "./matchEvent";

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
  logoStyle?: LogoStyle;
}
