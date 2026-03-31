import { api } from './apiClient';
import type { Competition } from '../types';

interface ApiCompetition {
  id: string;
  name: string;
  iconUrl: string | null;
  color: string;
  isDefault: boolean;
  sortOrder: number;
}

interface ListResponse   { success: boolean; data: ApiCompetition[] }
interface SingleResponse { success: boolean; data: ApiCompetition }

function toCompetition(c: ApiCompetition): Competition {
  return { id: c.id, name: c.name, icon: c.iconUrl, color: c.color };
}

export const competitionsService = {
  async getAll(): Promise<Competition[]> {
    const res = await api.get<ListResponse>('/api/competitions');
    return res.data.map(toCompetition);
  },

  async create(name: string, color: string, iconFile?: File): Promise<Competition> {
    const form = new FormData();
    form.append('name', name);
    form.append('color', color);
    if (iconFile) form.append('icon', iconFile);
    const res = await api.postForm<SingleResponse>('/api/competitions', form);
    return toCompetition(res.data);
  },

  async update(id: string, name?: string, color?: string, iconFile?: File): Promise<Competition> {
    const form = new FormData();
    if (name)     form.append('name', name);
    if (color)    form.append('color', color);
    if (iconFile) form.append('icon', iconFile);
    const res = await api.patchForm<SingleResponse>(`/api/competitions/${id}`, form);
    return toCompetition(res.data);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/competitions/${id}`);
  },
};
