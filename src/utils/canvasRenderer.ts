import Konva from "konva";
import type {
  FullTimeData,
  MatchdayData,
  MatchEvent,
  StatsData,
  QuoteData,
  LineupData,
  LineupPlayer,
} from "../types";

const FONT_DISPLAY = "Bebas Neue";
const FONT_BODY = "DM Sans";

// HELPERS

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new window.Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

function coverFit(imgW: number, imgH: number, W: number, H: number) {
  const ratio = Math.max(W / imgW, H / imgH);
  const w = imgW * ratio,
    h = imgH * ratio;
  return { w, h, x: (W - w) / 2, y: (H - h) / 2 };
}

async function drawTeamLogo(
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

function drawEventColumns(
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

async function drawCompetition(
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

// FULL TIME

export async function renderFullTime(
  stage: Konva.Stage,
  data: FullTimeData,
  W: number,
  H: number = W,
): Promise<void> {
  stage.destroyChildren();
  const layer = new Konva.Layer();
  stage.add(layer);

  layer.add(
    new Konva.Rect({ x: 0, y: 0, width: W, height: H, fill: "#111114" }),
  );

  if (data.bgImage) {
    try {
      const img = await loadImage(data.bgImage);
      const { w, h, x, y } = coverFit(img.width, img.height, W, H);
      layer.add(new Konva.Image({ image: img, x, y, width: w, height: h }));
    } catch {
      // ignore bad images
    }
  }

  const PAD = 56;
  const TEAM_NAME_MARGIN = 50;
  const homeEvents = data.events.filter((e) => e.side === "home");
  const awayEvents = data.events.filter((e) => e.side === "away");
  const maxEvents = Math.max(homeEvents.length, awayEvents.length, 0);
  const EVENT_LINE_H = 28;
  const EVENTS_BLOCK_H = maxEvents > 0 ? maxEvents * EVENT_LINE_H + 12 : 0;

  const RED_BAR_H = 6;
  const BOTTOM_PAD = 36;
  const TEAM_NAMES_H = 28;
  const SCORE_H = 110;
  const COMP_H = data.competition ? 40 : 0;
  const FT_LABEL_H = 34;
  const TOP_BLOCK_PAD = 20;

  const CONTENT_H =
    BOTTOM_PAD +
    EVENTS_BLOCK_H +
    TEAM_NAMES_H +
    SCORE_H +
    COMP_H +
    FT_LABEL_H +
    TOP_BLOCK_PAD;
  const OVERLAY_H = Math.min(CONTENT_H + 150, H * 0.9);

  layer.add(
    new Konva.Rect({
      x: 0,
      y: H - OVERLAY_H,
      width: W,
      height: OVERLAY_H,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: OVERLAY_H },
      fillLinearGradientColorStops: [
        0,
        "rgba(0,0,0,0)",
        0.08,
        "rgba(0,0,0,0.03)",
        0.18,
        "rgba(0,0,0,0.12)",
        0.3,
        "rgba(0,0,0,0.35)",
        0.45,
        "rgba(0,0,0,0.62)",
        0.6,
        "rgba(0,0,0,0.80)",
        0.75,
        "rgba(0,0,0,0.91)",
        1,
        "rgba(0,0,0,0.97)",
      ],
    }),
  );

  layer.add(
    new Konva.Rect({
      x: 0,
      y: H - RED_BAR_H,
      width: W,
      height: RED_BAR_H,
      fill: "#C8102E",
    }),
  );

  let cursorY = H - RED_BAR_H - BOTTOM_PAD;

  if (maxEvents > 0) {
    cursorY -= EVENTS_BLOCK_H;
    drawEventColumns(layer, homeEvents, awayEvents, cursorY, W, EVENT_LINE_H);
    cursorY -= 8;
  }

  cursorY -= TEAM_NAMES_H;
  layer.add(
    new Konva.Text({
      text: (data.homeTeam?.name || "HOME").toUpperCase(),
      x: 0,
      y: cursorY,
      width: W / 2 - TEAM_NAME_MARGIN,
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
      x: W / 2 + TEAM_NAME_MARGIN,
      y: cursorY,
      width: W / 2 - TEAM_NAME_MARGIN,
      align: "left",
      fontSize: 18,
      fontFamily: FONT_DISPLAY,
      fill: "rgba(255,255,255,0.65)",
      letterSpacing: 2,
    }),
  );

  cursorY -= SCORE_H;
  const scoreRowCY = cursorY + SCORE_H / 2;
  layer.add(
    new Konva.Text({
      text: `${data.homeScore ?? 0}   –   ${data.awayScore ?? 0}`,
      x: 0,
      y: scoreRowCY - 52,
      width: W,
      align: "center",
      fontSize: 104,
      fontFamily: FONT_DISPLAY,
      fill: "#FFFFFF",
      letterSpacing: 2,
    }),
  );

  const LOGO_SIZE = 82;
  await drawTeamLogo(
    layer,
    data.homeTeam?.logo ?? null,
    W / 2 - 210,
    scoreRowCY - 8,
    LOGO_SIZE,
    data.logoStyle ?? "circled",
  );
  await drawTeamLogo(
    layer,
    data.awayTeam?.logo ?? null,
    W / 2 + 210,
    scoreRowCY - 8,
    LOGO_SIZE,
    data.logoStyle ?? "circled",
  );

  if (data.competition) {
    cursorY -= COMP_H;
    await drawCompetition(layer, data, cursorY, PAD);
  }

  cursorY -= FT_LABEL_H;
  layer.add(
    new Konva.Text({
      text: data.type === "halftime" ? "HALF TIME" : "FULL TIME",
      x: PAD,
      y: cursorY,
      fontSize: 24,
      fontFamily: FONT_DISPLAY,
      fill: "#C8102E",
      letterSpacing: 5,
    }),
  );

  layer.add(
    new Konva.Text({
      text: "ENORMITY OF LFC",
      x: PAD,
      y: 28,
      width: W - PAD * 2,
      fontSize: 12,
      fontFamily: FONT_DISPLAY,
      fill: "rgba(255,255,255,0.12)",
      letterSpacing: 3,
      align: "right",
    }),
  );

  layer.draw();
}

// MATCHDAY

export async function renderMatchday(
  stage: Konva.Stage,
  data: MatchdayData,
  W: number,
  H: number = W,
): Promise<void> {
  stage.destroyChildren();
  const layer = new Konva.Layer();
  stage.add(layer);

  layer.add(
    new Konva.Rect({ x: 0, y: 0, width: W, height: H, fill: "#111114" }),
  );

  if (data.bgImage) {
    try {
      const img = await loadImage(data.bgImage);
      const { w, h, x, y } = coverFit(img.width, img.height, W, H);
      layer.add(new Konva.Image({ image: img, x, y, width: w, height: h }));
    } catch {
      // ignore bad images
    }
  }

  const PAD = 56;
  const RED_BAR_H = 6;

  // calculate content height dynamically
  const MD_COMP_H = data.competition ? 44 : 0;
  const MD_VENUE_H = data.venue ? 28 : 0;
  const MD_DATE_H = data.matchDate || data.kickoffTime ? 30 : 0;
  const MD_CONTENT_H =
    36 + // bottom pad
    MD_VENUE_H +
    MD_DATE_H +
    34 + // team names
    120 + // logo row
    MD_COMP_H +
    36 + // match day label
    30; // top breathing room
  const OVERLAY_H = Math.min(MD_CONTENT_H + 100, H * 0.88);

  layer.add(
    new Konva.Rect({
      x: 0,
      y: H - OVERLAY_H,
      width: W,
      height: OVERLAY_H,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: OVERLAY_H },
      fillLinearGradientColorStops: [
        0,
        "rgba(0,0,0,0)",
        0.08,
        "rgba(0,0,0,0.03)",
        0.18,
        "rgba(0,0,0,0.14)",
        0.3,
        "rgba(0,0,0,0.38)",
        0.45,
        "rgba(0,0,0,0.64)",
        0.6,
        "rgba(0,0,0,0.82)",
        0.75,
        "rgba(0,0,0,0.92)",
        1,
        "rgba(0,0,0,0.97)",
      ],
    }),
  );
  layer.add(
    new Konva.Rect({
      x: 0,
      y: H - RED_BAR_H,
      width: W,
      height: RED_BAR_H,
      fill: "#C8102E",
    }),
  );

  let cursorY = H - RED_BAR_H - 36;

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

  cursorY -= 34;
  layer.add(
    new Konva.Text({
      text: (data.homeTeam?.name || "HOME").toUpperCase(),
      x: 0,
      y: cursorY,
      width: W / 2 - 50,
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
      x: W / 2 + 50,
      y: cursorY,
      width: W / 2 - 50,
      align: "left",
      fontSize: 18,
      fontFamily: FONT_DISPLAY,
      fill: "rgba(255,255,255,0.65)",
      letterSpacing: 2,
    }),
  );

  cursorY -= 120;
  const logoRowCY = cursorY + 60;
  layer.add(
    new Konva.Text({
      text: "VS",
      x: 0,
      y: logoRowCY - 50,
      width: W,
      align: "center",
      fontSize: 88,
      fontFamily: FONT_DISPLAY,
      fill: "rgba(255,255,255,0.07)",
      letterSpacing: 8,
    }),
  );
  await drawTeamLogo(
    layer,
    data.homeTeam?.logo ?? null,
    W / 2 - 200,
    logoRowCY,
    88,
    data.logoStyle ?? "circled",
  );
  await drawTeamLogo(
    layer,
    data.awayTeam?.logo ?? null,
    W / 2 + 200,
    logoRowCY,
    88,
    data.logoStyle ?? "circled",
  );

  if (data.competition) {
    cursorY -= 44;
    await drawCompetition(layer, data, cursorY, PAD);
  }

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

  layer.add(
    new Konva.Text({
      text: "ENORMITY OF LFC",
      x: PAD,
      y: 28,
      width: W - PAD * 2,
      fontSize: 12,
      fontFamily: FONT_DISPLAY,
      fill: "rgba(255,255,255,0.12)",
      letterSpacing: 3,
      align: "right",
    }),
  );

  layer.draw();
}

// STATS

export async function renderStats(
  stage: Konva.Stage,
  data: StatsData,
  W: number,
  H: number = W,
): Promise<void> {
  stage.destroyChildren();
  const layer = new Konva.Layer();
  stage.add(layer);

  const ACCENT = data.accentColor || "#C8102E";
  const PAD = 56;

  layer.add(
    new Konva.Rect({ x: 0, y: 0, width: W, height: H, fill: "#0d0d10" }),
  );

  if (data.bgImage) {
    try {
      const img = await loadImage(data.bgImage);
      const { w, h, x, y } = coverFit(img.width, img.height, W, H);
      layer.add(
        new Konva.Image({
          image: img,
          x,
          y,
          width: w,
          height: h,
          opacity: 0.35,
        }),
      );
    } catch {
      // ignore
    }
  }

  layer.add(
    new Konva.Rect({
      x: 0,
      y: 0,
      width: W,
      height: H,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: H },
      fillLinearGradientColorStops: [
        0,
        "rgba(0,0,0,0.55)",
        0.45,
        "rgba(0,0,0,0.72)",
        1,
        "rgba(0,0,0,0.96)",
      ],
    }),
  );

  layer.add(new Konva.Rect({ x: 0, y: 0, width: 6, height: H, fill: ACCENT }));

  if (data.playerImage) {
    try {
      const img = await loadImage(data.playerImage);
      const imgH = H;
      const imgW = (img.width / img.height) * imgH;
      const imgX = W - imgW * 0.72;
      const group = new Konva.Group({ opacity: 0.9 });
      group.add(
        new Konva.Image({
          image: img,
          x: imgX,
          y: 0,
          width: imgW,
          height: imgH,
        }),
      );
      layer.add(group);
      layer.add(
        new Konva.Rect({
          x: imgX,
          y: H * 0.55,
          width: imgW,
          height: H * 0.45,
          fillLinearGradientStartPoint: { x: 0, y: 0 },
          fillLinearGradientEndPoint: { x: 0, y: H * 0.45 },
          fillLinearGradientColorStops: [
            0,
            "rgba(0,0,0,0)",
            1,
            "rgba(0,0,0,0.97)",
          ],
        }),
      );
    } catch {
      // ignore
    }
  }

  if (data.competition || data.competitionIcon) {
    if (data.competitionIcon) {
      try {
        const ci = await loadImage(data.competitionIcon);
        layer.add(
          new Konva.Image({
            image: ci,
            x: W - PAD - 32,
            y: PAD - 8,
            width: 32,
            height: 32,
          }),
        );
      } catch {
        // ignore
      }
    } else if (data.competition) {
      layer.add(
        new Konva.Text({
          text: data.competition.toUpperCase(),
          x: PAD,
          y: PAD - 2,
          width: W - PAD * 2,
          align: "right",
          fontSize: 13,
          fontFamily: FONT_BODY,
          fill: "rgba(255,255,255,0.45)",
          letterSpacing: 2,
          fontStyle: "600",
        }),
      );
    }
  }

  const nameY = H * 0.3;
  layer.add(
    new Konva.Text({
      text: (data.playerName || "PLAYER NAME").toUpperCase(),
      x: PAD + 10,
      y: nameY,
      fontSize: 52,
      fontFamily: FONT_DISPLAY,
      fill: "#FFFFFF",
      letterSpacing: 3,
    }),
  );

  const nameMeasure = (data.playerName || "PLAYER NAME").length * 28;
  layer.add(
    new Konva.Rect({
      x: PAD + 10,
      y: nameY + 62,
      width: Math.min(nameMeasure, W - PAD * 2 - 20),
      height: 3,
      fill: ACCENT,
      cornerRadius: 1.5,
    }),
  );

  const enabledStats = data.stats.filter((s) => s.enabled && s.value);
  const statsY = H * 0.52;
  const colW = Math.min(
    180,
    (W - PAD * 2 - 10) / Math.max(enabledStats.length, 1),
  );

  enabledStats.forEach((stat, i) => {
    const x = PAD + 10 + i * (colW + 20);
    layer.add(
      new Konva.Text({
        text: stat.value,
        x,
        y: statsY,
        fontSize: 86,
        fontFamily: FONT_DISPLAY,
        fill: "#FFFFFF",
        letterSpacing: -2,
      }),
    );
    layer.add(
      new Konva.Text({
        text: stat.label.toUpperCase(),
        x,
        y: statsY + 90,
        fontSize: 13,
        fontFamily: FONT_BODY,
        fill: "rgba(255,255,255,0.5)",
        letterSpacing: 3,
        fontStyle: "600",
      }),
    );
    if (i < enabledStats.length - 1) {
      layer.add(
        new Konva.Circle({
          x: x + colW + 10,
          y: statsY + 45,
          radius: 3,
          fill: ACCENT,
          opacity: 0.7,
        }),
      );
    }
  });

  layer.add(
    new Konva.Text({
      text: "ENORMITY OF LFC",
      x: PAD,
      y: H - 36,
      width: W - PAD * 2,
      fontSize: 12,
      fontFamily: FONT_DISPLAY,
      fill: "rgba(255,255,255,0.12)",
      letterSpacing: 3,
      align: "right",
    }),
  );

  layer.draw();
}

