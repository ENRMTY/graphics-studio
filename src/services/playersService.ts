import { api } from "./apiClient";
import {
  loadSavedPlayers,
  saveSavedPlayersLocal,
  mergeSavedPlayers,
  saveLineupSnapshot,
  type SavedPlayer,
} from "../utils/storage";
import type { LineupPlayer } from "../types/lineup";

interface ApiPlayer {
  name: string;
  number: number | null;
  position: string;
  lastUsed: string;
}

interface ListResponse {
  success: boolean;
  data: ApiPlayer[];
}

export const playersService = {
  // load saved players - local-first, background sync from server
  async getAll(): Promise<SavedPlayer[]> {
    const local = loadSavedPlayers();

    // server sync
    api
      .get<ListResponse>("/api/players")
      .then((res) => {
        const serverPlayers: SavedPlayer[] = res.data.map((p: ApiPlayer) => ({
          name: p.name,
          number: p.number,
          position: p.position,
          lastUsed: p.lastUsed,
        }));
        const merged = mergeSavedPlayers(local, serverPlayers);
        saveSavedPlayersLocal(merged);
      })
      .catch(() => {
        // use local data if server fails
      });

    return local;
  },

  // persist players after export
  // saves snapshot locally immediately, then pushes to server in background
  async saveAfterExport(
    players: LineupPlayer[],
    subs: LineupPlayer[],
    formation: string,
    manager: string,
  ): Promise<void> {
    const allPlayers = [...players, ...subs].filter((p) => p.name.trim());

    // save lineup snapshot locally for next-visit restore
    saveLineupSnapshot(players, subs, formation, manager);

    // merge players into local registry immediately
    const existing = loadSavedPlayers();
    const merged = mergeSavedPlayers(existing, allPlayers);
    saveSavedPlayersLocal(merged);

    // push to server in background
    api
      .post("/api/players/bulk", {
        players: allPlayers.map((p) => ({
          name: p.name,
          number: p.number,
          position: p.position,
        })),
      })
      .catch(() => {
        // local data is already updated so we can ignore server failures
      });
  },
};
