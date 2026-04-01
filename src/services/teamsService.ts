import { api } from "./apiClient";
import type { Team } from "../types";
import { loadTeams, saveTeams } from "../utils/storage";

interface ApiTeam {
  id: string;
  name: string;
  logoUrl: string | null;
  logoPublicId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ListResponse {
  success: boolean;
  data: ApiTeam[];
}
interface SingleResponse {
  success: boolean;
  data: ApiTeam;
}

// map API shape to internal shape
function toTeam(t: ApiTeam): Team {
  return { id: t.id, name: t.name, logo: t.logoUrl };
}

export const teamsService = {
  async getAll(): Promise<Team[]> {
    try {
      const res = await api.get<ListResponse>("/api/teams");
      const backendTeams = res.data.map(toTeam);

      // local data first, then add any new ones from backend
      const localTeams = loadTeams();
      const localIds = new Set(localTeams.map((t) => t.id));

      const newFromBackend = backendTeams.filter((b) => !localIds.has(b.id));

      const merged = [...localTeams, ...newFromBackend];

      // save merged list back to local storage
      if (newFromBackend.length > 0 || localTeams.length === 0) {
        saveTeams(merged);
      }

      return merged;
    } catch (err) {
      console.warn(
        "Failed to fetch teams from backend, falling back to local storage",
        err,
      );
      return loadTeams();
    }
  },

  async create(name: string, logoFile?: File): Promise<Team> {
    const form = new FormData();
    form.append("name", name);
    if (logoFile) {
      form.append("logo", logoFile);
    }
    const res = await api.postForm<SingleResponse>("/api/teams", form);
    const newTeam = toTeam(res.data);

    // update local data
    const current = loadTeams();
    saveTeams([...current, newTeam]);

    return newTeam;
  },

  async update(id: string, name?: string, logoFile?: File): Promise<Team> {
    const form = new FormData();
    if (name) {
      form.append("name", name);
    }
    if (logoFile) {
      form.append("logo", logoFile);
    }
    const res = await api.patchForm<SingleResponse>(`/api/teams/${id}`, form);
    const updatedTeam = toTeam(res.data);

    // update in local storage
    const current = loadTeams();
    const updatedList = current.map((t) => (t.id === id ? updatedTeam : t));
    saveTeams(updatedList);

    return updatedTeam;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/teams/${id}`);

    // remove from local storage
    const current = loadTeams();
    saveTeams(current.filter((t) => t.id !== id));
  },
};