// QUOTE

export async function renderQuote(
  stage: Konva.Stage,
  data: QuoteData,
  W: number,
  H: number = W,
): Promise<void> {
  stage.destroyChildren();
  const layer = new Konva.Layer();
  stage.add(layer);

  const ACCENT = data.accentColor || "#C8102E";
  const PAD = 64;

  layer.add(
    new Konva.Rect({ x: 0, y: 0, width: W, height: H, fill: "#0d0d10" }),
  );

  if (data.bgImage) {
    try {
      const img = await loadImage(data.bgImage);
      const { w, h, x, y } = coverFit(img.width, img.height, W, H);
      layer.add(
        new Konva.Image({
          image: img,
          x,
          y,
          width: w,
          height: h,
          opacity: 0.25,
        }),
      );
    } catch {
      // ignore
    }
  }

  layer.add(
    new Konva.Rect({
      x: 0,
      y: 0,
      width: W,
      height: H,
      fillRadialGradientStartPoint: { x: W / 2, y: H / 2 },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndPoint: { x: W / 2, y: H / 2 },
      fillRadialGradientEndRadius: Math.max(W, H) * 0.75,
      fillRadialGradientColorStops: [0, "rgba(0,0,0,0)", 1, "rgba(0,0,0,0.82)"],
    }),
  );

  if (data.playerImage) {
    try {
      const img = await loadImage(data.playerImage);
      const imgH = H * 0.65;
      const imgW = (img.width / img.height) * imgH;
      const imgX = -imgW * 0.05;
      const imgY = H - imgH;
      layer.add(
        new Konva.Image({
          image: img,
          x: imgX,
          y: imgY,
          width: imgW,
          height: imgH,
          opacity: 0.85,
        }),
      );
      layer.add(
        new Konva.Rect({
          x: imgX,
          y: imgY,
          width: imgW,
          height: imgH,
          fillLinearGradientStartPoint: { x: imgW * 0.5, y: 0 },
          fillLinearGradientEndPoint: { x: imgW, y: 0 },
          fillLinearGradientColorStops: [
            0,
            "rgba(0,0,0,0)",
            1,
            "rgba(0,0,0,0.9)",
          ],
        }),
      );
      layer.add(
        new Konva.Rect({
          x: imgX,
          y: imgY + imgH * 0.65,
          width: imgW,
          height: imgH * 0.35,
          fillLinearGradientStartPoint: { x: 0, y: 0 },
          fillLinearGradientEndPoint: { x: 0, y: imgH * 0.35 },
          fillLinearGradientColorStops: [
            0,
            "rgba(0,0,0,0)",
            1,
            "rgba(0,0,0,0.97)",
          ],
        }),
      );
    } catch {
      // ignore
    }
  }

  if (data.competitionIcon) {
    try {
      const ci = await loadImage(data.competitionIcon);
      layer.add(
        new Konva.Image({
          image: ci,
          x: W - PAD - 32,
          y: PAD - 8,
          width: 32,
          height: 32,
        }),
      );
    } catch {
      // ignore
    }
  } else if (data.competition) {
    layer.add(
      new Konva.Text({
        text: data.competition.toUpperCase(),
        x: PAD,
        y: PAD - 4,
        width: W - PAD * 2,
        align: "right",
        fontSize: 13,
        fontFamily: FONT_BODY,
        fill: "rgba(255,255,255,0.4)",
        letterSpacing: 2,
        fontStyle: "600",
      }),
    );
  }

  layer.add(
    new Konva.Text({
      text: "\u201C",
      x: W * 0.42,
      y: H * 0.1,
      fontSize: 160,
      fontFamily: FONT_DISPLAY,
      fill: ACCENT,
      opacity: 0.18,
    }),
  );

  const quoteX = W * 0.44;
  const quoteW = W - quoteX - PAD;
  layer.add(
    new Konva.Text({
      text: `\u201C${data.quoteText || "Add your quote here"}\u201D`,
      x: quoteX,
      y: H * 0.22,
      width: quoteW,
      fontSize: 32,
      fontFamily: FONT_BODY,
      fill: "#FFFFFF",
      fontStyle: "600 italic",
      lineHeight: 1.45,
      wrap: "word",
    }),
  );

  layer.add(
    new Konva.Rect({
      x: quoteX,
      y: H * 0.72,
      width: 40,
      height: 3,
      fill: ACCENT,
      cornerRadius: 1.5,
    }),
  );
  layer.add(
    new Konva.Text({
      text: (data.playerName || "Player Name").toUpperCase(),
      x: quoteX,
      y: H * 0.74,
      width: quoteW,
      fontSize: 22,
      fontFamily: FONT_DISPLAY,
      fill: "#FFFFFF",
      letterSpacing: 3,
    }),
  );

  if (data.playerRole) {
    layer.add(
      new Konva.Text({
        text: data.playerRole,
        x: quoteX,
        y: H * 0.74 + 30,
        width: quoteW,
        fontSize: 13,
        fontFamily: FONT_BODY,
        fill: "rgba(255,255,255,0.45)",
        letterSpacing: 1,
        fontStyle: "500",
      }),
    );
  }

  // watermark
  layer.add(
    new Konva.Text({
      text: "ENORMITY OF LFC",
      x: PAD,
      y: H - 36,
      width: W - PAD * 2,
      fontSize: 12,
      fontFamily: FONT_DISPLAY,
      fill: "rgba(255,255,255,0.12)",
      letterSpacing: 3,
      align: "right",
    }),
  );

  layer.draw();
}

