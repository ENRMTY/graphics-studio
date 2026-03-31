import Konva from "konva";
import type { FullTimeData, MatchdayData, MatchEvent } from "../types";

const FONT_DISPLAY = "Bebas Neue";
const FONT_BODY = "DM Sans";

// helpers
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new window.Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

function coverFit(imgW: number, imgH: number, size: number) {
  const ratio = Math.max(size / imgW, size / imgH);
  const w = imgW * ratio,
    h = imgH * ratio;
  return { w, h, x: (size - w) / 2, y: (size - h) / 2 };
}

// full time
export async function renderFullTime(
  stage: Konva.Stage,
  data: FullTimeData,
  SIZE: number,
): Promise<void> {
  stage.destroyChildren();
  const layer = new Konva.Layer();
  stage.add(layer);

  // background
  layer.add(
    new Konva.Rect({ x: 0, y: 0, width: SIZE, height: SIZE, fill: "#111114" }),
  );

  if (data.bgImage) {
    try {
      const img = await loadImage(data.bgImage);
      const { w, h, x, y } = coverFit(img.width, img.height, SIZE);
      layer.add(new Konva.Image({ image: img, x, y, width: w, height: h }));
    } catch {
      // ignore bad images
    }
  }

  // layout constants
  const PAD = 56;

  // event columns are dynamic height based on number of events, so calculate that first
  const homeEvents = data.events.filter((e) => e.side === "home");
  const awayEvents = data.events.filter((e) => e.side === "away");
  const maxEvents = Math.max(homeEvents.length, awayEvents.length, 0);
  const EVENT_LINE_H = 28;
  const EVENTS_BLOCK_H = maxEvents > 0 ? maxEvents * EVENT_LINE_H + 12 : 0;

  // fixed heights for the content blocks (from bottom up)
  const RED_BAR_H = 6;
  const BOTTOM_PAD = 36;
  const TEAM_NAMES_H = 28;
  const SCORE_H = 110;
  const COMP_H = data.competition ? 40 : 0;
  const FT_LABEL_H = 34;
  const TOP_BLOCK_PAD = 20;

  // total content height
  const CONTENT_H =
    BOTTOM_PAD +
    EVENTS_BLOCK_H +
    TEAM_NAMES_H +
    SCORE_H +
    COMP_H +
    FT_LABEL_H +
    TOP_BLOCK_PAD;

  // gradient overlay — always covers the content area plus a fade above it
  const OVERLAY_H = Math.min(CONTENT_H + 100, SIZE * 0.85);
  layer.add(
    new Konva.Rect({
      x: 0,
      y: SIZE - OVERLAY_H,
      width: SIZE,
      height: OVERLAY_H,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: OVERLAY_H },
      fillLinearGradientColorStops: [
        0,
        "rgba(0,0,0,0)",
        0.28,
        "rgba(0,0,0,0.72)",
        1,
        "rgba(0,0,0,0.97)",
      ],
    }),
  );

  // red bar at very bottom
  layer.add(
    new Konva.Rect({
      x: 0,
      y: SIZE - RED_BAR_H,
      width: SIZE,
      height: RED_BAR_H,
      fill: "#C8102E",
    }),
  );

  // place elements bottom-up
  let cursorY = SIZE - RED_BAR_H - BOTTOM_PAD;

  // events if any
  if (maxEvents > 0) {
    cursorY -= EVENTS_BLOCK_H;
    drawEventColumns(
      layer,
      homeEvents,
      awayEvents,
      cursorY,
      SIZE,
      EVENT_LINE_H,
    );
    cursorY -= 8; // gap above events
  }

  // team names
  cursorY -= TEAM_NAMES_H;
  const teamNamesY = cursorY;
  layer.add(
    new Konva.Text({
      text: (data.homeTeam?.name || "HOME").toUpperCase(),
      x: 0,
      y: teamNamesY,
      width: SIZE / 2 - 16,
      align: "right",
      fontSize: 18,
      fontFamily: FONT_DISPLAY,
      fill: "rgba(255,255,255,0.65)",
      letterSpacing: 2,
    }),
  );
  layer.add(
    new Konva.Text({
      text: (data.awayTeam?.name || "AWAY").toUpperCase(),
      x: SIZE / 2 + 16,
      y: teamNamesY,
      width: SIZE / 2 - 16,
      align: "left",
      fontSize: 18,
      fontFamily: FONT_DISPLAY,
      fill: "rgba(255,255,255,0.65)",
      letterSpacing: 2,
    }),
  );

  // score + logos row
  cursorY -= SCORE_H;
  const scoreRowCY = cursorY + SCORE_H / 2; // vertical center of the row

  // score text
  const scoreTxt = `${data.homeScore ?? 0}   –   ${data.awayScore ?? 0}`;
  layer.add(
    new Konva.Text({
      text: scoreTxt,
      x: 0,
      y: scoreRowCY - 52,
      width: SIZE,
      align: "center",
      fontSize: 104,
      fontFamily: FONT_DISPLAY,
      fill: "#FFFFFF",
      letterSpacing: 2,
    }),
  );

  // logos flanking the score
  const LOGO_SIZE = 76;
  const LOGO_CX_HOME = SIZE / 2 - 210;
  const LOGO_CX_AWAY = SIZE / 2 + 210;
  const LOGO_CY = scoreRowCY;

  await drawCircularLogo(
    layer,
    data.homeTeam?.logo ?? null,
    LOGO_CX_HOME,
    LOGO_CY,
    LOGO_SIZE,
  );
  await drawCircularLogo(
    layer,
    data.awayTeam?.logo ?? null,
    LOGO_CX_AWAY,
    LOGO_CY,
    LOGO_SIZE,
  );

  // competition
  if (data.competition) {
    cursorY -= COMP_H;
    const compColor = data.competitionColor || "#ffffff";
    // small color chip
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

  // full-time label
  cursorY -= FT_LABEL_H;
  layer.add(
    new Konva.Text({
      text: "FULL TIME",
      x: PAD,
      y: cursorY,
      fontSize: 24,
      fontFamily: FONT_DISPLAY,
      fill: "#C8102E",
      letterSpacing: 5,
    }),
  );

  // watermark
  layer.add(
    new Konva.Text({
      text: "ENORMITY OF LFC",
      x: SIZE - PAD,
      y: 28,
      fontSize: 12,
      fontFamily: FONT_DISPLAY,
      fill: "rgba(255,255,255,0.12)",
      letterSpacing: 3,
      align: "right",
    }),
  );

  layer.draw();
}

