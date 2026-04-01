import { api } from "./apiClient";
import type { Competition } from "../types";
import { loadCompetitions, saveCompetitions } from "../utils/storage";

interface ApiCompetition {
  id: string;
  name: string;
  iconUrl: string | null;
  color: string;
  isDefault: boolean;
  sortOrder: number;
}

interface ListResponse {
  success: boolean;
  data: ApiCompetition[];
}
interface SingleResponse {
  success: boolean;
  data: ApiCompetition;
}

function toCompetition(c: ApiCompetition): Competition {
  return { id: c.id, name: c.name, icon: c.iconUrl, color: c.color };
}

export const competitionsService = {
  async getAll(): Promise<Competition[]> {
    try {
      const res = await api.get<ListResponse>("/api/competitions");
      const backendComps = res.data.map(toCompetition);

      // local data first, then add any new ones from backend
      const localComps = loadCompetitions();
      const localIds = new Set(localComps.map((c) => c.id));

      const newFromBackend = backendComps.filter((b) => !localIds.has(b.id));

      const merged = [...localComps, ...newFromBackend];

      // save merged list back to local storage
      if (newFromBackend.length > 0 || localComps.length === 0) {
        saveCompetitions(merged);
      }

      return merged;
    } catch (err) {
      console.warn(
        "Failed to fetch competitions from backend, using local only",
        err,
      );
      return loadCompetitions();
    }
  },

  async create(
    name: string,
    color: string,
    iconFile?: File,
  ): Promise<Competition> {
    const form = new FormData();
    form.append("name", name);
    form.append("color", color);
    if (iconFile) {
      form.append("icon", iconFile);
    }
    const res = await api.postForm<SingleResponse>("/api/competitions", form);
    const newComp = toCompetition(res.data);

    // update local data
    const current = loadCompetitions();
    saveCompetitions([...current, newComp]);

    return newComp;
  },

  async update(
    id: string,
    name?: string,
    color?: string,
    iconFile?: File,
  ): Promise<Competition> {
    const form = new FormData();
    if (name) {
      form.append("name", name);
    }
    if (color) {
      form.append("color", color);
    }
    if (iconFile) {
      form.append("icon", iconFile);
    }

    const res = await api.patchForm<SingleResponse>(
      `/api/competitions/${id}`,
      form,
    );
    const updated = toCompetition(res.data);

    // update in local storage
    const current = loadCompetitions();
    const updatedList = current.map((c) => (c.id === id ? updated : c));
    saveCompetitions(updatedList);

    return updated;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/competitions/${id}`);

    // remove from local storage
    const current = loadCompetitions();
    saveCompetitions(current.filter((c) => c.id !== id));
  },
};