// LINEUP PITCH

function drawPitch(
  layer: Konva.Layer,
  px: number,
  py: number,
  pw: number,
  ph: number,
) {
  const lc = "rgba(255,255,255,0.30)"; // line colour
  const lw = 2;

  // outer boundary
  layer.add(
    new Konva.Rect({
      x: px,
      y: py,
      width: pw,
      height: ph,
      stroke: lc,
      strokeWidth: lw,
      fill: "rgba(0,0,0,0)",
    }),
  );

  // halfway line
  layer.add(
    new Konva.Line({
      points: [px, py + ph / 2, px + pw, py + ph / 2],
      stroke: lc,
      strokeWidth: lw,
    }),
  );

  // centre circle
  const cx = px + pw / 2;
  const cy = py + ph / 2;
  const cr = pw * 0.13;
  layer.add(
    new Konva.Circle({
      x: cx,
      y: cy,
      radius: cr,
      stroke: lc,
      strokeWidth: lw,
      fill: "rgba(0,0,0,0)",
    }),
  );
  layer.add(new Konva.Circle({ x: cx, y: cy, radius: 3, fill: lc }));

  // penalty areas - attacking end (top, where liverpool attack)
  const paw = pw * 0.6; // penalty area width
  const pah = ph * 0.18; // penalty area height
  const pax = px + (pw - paw) / 2;
  layer.add(
    new Konva.Rect({
      x: pax,
      y: py,
      width: paw,
      height: pah,
      stroke: lc,
      strokeWidth: lw,
      fill: "rgba(0,0,0,0)",
    }),
  );

  // 6-yard box - top
  const syw = pw * 0.28;
  const syh = ph * 0.07;
  const syx = px + (pw - syw) / 2;
  layer.add(
    new Konva.Rect({
      x: syx,
      y: py,
      width: syw,
      height: syh,
      stroke: lc,
      strokeWidth: lw,
      fill: "rgba(0,0,0,0)",
    }),
  );

  // penalty spot - top
  layer.add(
    new Konva.Circle({ x: cx, y: py + ph * 0.115, radius: 3, fill: lc }),
  );

  // penalty arc - top
  layer.add(
    new Konva.Arc({
      x: cx,
      y: py + ph * 0.115,
      innerRadius: 0,
      outerRadius: cr,
      angle: 120,
      rotation: -60,
      stroke: lc,
      strokeWidth: lw,
      fill: "rgba(0,0,0,0)",
      clipFunc: (ctx: CanvasRenderingContext2D) => {
        ctx.rect(px, py + pah, pw, ph); // clip to only show arc outside box
      },
    }),
  );

  // penalty area - defending end (bottom, goalkeeper end)
  layer.add(
    new Konva.Rect({
      x: pax,
      y: py + ph - pah,
      width: paw,
      height: pah,
      stroke: lc,
      strokeWidth: lw,
      fill: "rgba(0,0,0,0)",
    }),
  );

  // 6-yard box - bottom (bottom, goalkeeper end)
  layer.add(
    new Konva.Rect({
      x: syx,
      y: py + ph - syh,
      width: syw,
      height: syh,
      stroke: lc,
      strokeWidth: lw,
      fill: "rgba(0,0,0,0)",
    }),
  );

  // penalty spot - bottom
  layer.add(
    new Konva.Circle({ x: cx, y: py + ph - ph * 0.115, radius: 3, fill: lc }),
  );

  // corner arcs
  const cornerR = pw * 0.03;
  [
    { x: px, y: py, rot: 0 },
    { x: px + pw, y: py, rot: 270 },
    { x: px, y: py + ph, rot: 90 },
    { x: px + pw, y: py + ph, rot: 180 },
  ].forEach(({ x, y, rot }) => {
    layer.add(
      new Konva.Arc({
        x,
        y,
        innerRadius: 0,
        outerRadius: cornerR,
        angle: 90,
        rotation: rot,
        stroke: lc,
        strokeWidth: lw,
        fill: "rgba(0,0,0,0)",
      }),
    );
  });
}

