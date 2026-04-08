import { api } from "./apiClient";
import type {
  FullTimeData,
  MatchdayData,
  StatsData,
  QuoteData,
  TransferData,
} from "@types";
import { isValidUUID } from "../helpers/isValidUuid";

// API shapes
export interface ApiGraphic {
  id: string;
  graphicType:
    | "fulltime"
    | "halftime"
    | "matchday"
    | "stats"
    | "quote"
    | "transfer";
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
  aggScoreHome: number | null;
  aggScoreAway: number | null;
  events: FullTimeData["events"];
  matchDate: string | null;
  kickoffTime: string | null;
  venue: string | null;
  playerName: string | null;
  playerImageUrl: string | null;
  statsData:
    | { id: string; label: string; value: string; enabled: boolean }[]
    | null;
  accentColor: string | null;
  playerRole: string | null;
  quoteText: string | null;
  transferKind: string | null;
  transferFee: string | null;
  transferStatus: string | null;
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
  data: {
    fulltime: ApiGraphic | null;
    halftime: ApiGraphic | null;
    matchday: ApiGraphic | null;
    stats: ApiGraphic | null;
    quote: ApiGraphic | null;
    transfer: ApiGraphic | null;
  };
}

// mappers
export function apiGraphicToFT(
  g: ApiGraphic,
  competitions: {
    id: string;
    name: string;
    icon: string | null;
    color: string;
  }[] = [],
): FullTimeData & { _id?: string } {
  const type: FullTimeData["type"] =
    g.graphicType === "halftime" ? "halftime" : "fulltime";
  const matchedComp = competitions.find((c) => c.name === g.competitionName);
  const competitionIcon = matchedComp?.icon ?? g.competitionIconUrl ?? null;
  return {
    _id: g.id,
    type,
    bgImage: g.bgImageUrl,
    competition: g.competitionName ?? "",
    competitionIcon,
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
    aggScoreHome: g.aggScoreHome ?? null,
    aggScoreAway: g.aggScoreAway ?? null,
    events: g.events ?? [],
  };
}

