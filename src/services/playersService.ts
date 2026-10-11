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
  photoUrl?: string | null;
  lastUsed: string;
}

interface ListResponse {
  success: boolean;
  data: ApiPlayer[];
}

async function fileToHeadshot(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return URL.createObjectURL(file);
  const scale = Math.max(size / bitmap.width, size / bitmap.height);
  const w = bitmap.width * scale;
  const h = bitmap.height * scale;
  ctx.drawImage(bitmap, (size - w) / 2, (size - h) / 2, w, h);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}

function remember(player: SavedPlayer): void {
  const merged = mergeSavedPlayers(loadSavedPlayers(), [player]);
  saveSavedPlayersLocal(merged);
}

export const playersService = {
  async getAll(): Promise<SavedPlayer[]> {
    const local = loadSavedPlayers();
    try {
      const res = await api.get<ListResponse>("/api/players");
      const serverPlayers: SavedPlayer[] = res.data.map((p: ApiPlayer) => ({
        name: p.name,
        number: p.number,
        position: p.position,
        photoUrl: p.photoUrl ?? null,
        lastUsed: p.lastUsed,
      }));
      const merged = mergeSavedPlayers(local, serverPlayers);
      saveSavedPlayersLocal(merged);
      return merged;
    } catch {
      return local;
    }
  },

  async saveAfterExport(
    players: LineupPlayer[],
    subs: LineupPlayer[],
    formation: string,
    manager: string,
  ): Promise<void> {
    const allPlayers = [...players, ...subs].filter((p) => p.name.trim());
    saveLineupSnapshot(players, subs, formation, manager);
    const existing = loadSavedPlayers();
    const merged = mergeSavedPlayers(existing, allPlayers);
    saveSavedPlayersLocal(merged);
    api
      .post("/api/players/bulk", {
        players: allPlayers.map((p) => ({
          name: p.name,
          number: p.number,
          position: p.position,
        })),
      })
      .catch(() => {});
  },

  async uploadPhoto(
    name: string,
    file: File,
    meta: { number: number | null; position: string },
  ): Promise<SavedPlayer> {
    const localUrl = await fileToHeadshot(file);
    const local: SavedPlayer = {
      name: name.trim(),
      number: meta.number,
      position: meta.position || "",
      photoUrl: localUrl,
      lastUsed: new Date().toISOString(),
    };
    remember(local);

    try {
      const form = new FormData();
      form.append("name", local.name);
      form.append("position", local.position);
      if (local.number !== null) {
        form.append("number", String(local.number));
      }
      form.append("photo", file);
      const res = await api.postForm<{ success: boolean; data: ApiPlayer }>(
        "/api/players/photo",
        form,
      );
      if (res.data?.photoUrl) {
        const remote: SavedPlayer = {
          ...local,
          name: res.data.name || local.name,
          number: res.data.number ?? local.number,
          position: res.data.position || local.position,
          photoUrl: res.data.photoUrl,
          lastUsed: res.data.lastUsed || local.lastUsed,
        };
        remember(remote);
        return remote;
      }
    } catch {
      // backend down — local headshot is already saved
    }
    return local;
  },
};
