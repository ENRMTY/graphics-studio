import Konva from "konva";
import { FullTimeData } from "@types";
import {
  loadImage,
  coverFit,
  drawTeamLogo,
  drawCompetition,
  drawEventColumns,
  eventLineCount,
  GOAL_ICON_SRC,
  RED_CARD_ICON_SRC,
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
      fillRadialGradientColorStops: [
        0,
        peak,
        0.08,
        peak,
        0.32,
        "rgba(180,12,26,0.32)",
        0.68,
        "rgba(150,8,20,0.1)",
        1,
        "rgba(120,0,12,0)",
      ],
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
      const photo = new Konva.Image({ image: img, x, y, width: w, height: h });
      layer.add(photo);
      try {
        photo.cache();
        photo.filters([Konva.Filters.Contrast, Konva.Filters.Brighten]);
        photo.contrast(8);
        photo.brightness(-0.03);
      } catch {
        photo.clearCache();
        photo.filters([]);
      }
    } catch {
      // ignore bad images
    }
  }

  // ---------------- CONSTANTS -----------------------------------------
  const PAD = 56;
  const homeEvents = data.events.filter((e) => e.side === "home");
  const awayEvents = data.events.filter((e) => e.side === "away");
  const maxEvents = Math.max(
    eventLineCount(homeEvents),
    eventLineCount(awayEvents),
    0,
  );
  const EVENT_LINE_H = 30;
  const EVENTS_BLOCK_H = maxEvents > 0 ? maxEvents * EVENT_LINE_H + 12 : 0;

  const RED_BAR_H = Math.max(12, Math.round(W * 0.014));
  const BOTTOM_PAD = 40;
  const TEAM_NAMES_H = 30;
  const SCORE_H = 150;
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
  const TEAM_NAME_LIFT = 10;
  const SCORER_LIFT = 4;
  // ---------------- END CONSTANTS -------------------------------------

  // readability scrim only behind the type — not a coloured fade on the top edge.
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

  // side washes fade inward. Kept short so the red stays on the edges, not across the face.
  const sideW = W * 0.38;
  const leftSideW = W * 0.32;
  layer.add(
    new Konva.Rect({
      x: 0,
      y: 0,
      width: leftSideW,
      height: H,
      listening: false,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: leftSideW, y: 0 },
      fillLinearGradientColorStops: [
        0,
        "rgba(176,10,28,0.5)",
        0.2,
        "rgba(160,8,22,0.18)",
        0.5,
        "rgba(140,6,18,0.05)",
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
        "rgba(160,8,22,0.4)",
        0.22,
        "rgba(150,8,20,0.16)",
        0.55,
        "rgba(140,6,18,0.05)",
        1,
        "rgba(120,0,12,0)",
      ],
    }),
  );

  const cornerR = W * 0.48;
  cornerWash(layer, 0, 0, cornerR, "rgba(210,14,34,0.78)");
  cornerWash(layer, W, 0, cornerR * 0.86, "rgba(190,10,28,0.5)");
  cornerWash(layer, 0, H, cornerR, "rgba(200,12,30,0.68)");
  cornerWash(layer, W, H, cornerR * 0.86, "rgba(180,10,26,0.42)");

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
  let redCardIcon: HTMLImageElement | null = null;
  try {
    goalIcon = await loadImage(GOAL_ICON_SRC);
  } catch {
    goalIcon = null;
  }
  try {
    redCardIcon = await loadImage(RED_CARD_ICON_SRC);
  } catch {
    redCardIcon = null;
  }

  let cursorY = H - RED_BAR_H - BOTTOM_PAD;

  const SCORE_FONT = 156;
  const scoreLabel = `${data.homeScore ?? 0} - ${data.awayScore ?? 0}`;
  const scoreMeasure = new Konva.Text({
    text: scoreLabel,
    fontSize: SCORE_FONT,
    fontFamily: FONT_DISPLAY,
    letterSpacing: -1,
  });
  const scoreW = scoreMeasure.width();
  const LOGO_SIZE = 100;
  const LOGO_GAP = 26;
  const logoR = LOGO_SIZE / 2;
  const homeLogoX = W / 2 - scoreW / 2 - LOGO_GAP - logoR;
  const awayLogoX = W / 2 + scoreW / 2 + LOGO_GAP + logoR;
  const homeNameEdge = W / 2 - Math.max(28, scoreW * 0.16);
  const awayNameEdge = W / 2 + Math.max(28, scoreW * 0.16);

  if (maxEvents > 0) {
    cursorY -= EVENTS_BLOCK_H;
    await drawEventColumns(
      layer,
      homeEvents,
      awayEvents,
      cursorY - SCORER_LIFT,
      W,
      EVENT_LINE_H,
      goalIcon,
      redCardIcon,
      homeNameEdge,
      awayNameEdge,
    );
    cursorY -= 8;
  }

  cursorY -= TEAM_NAMES_H;
  layer.add(
    new Konva.Text({
      text: (data.homeTeam?.name || "HOME").toUpperCase(),
      x: 0,
      y: cursorY - TEAM_NAME_LIFT,
      width: homeNameEdge,
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
      x: awayNameEdge,
      y: cursorY - TEAM_NAME_LIFT,
      width: W - awayNameEdge,
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
        y: scoreRowCY - 108,
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
      text: scoreLabel,
      x: (W - scoreW) / 2,
      y: scoreRowCY - SCORE_FONT * 0.45,
      fontSize: SCORE_FONT,
      fontFamily: FONT_DISPLAY,
      fill: "#FFFFFF",
      stroke: "#FFFFFF",
      strokeWidth: 3,
      fillAfterStrokeEnabled: true,
      lineJoin: "round",
      letterSpacing: -1,
      shadowColor: "rgba(0,0,0,0.45)",
      shadowBlur: 8,
      shadowOffsetY: 2,
    }),
  );

  await drawTeamLogo(
    layer,
    data.homeTeam?.logo ?? null,
    homeLogoX,
    scoreRowCY - 4,
    LOGO_SIZE,
    data.logoStyle ?? "circled",
    true,
  );
  await drawTeamLogo(
    layer,
    data.awayTeam?.logo ?? null,
    awayLogoX,
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
