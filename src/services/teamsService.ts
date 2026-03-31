import { api } from "./apiClient";
import type { Team } from "../types";

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
    const res = await api.get<ListResponse>("/api/teams");
    return res.data.map(toTeam);
  },

  async create(name: string, logoFile?: File): Promise<Team> {
    const form = new FormData();
    form.append("name", name);
    if (logoFile) form.append("logo", logoFile);
    const res = await api.postForm<SingleResponse>("/api/teams", form);
    return toTeam(res.data);
  },

  async update(id: string, name?: string, logoFile?: File): Promise<Team> {
    const form = new FormData();
    if (name) form.append("name", name);
    if (logoFile) form.append("logo", logoFile);
    const res = await api.patchForm<SingleResponse>(`/api/teams/${id}`, form);
    return toTeam(res.data);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/teams/${id}`);
  },
};
