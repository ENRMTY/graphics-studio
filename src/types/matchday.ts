import { LogoStyle } from "./common";
import { Team } from "./team";

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
  logoStyle?: LogoStyle;
}
