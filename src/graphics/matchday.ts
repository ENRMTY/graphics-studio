import Konva from "konva";
import { MatchdayData } from "@types";
import {
  loadImage,
  coverFit,
  drawTeamLogo,
  drawCompetition,
  FONT_BODY,
  FONT_DISPLAY,
} from "./helpers";

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
  const OVERLAY_H = Math.min(MD_CONTENT_H + 150, H * 0.88);

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
        "rgba(0,0,0,0.09)",
        0.3,
        "rgba(0,0,0,0.18)",
        0.45,
        "rgba(0,0,0,0.45)",
        0.6,
        "rgba(0,0,0,0.63)",
        0.75,
        "rgba(0,0,0,0.74)",
        1,
        "rgba(0,0,0,0.8)",
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