export function apiGraphicToMD(
  g: ApiGraphic,
  competitions: {
    id: string;
    name: string;
    icon: string | null;
    color: string;
  }[] = [],
): MatchdayData & { _id?: string } {
  const matchedComp = competitions.find((c) => c.name === g.competitionName);
  const competitionIcon = matchedComp?.icon ?? g.competitionIconUrl ?? null;
  return {
    _id: g.id,
    type: "matchday",
    bgImage: g.bgImageUrl,
    competition: g.competitionName ?? "",
    competitionIcon,
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

export function apiGraphicToStats(g: ApiGraphic): StatsData & { _id?: string } {
  return {
    _id: g.id,
    type: "stats",
    bgImage: g.bgImageUrl,
    playerName: g.playerName ?? "",
    playerImage: g.playerImageUrl,
    competition: g.competitionName ?? "",
    competitionIcon: g.competitionIconUrl ?? null,
    competitionColor: g.competitionColor ?? "",
    stats: g.statsData ?? [],
    accentColor: g.accentColor ?? "#C8102E",
  };
}

export function apiGraphicToQuote(g: ApiGraphic): QuoteData & { _id?: string } {
  return {
    _id: g.id,
    type: "quote",
    bgImage: g.bgImageUrl,
    playerName: g.playerName ?? "",
    playerRole: g.playerRole ?? "",
    playerImage: g.playerImageUrl,
    quoteText: g.quoteText ?? "",
    competition: g.competitionName ?? "",
    competitionIcon: g.competitionIconUrl ?? null,
    competitionColor: g.competitionColor ?? "",
    accentColor: g.accentColor ?? "#C8102E",
  };
}

export function apiGraphicToTransfer(
  g: ApiGraphic,
): TransferData & { _id?: string } {
  return {
    _id: g.id,
    type: "transfer",
    bgImage: g.bgImageUrl,
    playerName: g.playerName ?? "",
    fromTeam: g.homeTeamId
      ? {
          id: g.homeTeamId,
          name: g.homeTeamName ?? "",
          logo: g.homeTeamLogoUrl,
        }
      : null,
    toTeam: g.awayTeamId
      ? {
          id: g.awayTeamId,
          name: g.awayTeamName ?? "",
          logo: g.awayTeamLogoUrl,
        }
      : null,
    transferKind:
      (g.transferKind as TransferData["transferKind"]) ?? "transfer",
    fee: g.transferFee ?? "",
    currency: (g.accentColor as TransferData["currency"]) ?? "£",
    status: (g.transferStatus as TransferData["status"]) ?? "confirmed",
  };
}

function isBase64(s: string | null | undefined): boolean {
  return !!s && s.startsWith("data:");
}

function safeUrl(s: string | null | undefined): string | null {
  if (!s) {
    return null;
  }
  // never persist a base64 data url - the icon/logo lives in cloudinary already
  return isBase64(s) ? null : s;
}

function ftToPayload(data: FullTimeData) {
  return {
    graphicType: data.type,
    competitionId: null,
    competitionName: data.competition || null,
    competitionIconUrl: safeUrl(data.competitionIcon),
    competitionColor: data.competitionColor || null,
    homeTeamId: isValidUUID(data.homeTeam?.id)
      ? (data.homeTeam?.id ?? null)
      : null,
    homeTeamName: data.homeTeam?.name ?? null,
    homeTeamLogoUrl: safeUrl(data.homeTeam?.logo),
    awayTeamId: isValidUUID(data.awayTeam?.id)
      ? (data.awayTeam?.id ?? null)
      : null,
    awayTeamName: data.awayTeam?.name ?? null,
    awayTeamLogoUrl: safeUrl(data.awayTeam?.logo),
    homeScore: data.homeScore,
    awayScore: data.awayScore,
    aggScoreHome: data.aggScoreHome ?? null,
    aggScoreAway: data.aggScoreAway ?? null,
    events: data.events,
  };
}

function mdToPayload(data: MatchdayData) {
  return {
    graphicType: "matchday",
    competitionId: null,
    competitionName: data.competition || null,
    competitionIconUrl: safeUrl(data.competitionIcon),
    competitionColor: data.competitionColor || null,
    homeTeamId: isValidUUID(data.homeTeam?.id)
      ? (data.homeTeam?.id ?? null)
      : null,
    homeTeamName: data.homeTeam?.name ?? null,
    homeTeamLogoUrl: safeUrl(data.homeTeam?.logo),
    awayTeamId: isValidUUID(data.awayTeam?.id)
      ? (data.awayTeam?.id ?? null)
      : null,
    awayTeamName: data.awayTeam?.name ?? null,
    awayTeamLogoUrl: safeUrl(data.awayTeam?.logo),
    matchDate: data.matchDate || null,
    kickoffTime: data.kickoffTime || null,
    venue: data.venue || null,
  };
}

function statsToPayload(data: StatsData) {
  return {
    graphicType: "stats",
    competitionName: data.competition || null,
    competitionIconUrl: safeUrl(data.competitionIcon),
    competitionColor: data.competitionColor || null,
    playerName: data.playerName || null,
    statsData: data.stats ?? [],
    accentColor: data.accentColor || null,
  };
}

function quoteToPayload(data: QuoteData) {
  return {
    graphicType: "quote",
    competitionName: data.competition || null,
    competitionIconUrl: safeUrl(data.competitionIcon),
    competitionColor: data.competitionColor || null,
    playerName: data.playerName || null,
    playerRole: data.playerRole || null,
    quoteText: data.quoteText || null,
    accentColor: data.accentColor || null,
  };
}

function transferToPayload(data: TransferData) {
  return {
    graphicType: "transfer",
    playerName: data.playerName || null,
    homeTeamId: isValidUUID(data.fromTeam?.id) ? data.fromTeam!.id : null,
    homeTeamName: data.fromTeam?.name ?? null,
    homeTeamLogoUrl: safeUrl(data.fromTeam?.logo),
    awayTeamId: isValidUUID(data.toTeam?.id) ? data.toTeam!.id : null,
    awayTeamName: data.toTeam?.name ?? null,
    awayTeamLogoUrl: safeUrl(data.toTeam?.logo),
    transferKind: data.transferKind,
    transferFee: data.transferKind === "loan" ? null : data.fee || null,
    transferStatus: data.status,
    accentColor: data.currency || null,
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
    if (params?.type) {
      qs.set("type", params.type);
    }
    if (params?.status) {
      qs.set("status", params.status);
    }
    if (params?.limit) {
      qs.set("limit", String(params.limit));
    }
    if (params?.offset) {
      qs.set("offset", String(params.offset));
    }
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

  // stats
  async saveStatsDraft(data: StatsData, id?: string): Promise<ApiGraphic> {
    if (id) {
      const res = await api.patch<SingleResponse>(
        `/api/graphics/${id}`,
        statsToPayload(data),
      );
      return res.data;
    }
    const res = await api.post<SingleResponse>(
      "/api/graphics",
      statsToPayload(data),
    );
    return res.data;
  },

  async uploadStatsPlayerImage(id: string, file: File): Promise<ApiGraphic> {
    const form = new FormData();
    form.append("playerImage", file);
    const res = await api.patchForm<SingleResponse>(
      `/api/graphics/${id}/player-image`,
      form,
    );
    return res.data;
  },

  async uploadStatsBgImage(id: string, file: File): Promise<ApiGraphic> {
    const form = new FormData();
    form.append("background", file);
    const res = await api.patchForm<SingleResponse>(
      `/api/graphics/${id}/background`,
      form,
    );
    return res.data;
  },

  // quote
  async saveQuoteDraft(data: QuoteData, id?: string): Promise<ApiGraphic> {
    if (id) {
      const res = await api.patch<SingleResponse>(
        `/api/graphics/${id}`,
        quoteToPayload(data),
      );
      return res.data;
    }
    const res = await api.post<SingleResponse>(
      "/api/graphics",
      quoteToPayload(data),
    );
    return res.data;
  },

  async uploadQuotePlayerImage(id: string, file: File): Promise<ApiGraphic> {
    const form = new FormData();
    form.append("playerImage", file);
    const res = await api.patchForm<SingleResponse>(
      `/api/graphics/${id}/player-image`,
      form,
    );
    return res.data;
  },

  async uploadQuoteBgImage(id: string, file: File): Promise<ApiGraphic> {
    const form = new FormData();
    form.append("background", file);
    const res = await api.patchForm<SingleResponse>(
      `/api/graphics/${id}/background`,
      form,
    );
    return res.data;
  },

  // transfer
  async saveTransferDraft(
    data: TransferData,
    id?: string,
  ): Promise<ApiGraphic> {
    if (id) {
      const res = await api.patch<SingleResponse>(
        `/api/graphics/${id}`,
        transferToPayload(data),
      );
      return res.data;
    }
    const res = await api.post<SingleResponse>(
      "/api/graphics",
      transferToPayload(data),
    );
    return res.data;
  },

  async uploadTransferBackground(id: string, file: File): Promise<ApiGraphic> {
    const form = new FormData();
    form.append("background", file);
    const res = await api.patchForm<SingleResponse>(
      `/api/graphics/${id}/background`,
      form,
    );
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/graphics/${id}`);
  },
};
