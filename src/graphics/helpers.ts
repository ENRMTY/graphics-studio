import Konva from "konva";
import { MatchEvent } from "../types";

export const FONT_DISPLAY = "Bebas Neue";
export const FONT_BODY = "DM Sans";

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new window.Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

export function coverFit(imgW: number, imgH: number, W: number, H: number) {
  const ratio = Math.max(W / imgW, H / imgH);
  const w = imgW * ratio,
    h = imgH * ratio;
  return { w, h, x: (W - w) / 2, y: (H - h) / 2 };
}

export async function drawTeamLogo(
  layer: Konva.Layer,
  src: string | null,
  cx: number,
  cy: number,
  size: number,
  style: "plain" | "circled" = "circled",
): Promise<void> {
  if (!src) {
    return;
  }

  try {
    const img = await loadImage(src);
    if (style === "plain") {
      layer.add(
        new Konva.Image({
          image: img,
          x: cx - size / 2,
          y: cy - size / 2,
          width: size,
          height: size,
        }),
      );
    } else {
      const r = size / 2;
      layer.add(
        new Konva.Circle({
          x: cx,
          y: cy,
          radius: r + 6,
          fill: "rgba(255,255,255,0.07)",
          stroke: "rgba(255,255,255,0.12)",
          strokeWidth: 2,
        }),
      );
      const group = new Konva.Group({
        clip: { x: cx - r, y: cy - r, width: size, height: size },
      });
      group.add(
        new Konva.Image({
          image: img,
          x: cx - r,
          y: cy - r,
          width: size,
          height: size,
        }),
      );
      layer.add(group);
    }
  } catch {
    // ignore bad images
  }
}

export function drawEventColumns(
  layer: Konva.Layer,
  homeEvents: MatchEvent[],
  awayEvents: MatchEvent[],
  startY: number,
  SIZE: number,
  lineH: number,
): void {
  const TEAM_NAME_MARGIN = 50;

  const maxRows = Math.max(homeEvents.length, awayEvents.length);
  for (let i = 0; i < maxRows; i++) {
    const y = startY + i * lineH;
    const homeEv = homeEvents[i];
    const awayEv = awayEvents[i];

    if (homeEv) {
      const txt = buildEventText(homeEv, "home");
      layer.add(
        new Konva.Text({
          text: txt,
          x: 0,
          y,
          width: SIZE / 2 - TEAM_NAME_MARGIN,
          align: "right",
          fontSize: 18,
          fontFamily: FONT_BODY,
          fill: "rgba(255,255,255,0.82)",
          fontStyle: "500",
        }),
      );
    }
    if (awayEv) {
      const txt = buildEventText(awayEv, "away");
      layer.add(
        new Konva.Text({
          text: txt,
          x: SIZE / 2 + TEAM_NAME_MARGIN,
          y,
          width: SIZE / 2 - TEAM_NAME_MARGIN,
          align: "left",
          fontSize: 18,
          fontFamily: FONT_BODY,
          fill: "rgba(255,255,255,0.82)",
          fontStyle: "500",
        }),
      );
    }
  }
}

export function buildEventText(ev: MatchEvent, side: "home" | "away"): string {
  const symbol =
    ev.type === "goal"
      ? "⚽"
      : ev.type === "penalty"
        ? "⚽(P)"
        : ev.type === "red"
          ? "🟥"
          : "⚽(OG)";
  const min = ev.minute ? `${ev.minute}'` : "";
  const name = ev.player || "?";
  return side === "home"
    ? `${name}  ${min}  ${symbol}`
    : `${symbol}  ${min}  ${name}`;
}

export async function drawCompetition(
  layer: Konva.Layer,
  data: {
    competition: string;
    competitionIcon: string | null;
    competitionColor: string;
  },
  cursorY: number,
  PAD: number,
) {
  const compColor = data.competitionColor || "#ffffff";
  layer.add(
    new Konva.Rect({
      x: PAD,
      y: cursorY + 8,
      width: 4,
      height: 20,
      fill: compColor,
      cornerRadius: 2,
    }),
  );
  if (data.competitionIcon) {
    try {
      const ci = await loadImage(data.competitionIcon);
      layer.add(
        new Konva.Image({
          image: ci,
          x: PAD + 12,
          y: cursorY + 6,
          width: 24,
          height: 24,
        }),
      );
      layer.add(
        new Konva.Text({
          text: data.competition.toUpperCase(),
          x: PAD + 42,
          y: cursorY + 10,
          fontSize: 14,
          fontFamily: FONT_BODY,
          fill: "rgba(255,255,255,0.5)",
          letterSpacing: 2,
          fontStyle: "600",
        }),
      );
    } catch {
      layer.add(
        new Konva.Text({
          text: data.competition.toUpperCase(),
          x: PAD + 12,
          y: cursorY + 10,
          fontSize: 14,
          fontFamily: FONT_BODY,
          fill: "rgba(255,255,255,0.5)",
          letterSpacing: 2,
          fontStyle: "600",
        }),
      );
    }
  } else {
    layer.add(
      new Konva.Text({
        text: data.competition.toUpperCase(),
        x: PAD + 12,
        y: cursorY + 10,
        fontSize: 14,
        fontFamily: FONT_BODY,
        fill: "rgba(255,255,255,0.5)",
        letterSpacing: 2,
        fontStyle: "600",
      }),
    );
  }
}
