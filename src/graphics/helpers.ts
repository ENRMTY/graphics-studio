import Konva from "konva";
import { MatchEvent } from "@types";

export const FONT_DISPLAY = "Bebas Neue";
export const FONT_BODY = "DM Sans";

/** Square PNG in the frontend public folder. Drawn small next to scorers. */
export const GOAL_ICON_SRC = "/goal-icon.png";

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new window.Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.crossOrigin = "anonymous";
    const cacheBusted =
      src.startsWith("data:") || src.startsWith("blob:")
        ? src
        : src + (src.includes("?") ? "&" : "?") + "_cb=1";
    img.src = cacheBusted;
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
  glow = false,
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
      if (glow) {
        layer.add(
          new Konva.Circle({
            x: cx,
            y: cy,
            radius: r + 4,
            fill: "rgba(200,16,46,0.12)",
            shadowColor: "#c8102e",
            shadowBlur: 10,
            shadowOpacity: 0.55,
          }),
        );
      }
      layer.add(
        new Konva.Circle({
          x: cx,
          y: cy,
          radius: r + (glow ? 2 : 6),
          fill: glow ? "rgba(8,0,2,0.45)" : "rgba(255,255,255,0.07)",
          stroke: glow ? "rgba(255,60,80,0.85)" : "rgba(255,255,255,0.12)",
          strokeWidth: glow ? 2 : 2,
          shadowColor: glow ? "#c8102e" : undefined,
          shadowBlur: glow ? 8 : 0,
          shadowOpacity: glow ? 0.6 : 0,
        }),
      );
      const pad = Math.round(size * 0.14);
      const clipR = r - 1;
      const group = new Konva.Group({
        clipFunc: (ctx) => {
          ctx.arc(cx, cy, clipR, 0, Math.PI * 2, false);
        },
      });
      group.add(
        new Konva.Image({
          image: img,
          x: cx - r + pad / 2,
          y: cy - r + pad / 2,
          width: size - pad,
          height: size - pad,
        }),
      );
      layer.add(group);
    }
  } catch {
    // ignore bad images
  }
}

export async function drawEventColumns(
  layer: Konva.Layer,
  homeEvents: MatchEvent[],
  awayEvents: MatchEvent[],
  startY: number,
  SIZE: number,
  lineH: number,
  goalIcon: HTMLImageElement | null,
  homeEdge: number,
  awayEdge: number,
): Promise<void> {
  const maxRows = Math.max(homeEvents.length, awayEvents.length);
  const icon = 15;
  const fontSize = 18;
  const iconGap = 7;

  for (let i = 0; i < maxRows; i++) {
    const y = startY + i * lineH;
    const textY = y + 1;
    const iconY = textY + (fontSize - icon) / 2;
    const homeEv = homeEvents[i];
    const awayEv = awayEvents[i];

    if (homeEv) {
      const showIcon = usesGoalIcon(homeEv) && !!goalIcon;
      layer.add(
        new Konva.Text({
          text: buildEventText(homeEv, "home"),
          x: 0,
          y: textY,
          width: homeEdge,
          align: "right",
          fontSize,
          fontFamily: FONT_BODY,
          fill: "rgba(255,255,255,0.92)",
          fontStyle: "500",
        }),
      );
      if (showIcon && goalIcon) {
        layer.add(
          new Konva.Image({
            image: goalIcon,
            x: homeEdge + iconGap,
            y: iconY,
            width: icon,
            height: icon,
          }),
        );
      }
    }
    if (awayEv) {
      const showIcon = usesGoalIcon(awayEv) && !!goalIcon;
      const textX = awayEdge;
      if (showIcon && goalIcon) {
        layer.add(
          new Konva.Image({
            image: goalIcon,
            x: awayEdge - iconGap - icon,
            y: iconY,
            width: icon,
            height: icon,
          }),
        );
      }
      layer.add(
        new Konva.Text({
          text: buildEventText(awayEv, "away"),
          x: textX,
          y: textY,
          width: SIZE - textX - 24,
          align: "left",
          fontSize,
          fontFamily: FONT_BODY,
          fill: "rgba(255,255,255,0.92)",
          fontStyle: "500",
        }),
      );
    }
  }
}

function usesGoalIcon(ev: MatchEvent): boolean {
  return ev.type === "goal" || ev.type === "penalty" || ev.type === "og";
}

export function buildEventText(ev: MatchEvent, side: "home" | "away"): string {
  const min = ev.minute ? `${ev.minute}'` : "";
  const tag =
    ev.type === "penalty"
      ? "(P)"
      : ev.type === "og"
        ? "(OG)"
        : ev.type === "red"
          ? "RED"
          : "";
  const name = ev.player || "?";
  if (side === "home") {
    return [name, tag, min].filter(Boolean).join("  ");
  }
  return [tag, min, name].filter(Boolean).join("  ");
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
