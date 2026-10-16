import {
  FullTimeData,
  MatchdayData,
  StatsData,
  QuoteData,
  NewsData,
  LineupData,
  LineupPlayer,
  TransferData,
  GoalsData,
  GoalMomentData,
  MilestoneData,
  TableSpotData,
  NextUpData,
} from "@types";

export const DEFAULT_FT: FullTimeData = {
  type: "fulltime",
  bgImage: null,
  competition: "",
  competitionIcon: null,
  competitionColor: "",
  homeTeam: null,
  awayTeam: null,
  homeScore: 0,
  awayScore: 0,
  aggScoreHome: null,
  aggScoreAway: null,
  events: [],
};

export const DEFAULT_HT: FullTimeData = {
  type: "halftime",
  bgImage: null,
  competition: "",
  competitionIcon: null,
  competitionColor: "",
  homeTeam: null,
  awayTeam: null,
  homeScore: 0,
  awayScore: 0,
  aggScoreHome: null,
  aggScoreAway: null,
  events: [],
};

export const DEFAULT_MD: MatchdayData = {
  type: "matchday",
  bgImage: null,
  competition: "",
  competitionIcon: null,
  competitionColor: "",
  homeTeam: null,
  awayTeam: null,
  matchDate: "",
  kickoffTime: "",
  venue: "",
};

export const DEFAULT_STATS: StatsData = {
  type: "stats",
  layout: "big",
  bgImage: null,
  playerName: "",
  playerImage: null,
  matchContext: "",
  competition: "",
  competitionIcon: null,
  competitionColor: "",
  stats: [],
  statGap: 62,
  accentColor: "#C8102E",
};

export const DEFAULT_QUOTE: QuoteData = {
  type: "quote",
  layout: "bottom",
  quoteSize: "small",
  bgImage: null,
  playerName: "",
  playerRole: "",
  playerImage: null,
  quoteText: "",
  matchContext: "",
  competition: "",
  competitionIcon: null,
  competitionColor: "",
  accentColor: "#C8102E",
};

export const DEFAULT_NEWS: NewsData = {
  type: "news",
  bgImage: null,
  headline: "QUALIFIED",
  caption: "",
  competition: "",
  competitionIcon: null,
  competitionColor: "",
};

export const DEFAULT_TRANSFER: TransferData = {
  type: "transfer",
  bgImage: null,
  playerName: "",
  fromTeam: null,
  toTeam: null,
  transferKind: "transfer",
  fee: "",
  currency: "£",
  status: "confirmed",
};

export const DEFAULT_GOALS: GoalsData = {
  type: "goals",
  bgImage: null,
  count: 3,
  minutes: ["24", "37", "66", "", "", ""],
  competition: "",
  competitionIcon: null,
  competitionColor: "",
  team: null,
};

const blankComp = {
  competition: "",
  competitionIcon: null,
  competitionColor: "",
};

export const DEFAULT_GOAL: GoalMomentData = {
  type: "goal",
  bgImage: null,
  playerName: "",
  minute: "24",
  ourScore: "1",
  theirScore: "0",
  opponent: "",
  ...blankComp,
};

export const DEFAULT_MILESTONE: MilestoneData = {
  type: "milestone",
  bgImage: null,
  playerName: "",
  value: "50",
  label: "Premier League goals",
  ...blankComp,
};

export const DEFAULT_TABLE: TableSpotData = {
  type: "table",
  bgImage: null,
  position: "1",
  points: "45",
  gd: "+18",
  ...blankComp,
};

export const DEFAULT_NEXT: NextUpData = {
  type: "next",
  bgImage: null,
  opponent: "",
  opponentLogo: null,
  kickoff: "20:00",
  matchDate: "",
  ...blankComp,
};

const GK_Y = 0.88;
const DEF_Y = 0.72;
const MID_Y = 0.45;
const ATT_Y = 0.28;
const FWD_Y = 0.16;

function blankRow(positions: string[], y: number): LineupPlayer[] {
  const n = positions.length;
  return positions.map((pos, i) => ({
    id: `p-${pos}-${i}-${Date.now()}`,
    name: "",
    number: null,
    position: pos,
    x: n === 1 ? 0.5 : 0.15 + (i / (n - 1)) * 0.7,
    y,
    isCaptain: false,
  }));
}

export function buildDefaultLineup(formation = "4-3-3"): LineupPlayer[] {
  switch (formation) {
    case "4-4-2":
      return [
        ...blankRow(["GK"], GK_Y),
        ...blankRow(["LB", "CB", "CB", "RB"], DEF_Y),
        ...blankRow(["LM", "CM", "CM", "RM"], MID_Y),
        ...blankRow(["ST", "ST"], ATT_Y),
      ];
    case "4-2-3-1":
      return [
        ...blankRow(["GK"], GK_Y),
        ...blankRow(["LB", "CB", "CB", "RB"], DEF_Y),
        {
          id: `p-DM-0-${Date.now()}`,
          name: "",
          number: null,
          position: "DM",
          x: 0.35,
          y: 0.53,
          isCaptain: false,
        },
        {
          id: `p-DM-1-${Date.now()}`,
          name: "",
          number: null,
          position: "DM",
          x: 0.64,
          y: 0.53,
          isCaptain: false,
        },
        ...blankRow(["LAM", "CAM", "RAM"], 0.36),
        ...blankRow(["ST"], FWD_Y),
      ];
    case "3-4-3":
      return [
        ...blankRow(["GK"], GK_Y),
        ...blankRow(["CB", "CB", "CB"], DEF_Y),
        ...blankRow(["LWB", "CM", "CM", "RWB"], MID_Y),
        ...blankRow(["LW", "ST", "RW"], FWD_Y),
      ];
    case "3-5-2":
      return [
        ...blankRow(["GK"], GK_Y),
        ...blankRow(["CB", "CB", "CB"], DEF_Y),
        ...blankRow(["LWB", "CM", "CM", "CM", "RWB"], MID_Y),
        ...blankRow(["ST", "ST"], ATT_Y),
      ];
    case "5-4-1":
      return [
        ...blankRow(["GK"], GK_Y),
        ...blankRow(["LWB", "CB", "CB", "CB", "RWB"], DEF_Y),
        ...blankRow(["LM", "CM", "CM", "RM"], MID_Y),
        ...blankRow(["ST"], FWD_Y),
      ];
    default: // 4-3-3
      return [
        ...blankRow(["GK"], GK_Y),
        ...blankRow(["LB", "CB", "CB", "RB"], DEF_Y),
        ...blankRow(["CM", "CM", "CM"], MID_Y),
        ...blankRow(["LW", "ST", "RW"], FWD_Y),
      ];
  }
}

export const DEFAULT_LINEUP: LineupData = {
  type: "lineup",
  bgImage: null,
  formation: "4-3-3",
  manager: "",
  competition: "",
  competitionIcon: null,
  competitionColor: "#C8102E",
  homeTeam: null,
  awayTeam: null,
  players: buildDefaultLineup("4-3-3"),
  subs: [],
};
