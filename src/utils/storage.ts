import type { Team, Competition } from "../types";

const TEAMS_KEY = "lfc_teams_v3";
const COMPETITIONS_KEY = "lfc_competitions_v1";

export const loadTeams = (): Team[] => {
  try {
    return JSON.parse(localStorage.getItem(TEAMS_KEY) || "[]");
  } catch {
    return [];
  }
};

export const saveTeams = (teams: Team[]): void => {
  localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
};

export const loadCompetitions = (): Competition[] => {
  try {
    const saved = JSON.parse(
      localStorage.getItem(COMPETITIONS_KEY) || "[]",
    ) as Competition[];
    // merge with defaults, user data wins
    const savedIds = new Set(saved.map((c) => c.id));
    const merged = [
      ...DEFAULT_COMPETITIONS.filter((d) => !savedIds.has(d.id)),
      ...saved,
    ];
    return merged;
  } catch {
    return DEFAULT_COMPETITIONS;
  }
};

export const saveCompetitions = (comps: Competition[]): void => {
  localStorage.setItem(COMPETITIONS_KEY, JSON.stringify(comps));
};

export const DEFAULT_COMPETITIONS: Competition[] = [
  { id: "pl", name: "Premier League", icon: null, color: "#3d195b" },
  { id: "ucl", name: "Champions League", icon: null, color: "#001489" },
  { id: "fac", name: "FA Cup", icon: null, color: "#C8102E" },
  { id: "cc", name: "Carabao Cup", icon: null, color: "#00A550" },
  { id: "uel", name: "Europa League", icon: null, color: "#F57F17" },
  { id: "fri", name: "Friendly", icon: null, color: "#555558" },
];