function drawPlayerDot(
  layer: Konva.Layer,
  px: number,
  py: number,
  pw: number,
  ph: number,
  player: LineupPlayer,
  dotR: number,
  accentColor: string,
) {
  const bx = px + player.x * pw;
  const by = py + player.y * ph;

  // outer ring
  layer.add(
    new Konva.Circle({
      x: bx,
      y: by,
      radius: dotR + 3,
      fill: "rgba(0,0,0,0.5)",
      stroke: accentColor,
      strokeWidth: 2,
    }),
  );

  // fill
  layer.add(
    new Konva.Circle({ x: bx, y: by, radius: dotR, fill: accentColor }),
  );

  // number
  if (player.number !== null) {
    layer.add(
      new Konva.Text({
        x: bx - dotR,
        y: by - dotR * 0.7,
        width: dotR * 2,
        text: String(player.number),
        fontSize: dotR * 1.0,
        fontFamily: "Bebas Neue",
        fill: "#fff",
        align: "center",
      }),
    );
  }

  // name label below dot
  layer.add(
    new Konva.Text({
      x: bx - 60,
      y: by + dotR + 5,
      width: 120,
      text: player.name.split(" ").pop() ?? player.name,
      fontSize: 17,
      fontFamily: "DM Sans",
      fontStyle: "600",
      fill: "#fff",
      align: "center",
      shadowColor: "rgba(0,0,0,0.9)",
      shadowBlur: 6,
      shadowOffsetX: 0,
      shadowOffsetY: 1,
    }),
  );
}

