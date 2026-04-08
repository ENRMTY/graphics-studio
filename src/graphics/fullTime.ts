import Konva from "konva";
import { FullTimeData } from "@types";
import {
  loadImage,
  coverFit,
  drawTeamLogo,
  drawCompetition,
  drawEventColumns,
  FONT_DISPLAY,
} from "./helpers";

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

  // aggregate score line (two-legged ties)
  if (data.aggScoreHome !== null && data.aggScoreAway !== null) {
    layer.add(
      new Konva.Text({
        text: `AGG: ${data.aggScoreHome} – ${data.aggScoreAway}`,
        x: 0,
        y: scoreRowCY + 58,
        width: W,
        align: "center",
        fontSize: 22,
        fontFamily: FONT_DISPLAY,
        fill: "rgba(255,255,255,0.55)",
        letterSpacing: 3,
      }),
    );
  }

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
