import type { Team, Competition } from "../types";

const TEAMS_KEY = "lfc_teams_v3";
const COMPETITIONS_KEY = "lfc_competitions_v1";

export const loadTeams = (): Team[] => {
  try {
    const saved = JSON.parse(localStorage.getItem(TEAMS_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
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
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

export const saveCompetitions = (comps: Competition[]): void => {
  localStorage.setItem(COMPETITIONS_KEY, JSON.stringify(comps));
};