export async function renderLineup(
  stage: Konva.Stage,
  data: LineupData,
  W: number,
  H: number = W,
): Promise<void> {
  stage.destroyChildren();
  const layer = new Konva.Layer();
  stage.add(layer);

  const ACCENT = data.competitionColor || "#C8102E";
  const PAD = 44;

  // dark base
  layer.add(
    new Konva.Rect({ x: 0, y: 0, width: W, height: H, fill: "#0e1117" }),
  );

  // background image
  if (data.bgImage) {
    try {
      const img = await loadImage(data.bgImage);
      const { w, h, x, y } = coverFit(img.width, img.height, W, H);
      layer.add(
        new Konva.Image({
          image: img,
          x,
          y,
          width: w,
          height: h,
          opacity: 0.18,
        }),
      );
    } catch {
      // ignore
    }
  }

  // full dark gradient vignette over everything
  layer.add(
    new Konva.Rect({
      x: 0,
      y: 0,
      width: W,
      height: H,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: H },
      fillLinearGradientColorStops: [
        0,
        "rgba(0,0,0,0.55)",
        0.5,
        "rgba(0,0,0,0.2)",
        1,
        "rgba(0,0,0,0.75)",
      ],
    }),
  );

  // layout zones
  const HEADER_H = 90; // top: competition + match
  const FOOTER_H = H > 1080 ? 260 : 200; // subs strip
  const PITCH_TOP = HEADER_H + 12;
  const PITCH_H = H - PITCH_TOP - FOOTER_H - 16;
  const PITCH_PAD_X = PAD + 10;
  const pw = W - PITCH_PAD_X * 2;
  const ph = PITCH_H;
  const px = PITCH_PAD_X;
  const py = PITCH_TOP;

  // subtle pitch green tint
  layer.add(
    new Konva.Rect({
      x: px - 2,
      y: py - 2,
      width: pw + 4,
      height: ph + 4,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: ph },
      fillLinearGradientColorStops: [
        0,
        "rgba(20,80,30,0.35)",
        0.5,
        "rgba(15,60,25,0.20)",
        1,
        "rgba(20,80,30,0.35)",
      ],
      cornerRadius: 4,
    }),
  );

  // draw pitch lines
  drawPitch(layer, px, py, pw, ph);

  // players
  const dotR = W > 1080 ? 26 : 22;
  for (const player of data.players) {
    drawPlayerDot(layer, px, py, pw, ph, player, dotR, ACCENT);
  }

  // header: competition + match info
  let headerX = PAD;

  if (data.competitionIcon) {
    try {
      const ci = await loadImage(data.competitionIcon);
      layer.add(
        new Konva.Image({
          image: ci,
          x: headerX,
          y: 18,
          width: 36,
          height: 36,
        }),
      );
      headerX += 46;
    } catch {
      // ignore
    }
  }

  if (data.competition) {
    layer.add(
      new Konva.Text({
        text: data.competition.toUpperCase(),
        x: data.competitionIcon ? headerX : PAD,
        y: 26,
        fontSize: 13,
        fontFamily: "DM Sans",
        fontStyle: "600",
        fill: "rgba(255,255,255,0.5)",
        letterSpacing: 2,
      }),
    );
  }

  // match: home vs away
  const homeName = data.homeTeam?.name ?? "LIVERPOOL FC";
  const awayName = data.awayTeam?.name ?? "OPPONENT";
  const matchText = `${homeName.toUpperCase()}  vs  ${awayName.toUpperCase()}`;
  layer.add(
    new Konva.Text({
      text: matchText,
      x: PAD,
      y: 50,
      width: W - PAD * 2 - 120,
      fontSize: 24,
      fontFamily: "Bebas Neue",
      fill: "#fff",
      letterSpacing: 3,
    }),
  );

  // formation badge (top right)
  layer.add(
    new Konva.Text({
      text: data.formation,
      x: W - PAD - 90,
      y: 18,
      width: 90,
      fontSize: 32,
      fontFamily: "Bebas Neue",
      fill: ACCENT,
      letterSpacing: 2,
      align: "right",
    }),
  );

  // lineup label
  layer.add(
    new Konva.Text({
      text: "STARTING XI",
      x: W - PAD - 90,
      y: 54,
      width: 90,
      fontSize: 11,
      fontFamily: "DM Sans",
      fontStyle: "600",
      fill: "rgba(255,255,255,0.35)",
      letterSpacing: 2,
      align: "right",
    }),
  );

  // red bar accent below header
  layer.add(
    new Konva.Rect({
      x: PAD,
      y: HEADER_H - 4,
      width: 40,
      height: 3,
      fill: ACCENT,
      cornerRadius: 1.5,
    }),
  );

  // footer: subs strip
  const FOOTER_Y = H - FOOTER_H;

  // footer background
  layer.add(
    new Konva.Rect({
      x: 0,
      y: FOOTER_Y,
      width: W,
      height: FOOTER_H,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: FOOTER_H },
      fillLinearGradientColorStops: [
        0,
        "rgba(0,0,0,0.75)",
        1,
        "rgba(0,0,0,0.95)",
      ],
    }),
  );

  // divider line
  layer.add(
    new Konva.Line({
      points: [PAD, FOOTER_Y + 1, W - PAD, FOOTER_Y + 1],
      stroke: "rgba(255,255,255,0.10)",
      strokeWidth: 1,
    }),
  );

  // "subs" label + manager
  layer.add(
    new Konva.Text({
      text: "SUBSTITUTES",
      x: PAD,
      y: FOOTER_Y + 14,
      fontSize: 12,
      fontFamily: "DM Sans",
      fontStyle: "600",
      fill: ACCENT,
      letterSpacing: 3,
    }),
  );

  if (data.manager) {
    layer.add(
      new Konva.Text({
        text: `MGR: ${data.manager.toUpperCase()}`,
        x: PAD,
        y: FOOTER_Y + 14,
        width: W - PAD * 2,
        fontSize: 12,
        fontFamily: "DM Sans",
        fontStyle: "600",
        fill: "rgba(255,255,255,0.35)",
        letterSpacing: 2,
        align: "right",
      }),
    );
  }

  // sub player chips
  const subs = data.subs.slice(0, 9);
  const chipW = Math.min(
    Math.floor((W - PAD * 2) / Math.max(subs.length, 1)) - 8,
    110,
  );
  const chipH = FOOTER_H - 55;
  const totalChipsW = subs.length * (chipW + 8) - 8;
  const chipsStartX = (W - totalChipsW) / 2;
  const chipY = FOOTER_Y + 36;

  subs.forEach((sub, i) => {
    const cx = chipsStartX + i * (chipW + 8);

    // chip bg
    layer.add(
      new Konva.Rect({
        x: cx,
        y: chipY,
        width: chipW,
        height: chipH,
        fill: "rgba(255,255,255,0.06)",
        stroke: "rgba(255,255,255,0.10)",
        strokeWidth: 1,
        cornerRadius: 6,
      }),
    );

    // number
    if (sub.number !== null) {
      layer.add(
        new Konva.Text({
          text: String(sub.number),
          x: cx,
          y: chipY + 8,
          width: chipW,
          fontSize: 28,
          fontFamily: "Bebas Neue",
          fill: ACCENT,
          align: "center",
        }),
      );
    }

    // name
    layer.add(
      new Konva.Text({
        text: (sub.name.split(" ").pop() ?? sub.name).toUpperCase(),
        x: cx + 4,
        y: chipY + chipH - 24,
        width: chipW - 8,
        fontSize: 11,
        fontFamily: "DM Sans",
        fontStyle: "600",
        fill: "rgba(255,255,255,0.75)",
        align: "center",
        letterSpacing: 0.5,
      }),
    );
  });

  // watermark
  layer.add(
    new Konva.Text({
      text: "ENORMITY OF LFC",
      x: PAD,
      y: H - 22,
      width: W - PAD * 2,
      fontSize: 11,
      fontFamily: "Bebas Neue",
      fill: "rgba(255,255,255,0.08)",
      letterSpacing: 3,
      align: "right",
    }),
  );

  // red bottom bar
  layer.add(
    new Konva.Rect({ x: 0, y: H - 6, width: W, height: 6, fill: ACCENT }),
  );

  layer.draw();
}
