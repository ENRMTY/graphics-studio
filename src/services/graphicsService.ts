import { api } from "./apiClient";
import type { FullTimeData, MatchdayData } from "../types";

// API shapes
export interface ApiGraphic {
  id: string;
  graphicType: "fulltime" | "matchday";
  status: "draft" | "published";
  bgImageUrl: string | null;
  competitionId: string | null;
  competitionName: string | null;
  competitionIconUrl: string | null;
  competitionColor: string | null;
  homeTeamId: string | null;
  homeTeamName: string | null;
  homeTeamLogoUrl: string | null;
  awayTeamId: string | null;
  awayTeamName: string | null;
  awayTeamLogoUrl: string | null;
  homeScore: number | null;
  awayScore: number | null;
  events: FullTimeData["events"];
  matchDate: string | null;
  kickoffTime: string | null;
  venue: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SingleResponse {
  success: boolean;
  data: ApiGraphic;
}
interface ListResponse {
  success: boolean;
  total: number;
  data: ApiGraphic[];
}
interface DraftsResponse {
  success: boolean;
  data: { fulltime: ApiGraphic | null; matchday: ApiGraphic | null };
}

// mappers
export function apiGraphicToFT(g: ApiGraphic): FullTimeData & { _id?: string } {
  return {
    _id: g.id,
    type: "fulltime",
    bgImage: g.bgImageUrl,
    competition: g.competitionName ?? "",
    competitionIcon: g.competitionIconUrl ?? null,
    competitionColor: g.competitionColor ?? "",
    homeTeam: g.homeTeamId
      ? {
          id: g.homeTeamId,
          name: g.homeTeamName ?? "",
          logo: g.homeTeamLogoUrl,
        }
      : null,
    awayTeam: g.awayTeamId
      ? {
          id: g.awayTeamId,
          name: g.awayTeamName ?? "",
          logo: g.awayTeamLogoUrl,
        }
      : null,
    homeScore: g.homeScore ?? 0,
    awayScore: g.awayScore ?? 0,
    events: g.events ?? [],
  };
}

export function apiGraphicToMD(g: ApiGraphic): MatchdayData & { _id?: string } {
  return {
    _id: g.id,
    type: "matchday",
    bgImage: g.bgImageUrl,
    competition: g.competitionName ?? "",
    competitionIcon: g.competitionIconUrl ?? null,
    competitionColor: g.competitionColor ?? "",
    homeTeam: g.homeTeamId
      ? {
          id: g.homeTeamId,
          name: g.homeTeamName ?? "",
          logo: g.homeTeamLogoUrl,
        }
      : null,
    awayTeam: g.awayTeamId
      ? {
          id: g.awayTeamId,
          name: g.awayTeamName ?? "",
          logo: g.awayTeamLogoUrl,
        }
      : null,
    matchDate: g.matchDate ?? "",
    kickoffTime: g.kickoffTime ?? "",
    venue: g.venue ?? "",
  };
}

function ftToPayload(data: FullTimeData) {
  return {
    graphicType: "fulltime",
    competitionId: null,
    competitionName: data.competition || null,
    competitionIconUrl: data.competitionIcon || null,
    competitionColor: data.competitionColor || null,
    homeTeamId: data.homeTeam?.id ?? null,
    homeTeamName: data.homeTeam?.name ?? null,
    homeTeamLogoUrl: data.homeTeam?.logo ?? null,
    awayTeamId: data.awayTeam?.id ?? null,
    awayTeamName: data.awayTeam?.name ?? null,
    awayTeamLogoUrl: data.awayTeam?.logo ?? null,
    homeScore: data.homeScore,
    awayScore: data.awayScore,
    events: data.events,
  };
}

function mdToPayload(data: MatchdayData) {
  return {
    graphicType: "matchday",
    competitionId: null,
    competitionName: data.competition || null,
    competitionIconUrl: data.competitionIcon || null,
    competitionColor: data.competitionColor || null,
    homeTeamId: data.homeTeam?.id ?? null,
    homeTeamName: data.homeTeam?.name ?? null,
    homeTeamLogoUrl: data.homeTeam?.logo ?? null,
    awayTeamId: data.awayTeam?.id ?? null,
    awayTeamName: data.awayTeam?.name ?? null,
    awayTeamLogoUrl: data.awayTeam?.logo ?? null,
    matchDate: data.matchDate || null,
    kickoffTime: data.kickoffTime || null,
    venue: data.venue || null,
  };
}

// service
export const graphicsService = {
  // restore last drafts on app load
  async getLatestDrafts() {
    const res = await api.get<DraftsResponse>("/api/graphics/drafts/latest");
    return res.data;
  },

  // history page
  async list(params?: {
    type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const qs = new URLSearchParams();
    if (params?.type) qs.set("type", params.type);
    if (params?.status) qs.set("status", params.status);
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.offset) qs.set("offset", String(params.offset));
    const res = await api.get<ListResponse>(`/api/graphics?${qs}`);
    return res;
  },

  // full-time
  async saveFTDraft(data: FullTimeData, id?: string): Promise<ApiGraphic> {
    if (id) {
      const res = await api.patch<SingleResponse>(
        `/api/graphics/${id}`,
        ftToPayload(data),
      );
      return res.data;
    }
    const res = await api.post<SingleResponse>(
      "/api/graphics",
      ftToPayload(data),
    );
    return res.data;
  },

  async uploadFTBackground(id: string, file: File): Promise<ApiGraphic> {
    const form = new FormData();
    form.append("background", file);
    const res = await api.patchForm<SingleResponse>(
      `/api/graphics/${id}/background`,
      form,
    );
    return res.data;
  },

  async publishFT(id: string): Promise<ApiGraphic> {
    const res = await api.patch<SingleResponse>(`/api/graphics/${id}`, {
      status: "published",
    });
    return res.data;
  },

  // matchday
  async saveMDDraft(data: MatchdayData, id?: string): Promise<ApiGraphic> {
    if (id) {
      const res = await api.patch<SingleResponse>(
        `/api/graphics/${id}`,
        mdToPayload(data),
      );
      return res.data;
    }
    const res = await api.post<SingleResponse>(
      "/api/graphics",
      mdToPayload(data),
    );
    return res.data;
  },

  async uploadMDBackground(id: string, file: File): Promise<ApiGraphic> {
    const form = new FormData();
    form.append("background", file);
    const res = await api.patchForm<SingleResponse>(
      `/api/graphics/${id}/background`,
      form,
    );
    return res.data;
  },

  async publishMD(id: string): Promise<ApiGraphic> {
    const res = await api.patch<SingleResponse>(`/api/graphics/${id}`, {
      status: "published",
    });
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/graphics/${id}`);
  },
};
