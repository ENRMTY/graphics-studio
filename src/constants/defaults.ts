import { FullTimeData, MatchdayData, StatsData, QuoteData } from "../types";

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
  bgImage: null,
  playerName: "",
  playerImage: null,
  competition: "",
  competitionIcon: null,
  competitionColor: "",
  stats: [],
  accentColor: "#C8102E",
};

export const DEFAULT_QUOTE: QuoteData = {
  type: "quote",
  bgImage: null,
  playerName: "",
  playerRole: "",
  playerImage: null,
  quoteText: "",
  competition: "",
  competitionIcon: null,
  competitionColor: "",
  accentColor: "#C8102E",
};
