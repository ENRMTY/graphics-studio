import type { Team, Competition } from "@types";
import type { NewsData } from "../types/news";
import type { GoalsData } from "../types/goals";
import type { LineupPlayer, LineupData } from "../types/lineup";

// key names for local storage
const TEAMS_KEY = "lfc_teams_v3";
const COMPETITIONS_KEY = "lfc_competitions_v1";
const PLAYERS_KEY = "lfc_players_v1";
const LINEUP_SNAPSHOT_KEY = "lfc_lineup_snapshot_v1";
const DOT_COLORS_KEY = "lfc_dot_colors_v1";
const NEWS_KEY = "lfc_news_v1";
const GOALS_KEY = "lfc_goals_v1";

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

export const loadNewsLocal = (): Partial<NewsData> | null => {
  try {
    const raw = localStorage.getItem(NEWS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<NewsData>;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

export const saveNewsLocal = (data: NewsData): void => {
  const { bgImageFile: _file, ...rest } = data;
  try {
    localStorage.setItem(NEWS_KEY, JSON.stringify(rest));
  } catch {
    const { bgImage: _img, ...withoutPhoto } = rest;
    try {
      localStorage.setItem(NEWS_KEY, JSON.stringify(withoutPhoto));
    } catch {
      // photo was too large and the rest still didn't fit
    }
  }
};

export const loadGoalsLocal = (): Partial<GoalsData> | null => {
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GoalsData>;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

export const saveGoalsLocal = (data: GoalsData): void => {
  saveBlob(GOALS_KEY, data);
};

export const loadBlob = <T>(key: string): Partial<T> | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<T>;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

export const saveBlob = (
  key: string,
  data: { bgImageFile?: File; bgImage?: string | null },
) => {
  const { bgImageFile: _file, ...rest } = data;
  try {
    localStorage.setItem(key, JSON.stringify(rest));
  } catch {
    const { bgImage: _img, ...withoutPhoto } = rest;
    try {
      localStorage.setItem(key, JSON.stringify(withoutPhoto));
    } catch {
      // photo was too large
    }
  }
};

export const GOAL_KEY = "lfc_goal_v1";
export const MILESTONE_KEY = "lfc_milestone_v1";
export const TABLE_KEY = "lfc_table_v1";
export const NEXT_KEY = "lfc_next_v1";

// saved players for quick access when editing lineup
export interface SavedPlayer {
  name: string;
  number: number | null;
  position: string;
  lastUsed: string;
  photoUrl?: string | null;
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
  played: Pick<LineupPlayer, "name" | "number" | "position" | "photoUrl">[],
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
    const prev = map.get(key);
    map.set(key, {
      name: p.name,
      number: p.number,
      position: p.position,
      photoUrl: p.photoUrl ?? prev?.photoUrl ?? null,
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
  rest?: Partial<LineupData>,
): void => {
  const prev = loadLineupSnapshot() ?? {};
  const { bgImageFile: _file, ...extra } = rest ?? {};
  const payload = {
    ...prev,
    ...extra,
    players,
    subs,
    formation,
    manager,
  };
  try {
    localStorage.setItem(LINEUP_SNAPSHOT_KEY, JSON.stringify(payload));
  } catch {
    const { bgImage: _img, ...withoutPhoto } = payload as {
      bgImage?: string | null;
    };
    try {
      localStorage.setItem(LINEUP_SNAPSHOT_KEY, JSON.stringify(withoutPhoto));
    } catch {
      // photo was too large
    }
  }
};

export const loadLineupSnapshot = (): {
  players: LineupPlayer[];
  subs: LineupPlayer[];
  formation: string;
  manager: string;
  competition?: string;
  competitionIcon?: string | null;
  competitionColor?: string;
  dotColor?: string;
  homeTeam?: { id: string; name: string; logo: string | null } | null;
  awayTeam?: { id: string; name: string; logo: string | null } | null;
  bgImage?: string | null;
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