// matchday
export async function renderMatchday(
  stage: Konva.Stage,
  data: MatchdayData,
  SIZE: number,
): Promise<void> {
  stage.destroyChildren();
  const layer = new Konva.Layer();
  stage.add(layer);

  layer.add(
    new Konva.Rect({ x: 0, y: 0, width: SIZE, height: SIZE, fill: "#111114" }),
  );

  if (data.bgImage) {
    try {
      const img = await loadImage(data.bgImage);
      const { w, h, x, y } = coverFit(img.width, img.height, SIZE);
      layer.add(new Konva.Image({ image: img, x, y, width: w, height: h }));
    } catch {
      // ignore bad images
    }
  }

  const PAD = 56;
  const RED_BAR_H = 6;
  const OVERLAY_H = SIZE * 0.72;
  layer.add(
    new Konva.Rect({
      x: 0,
      y: SIZE - OVERLAY_H,
      width: SIZE,
      height: OVERLAY_H,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: OVERLAY_H },
      fillLinearGradientColorStops: [
        0,
        "rgba(0,0,0,0)",
        0.3,
        "rgba(0,0,0,0.78)",
        1,
        "rgba(0,0,0,0.97)",
      ],
    }),
  );

  layer.add(
    new Konva.Rect({
      x: 0,
      y: SIZE - RED_BAR_H,
      width: SIZE,
      height: RED_BAR_H,
      fill: "#C8102E",
    }),
  );

  let cursorY = SIZE - RED_BAR_H - 36;

  // venue
  if (data.venue) {
    cursorY -= 28;
    layer.add(
      new Konva.Text({
        text: `📍 ${data.venue.toUpperCase()}`,
        x: PAD,
        y: cursorY,
        fontSize: 14,
        fontFamily: FONT_BODY,
        fill: "rgba(255,255,255,0.45)",
        letterSpacing: 1,
        fontStyle: "500",
      }),
    );
  }

  // date + kick off
  if (data.matchDate || data.kickoffTime) {
    cursorY -= 30;
    const parts: string[] = [];
    if (data.matchDate) {
      const d = new Date(data.matchDate + "T00:00:00");
      parts.push(
        d.toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      );
    }
    if (data.kickoffTime) parts.push(`KO: ${data.kickoffTime}`);
    layer.add(
      new Konva.Text({
        text: parts.join("   •   ").toUpperCase(),
        x: PAD,
        y: cursorY,
        fontSize: 15,
        fontFamily: FONT_BODY,
        fill: "#F6C326",
        letterSpacing: 1,
        fontStyle: "600",
      }),
    );
  }

  // team names
  cursorY -= 34;
  layer.add(
    new Konva.Text({
      text: (data.homeTeam?.name || "HOME").toUpperCase(),
      x: 0,
      y: cursorY,
      width: SIZE / 2 - 16,
      align: "right",
      fontSize: 18,
      fontFamily: FONT_DISPLAY,
      fill: "rgba(255,255,255,0.65)",
      letterSpacing: 2,
    }),
  );
  layer.add(
    new Konva.Text({
      text: (data.awayTeam?.name || "AWAY").toUpperCase(),
      x: SIZE / 2 + 16,
      y: cursorY,
      width: SIZE / 2 - 16,
      align: "left",
      fontSize: 18,
      fontFamily: FONT_DISPLAY,
      fill: "rgba(255,255,255,0.65)",
      letterSpacing: 2,
    }),
  );

  // vs + logos
  cursorY -= 120;
  const logoRowCY = cursorY + 60;
  const LOGO_SIZE = 88;
  const LOGO_CX_HOME = SIZE / 2 - 200;
  const LOGO_CX_AWAY = SIZE / 2 + 200;

  layer.add(
    new Konva.Text({
      text: "VS",
      x: 0,
      y: logoRowCY - 50,
      width: SIZE,
      align: "center",
      fontSize: 88,
      fontFamily: FONT_DISPLAY,
      fill: "rgba(255,255,255,0.07)",
      letterSpacing: 8,
    }),
  );

  await drawCircularLogo(
    layer,
    data.homeTeam?.logo ?? null,
    LOGO_CX_HOME,
    logoRowCY,
    LOGO_SIZE,
  );
  await drawCircularLogo(
    layer,
    data.awayTeam?.logo ?? null,
    LOGO_CX_AWAY,
    logoRowCY,
    LOGO_SIZE,
  );

  // competition
  if (data.competition) {
    cursorY -= 44;
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

  // matchday label
  cursorY -= 36;
  layer.add(
    new Konva.Text({
      text: "MATCH DAY",
      x: PAD,
      y: cursorY,
      fontSize: 24,
      fontFamily: FONT_DISPLAY,
      fill: "#C8102E",
      letterSpacing: 5,
    }),
  );

  // watermark
  layer.add(
    new Konva.Text({
      text: "ENORMITY OF LFC",
      x: SIZE - PAD,
      y: 28,
      fontSize: 12,
      fontFamily: FONT_DISPLAY,
      fill: "rgba(255,255,255,0.12)",
      letterSpacing: 3,
      align: "right",
    }),
  );

  layer.draw();
}

// shared helpers for both types of graphic
async function drawCircularLogo(
  layer: Konva.Layer,
  src: string | null,
  cx: number,
  cy: number,
  size: number,
): Promise<void> {
  const r = size / 2;
  // background circle
  layer.add(
    new Konva.Circle({
      x: cx,
      y: cy,
      radius: r,
      fill: "rgba(255,255,255,0.07)",
      stroke: "rgba(255,255,255,0.12)",
      strokeWidth: 1.5,
    }),
  );
  if (!src) {
    return;
  }
  try {
    const img = await loadImage(src);
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
  } catch {
    // ignore bad images
  }
}

function drawEventColumns(
  layer: Konva.Layer,
  homeEvents: MatchEvent[],
  awayEvents: MatchEvent[],
  startY: number,
  SIZE: number,
  lineH: number,
): void {
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
          width: SIZE / 2 - 20,
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
          x: SIZE / 2 + 20,
          y,
          width: SIZE / 2 - 20,
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

function buildEventText(ev: MatchEvent, side: "home" | "away"): string {
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
