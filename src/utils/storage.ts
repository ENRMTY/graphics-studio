import type { Team, Competition } from "@types";
import type { LineupPlayer } from "../types/lineup";

const TEAMS_KEY = "lfc_teams_v3";
const COMPETITIONS_KEY = "lfc_competitions_v1";
const PLAYERS_KEY = "lfc_players_v1";
const LINEUP_SNAPSHOT_KEY = "lfc_lineup_snapshot_v1";
const DOT_COLORS_KEY = "lfc_dot_colors_v1";

// teams
export const loadTeams = (): Team[] => {
  try {
    const saved = JSON.parse(localStorage.getItem(TEAMS_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

export const saveTeams = (teams: Team[]): void => {
  // strip logoFile before saving, as it can't be serialised and is only needed temporarily while editing
  const serialisable = teams.map(({ logoFile: _f, ...rest }) => rest);
  localStorage.setItem(TEAMS_KEY, JSON.stringify(serialisable));
};

// competitions
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

// saved players for quick access when editing lineup
export interface SavedPlayer {
  name: string;
  number: number | null;
  position: string;
  lastUsed: string;
}

export const loadSavedPlayers = (): SavedPlayer[] => {
  try {
    const raw = localStorage.getItem(PLAYERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveSavedPlayersLocal = (players: SavedPlayer[]): void => {
  localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
};

// merges played players into saved players list, updating lastUsed and sorting by it
export const mergeSavedPlayers = (
  existing: SavedPlayer[],
  played: Pick<LineupPlayer, "name" | "number" | "position">[],
): SavedPlayer[] => {
  const map = new Map<string, SavedPlayer>(
    existing.map((p) => [p.name.toLowerCase(), p]),
  );
  const now = new Date().toISOString();
  for (const p of played) {
    if (!p.name.trim()) {
      continue;
    }

    const key = p.name.toLowerCase();
    map.set(key, {
      name: p.name,
      number: p.number,
      position: p.position,
      lastUsed: now,
    });
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime(),
  );
};

// lineup snapshot
export const saveLineupSnapshot = (
  players: LineupPlayer[],
  subs: LineupPlayer[],
  formation: string,
  manager: string,
): void => {
  try {
    localStorage.setItem(
      LINEUP_SNAPSHOT_KEY,
      JSON.stringify({ players, subs, formation, manager }),
    );
  } catch {
    // ignore quota errors
  }
};

export const loadLineupSnapshot = (): {
  players: LineupPlayer[];
  subs: LineupPlayer[];
  formation: string;
  manager: string;
} | null => {
  try {
    const raw = localStorage.getItem(LINEUP_SNAPSHOT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// dot colors palette
export const loadDotColors = (): string[] => {
  try {
    const raw = localStorage.getItem(DOT_COLORS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveDotColors = (colors: string[]): void => {
  localStorage.setItem(DOT_COLORS_KEY, JSON.stringify(colors));
};
