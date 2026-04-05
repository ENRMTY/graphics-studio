import { FullTimeData, MatchdayData, StatsData, QuoteData, LineupData, LineupPlayer } from "@types";

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

const GK_Y = 0.88;
const DEF_Y = 0.72;
const MID_Y = 0.52;
const ATT_Y = 0.28;
const FWD_Y = 0.16;

function row(
  names: string[],
  numbers: number[],
  positions: string[],
  y: number,
): LineupPlayer[] {
  const n = names.length;
  return names.map((name, i) => ({
    id: `p-${positions[i]}-${i}`,
    name,
    number: numbers[i] ?? null,
    position: positions[i],
    x: n === 1 ? 0.5 : 0.15 + (i / (n - 1)) * 0.7,
    y,
  }));
}

export function buildDefaultLineup(formation = "4-3-3"): LineupPlayer[] {
  switch (formation) {
    case "4-4-2":
      return [
        ...row(["Kelleher"], [62], ["GK"], GK_Y),
        ...row(
          ["Alexander-Arnold", "Konaté", "Van Dijk", "Robertson"],
          [66, 5, 4, 26],
          ["RB", "CB", "CB", "LB"],
          DEF_Y,
        ),
        ...row(
          ["Salah", "Mac Allister", "Gravenberch", "Díaz"],
          [11, 10, 38, 7],
          ["RM", "CM", "CM", "LM"],
          MID_Y,
        ),
        ...row(["Núñez", "Jota"], [9, 20], ["ST", "ST"], ATT_Y),
      ];
    case "4-2-3-1":
      return [
        ...row(["Kelleher"], [62], ["GK"], GK_Y),
        ...row(
          ["Alexander-Arnold", "Konaté", "Van Dijk", "Robertson"],
          [66, 5, 4, 26],
          ["RB", "CB", "CB", "LB"],
          DEF_Y,
        ),
        ...row(["Gravenberch", "Mac Allister"], [38, 10], ["DM", "DM"], 0.62),
        ...row(
          ["Salah", "Szoboszlai", "Díaz"],
          [11, 8, 7],
          ["RAM", "CAM", "LAM"],
          MID_Y,
        ),
        ...row(["Núñez"], [9], ["ST"], FWD_Y),
      ];
    case "3-4-3":
      return [
        ...row(["Kelleher"], [62], ["GK"], GK_Y),
        ...row(
          ["Konaté", "Van Dijk", "Quansah"],
          [5, 4, 78],
          ["CB", "CB", "CB"],
          DEF_Y,
        ),
        ...row(
          ["Alexander-Arnold", "Gravenberch", "Mac Allister", "Robertson"],
          [66, 38, 10, 26],
          ["RWB", "CM", "CM", "LWB"],
          MID_Y,
        ),
        ...row(
          ["Salah", "Núñez", "Díaz"],
          [11, 9, 7],
          ["RW", "ST", "LW"],
          FWD_Y,
        ),
      ];
    default: // 4-3-3
      return [
        ...row(["Kelleher"], [62], ["GK"], GK_Y),
        ...row(
          ["Alexander-Arnold", "Konaté", "Van Dijk", "Robertson"],
          [66, 5, 4, 26],
          ["RB", "CB", "CB", "LB"],
          DEF_Y,
        ),
        ...row(
          ["Salah", "Gravenberch", "Díaz"],
          [11, 38, 7],
          ["RM", "CM", "LM"],
          MID_Y,
        ),
        ...row(
          ["Szoboszlai", "Núñez", "Jota"],
          [8, 9, 20],
          ["RW", "ST", "LW"],
          FWD_Y,
        ),
      ];
  }
}

export const DEFAULT_LINEUP: LineupData = {
  type: "lineup",
  bgImage: null,
  formation: "4-3-3",
  manager: "Arne Slot",
  competition: "",
  competitionIcon: null,
  competitionColor: "#C8102E",
  homeTeam: null,
  awayTeam: null,
  players: buildDefaultLineup("4-3-3"),
  subs: [
    { id: "sub-0", name: "Alisson", number: 1, position: "GK", x: 0, y: 0 },
    { id: "sub-1", name: "Tsimikas", number: 21, position: "LB", x: 0, y: 0 },
    { id: "sub-2", name: "Quansah", number: 78, position: "CB", x: 0, y: 0 },
    { id: "sub-3", name: "Bajcetic", number: 43, position: "CM", x: 0, y: 0 },
    { id: "sub-4", name: "Endo", number: 3, position: "CM", x: 0, y: 0 },
  ],
};
