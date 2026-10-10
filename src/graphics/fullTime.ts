import Konva from "konva";
import { FullTimeData } from "@types";
import {
  loadImage,
  coverFit,
  drawTeamLogo,
  drawCompetition,
  drawEventColumns,
  GOAL_ICON_SRC,
  FONT_DISPLAY,
} from "./helpers";

function cornerWash(
  layer: Konva.Layer,
  x: number,
  y: number,
  radius: number,
  peak: string,
) {
  layer.add(
    new Konva.Circle({
      x,
      y,
      radius,
      listening: false,
      fillRadialGradientStartPoint: { x: 0, y: 0 },
      fillRadialGradientEndPoint: { x: 0, y: 0 },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndRadius: radius,
      fillRadialGradientColorStops: [0, peak, 0.42, "rgba(160,8,20,0.18)", 1, "rgba(120,0,12,0)"],
    }),
  );
}

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
  const EVENT_LINE_H = 30;
  const EVENTS_BLOCK_H = maxEvents > 0 ? maxEvents * EVENT_LINE_H + 12 : 0;

  const RED_BAR_H = Math.max(12, Math.round(W * 0.014));
  const BOTTOM_PAD = 40;
  const TEAM_NAMES_H = 30;
  const SCORE_H = 128;
  const COMP_H = data.competition ? 40 : 0;
  const FT_LABEL_H = 36;
  const TOP_BLOCK_PAD = 20;

  const CONTENT_H =
    BOTTOM_PAD +
    EVENTS_BLOCK_H +
    TEAM_NAMES_H +
    SCORE_H +
    COMP_H +
    FT_LABEL_H +
    TOP_BLOCK_PAD;
  const OVERLAY_H = Math.min(CONTENT_H + 80, H * 0.55);

  // Readability scrim only behind the type — not a coloured fade on the top edge.
  layer.add(
    new Konva.Rect({
      x: 0,
      y: H - OVERLAY_H,
      width: W,
      height: OVERLAY_H,
      listening: false,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: OVERLAY_H },
      fillLinearGradientColorStops: [
        0,
        "rgba(0,0,0,0)",
        0.35,
        "rgba(0,0,0,0.28)",
        1,
        "rgba(0,0,0,0.72)",
      ],
    }),
  );

  // Side washes fade inward. Top and bottom edges stay clean of this colour.
  const sideW = W * 0.46;
  layer.add(
    new Konva.Rect({
      x: 0,
      y: 0,
      width: sideW,
      height: H,
      listening: false,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: sideW, y: 0 },
      fillLinearGradientColorStops: [
        0,
        "rgba(176,10,28,0.72)",
        0.38,
        "rgba(150,8,22,0.28)",
        1,
        "rgba(120,0,12,0)",
      ],
    }),
  );
  layer.add(
    new Konva.Rect({
      x: W - sideW,
      y: 0,
      width: sideW,
      height: H,
      listening: false,
      fillLinearGradientStartPoint: { x: sideW, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: 0 },
      fillLinearGradientColorStops: [
        0,
        "rgba(150,8,22,0.42)",
        0.4,
        "rgba(140,6,18,0.14)",
        1,
        "rgba(120,0,12,0)",
      ],
    }),
  );

  const cornerR = W * 0.42;
  cornerWash(layer, 0, 0, cornerR, "rgba(196,12,32,0.78)");
  cornerWash(layer, W, 0, cornerR * 0.85, "rgba(170,8,24,0.48)");
  cornerWash(layer, 0, H, cornerR, "rgba(186,10,28,0.7)");
  cornerWash(layer, W, H, cornerR * 0.85, "rgba(160,8,22,0.45)");

  layer.add(
    new Konva.Rect({
      x: 0,
      y: H - RED_BAR_H,
      width: W,
      height: RED_BAR_H,
      fill: "#C8102E",
    }),
  );

  let goalIcon: HTMLImageElement | null = null;
  try {
    goalIcon = await loadImage(GOAL_ICON_SRC);
  } catch {
    goalIcon = null;
  }

  let cursorY = H - RED_BAR_H - BOTTOM_PAD;

  if (maxEvents > 0) {
    cursorY -= EVENTS_BLOCK_H;
    await drawEventColumns(
      layer,
      homeEvents,
      awayEvents,
      cursorY,
      W,
      EVENT_LINE_H,
      goalIcon,
    );
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
      fill: "rgba(255,255,255,0.78)",
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
      fill: "rgba(255,255,255,0.78)",
      letterSpacing: 2,
    }),
  );

  cursorY -= SCORE_H;
  const scoreRowCY = cursorY + SCORE_H / 2;
  if (data.aggScoreHome !== null && data.aggScoreAway !== null) {
    layer.add(
      new Konva.Text({
        text: `AGG: ${data.aggScoreHome} – ${data.aggScoreAway}`,
        x: 0,
        y: scoreRowCY - 96,
        width: W,
        align: "center",
        fontSize: 22,
        fontFamily: FONT_DISPLAY,
        fill: "rgba(255,255,255,0.55)",
        letterSpacing: 3,
      }),
    );
  }

  layer.add(
    new Konva.Text({
      text: `${data.homeScore ?? 0}  -  ${data.awayScore ?? 0}`,
      x: 0,
      y: scoreRowCY - 62,
      width: W,
      align: "center",
      fontSize: 128,
      fontFamily: FONT_DISPLAY,
      fill: "#FFFFFF",
      letterSpacing: 1,
      shadowColor: "rgba(0,0,0,0.45)",
      shadowBlur: 8,
      shadowOffsetY: 2,
    }),
  );

  const LOGO_SIZE = 92;
  await drawTeamLogo(
    layer,
    data.homeTeam?.logo ?? null,
    W / 2 - 230,
    scoreRowCY - 4,
    LOGO_SIZE,
    data.logoStyle ?? "circled",
    true,
  );
  await drawTeamLogo(
    layer,
    data.awayTeam?.logo ?? null,
    W / 2 + 230,
    scoreRowCY - 4,
    LOGO_SIZE,
    data.logoStyle ?? "circled",
    true,
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
      fontSize: 26,
      fontFamily: FONT_DISPLAY,
      fill: "#E10600",
      letterSpacing: 4,
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
      fill: "rgba(255,255,255,0.28)",
      letterSpacing: 3,
      align: "right",
    }),
  );

  layer.draw();
}