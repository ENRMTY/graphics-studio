import Konva from "konva";
import { MatchdayData } from "@types";
import {
  loadImage,
  coverFit,
  drawTeamLogo,
  drawCompetition,
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

function drawPin(layer: Konva.Layer, x: number, y: number) {
  layer.add(
    new Konva.Path({
      x,
      y,
      data: "M8 0C3.58 0 0 3.58 0 8c0 5.2 8 14 8 14s8-8.8 8-14c0-4.42-3.58-8-8-8zm0 10.8A2.8 2.8 0 1 1 8 5.2a2.8 2.8 0 0 1 0 5.6z",
      fill: "#E10600",
      scaleX: 0.95,
      scaleY: 0.95,
    }),
  );
}

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

  const PAD = 56;
  const OVERLAY_H = H * 0.48;

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
        0.4,
        "rgba(0,0,0,0.35)",
        1,
        "rgba(0,0,0,0.72)",
      ],
    }),
  );

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

  let cursorY = H - 52;

  if (data.venue) {
    cursorY -= 32;
    drawPin(layer, PAD, cursorY - 2);
    layer.add(
      new Konva.Text({
        text: data.venue.toUpperCase(),
        x: PAD + 24,
        y: cursorY,
        fontSize: 22,
        fontFamily: FONT_DISPLAY,
        fill: "#FFFFFF",
        letterSpacing: 1.5,
      }),
    );
  }

  if (data.matchDate || data.kickoffTime) {
    cursorY -= 36;
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
        text: parts.join("  •  ").toUpperCase(),
        x: PAD,
        y: cursorY,
        width: W - PAD * 2,
        fontSize: 26,
        fontFamily: FONT_DISPLAY,
        fill: "#F5C518",
        letterSpacing: 1,
      }),
    );
  }

  const LOGO_SIZE = 118;
  const logoR = LOGO_SIZE / 2;
  const homeCx = W / 2 - 108;
  const awayCx = W / 2 + 108;

  cursorY -= 34;
  const nameY = cursorY;
  layer.add(
    new Konva.Text({
      text: (data.homeTeam?.name || "HOME").toUpperCase(),
      x: homeCx - 130,
      y: nameY,
      width: 260,
      align: "center",
      fontSize: 20,
      fontFamily: FONT_DISPLAY,
      fill: "rgba(255,255,255,0.92)",
      letterSpacing: 1.5,
    }),
  );
  layer.add(
    new Konva.Text({
      text: (data.awayTeam?.name || "AWAY").toUpperCase(),
      x: awayCx - 130,
      y: nameY,
      width: 260,
      align: "center",
      fontSize: 20,
      fontFamily: FONT_DISPLAY,
      fill: "rgba(255,255,255,0.92)",
      letterSpacing: 1.5,
    }),
  );

  cursorY -= LOGO_SIZE + 8;
  const logoRowCY = cursorY + logoR - 8;
  const glow = (data.logoStyle ?? "circled") !== "plain";
  await drawTeamLogo(
    layer,
    data.homeTeam?.logo ?? null,
    homeCx,
    logoRowCY,
    LOGO_SIZE,
    data.logoStyle ?? "circled",
    glow,
  );
  await drawTeamLogo(
    layer,
    data.awayTeam?.logo ?? null,
    awayCx,
    logoRowCY,
    LOGO_SIZE,
    data.logoStyle ?? "circled",
    glow,
  );

  if (data.competition) {
    cursorY -= 18;
    await drawCompetition(layer, data, cursorY, PAD);
    cursorY -= 8;
  }

  cursorY -= 58;
  layer.add(
    new Konva.Text({
      text: "MATCH DAY",
      x: PAD,
      y: cursorY,
      fontSize: 58,
      fontFamily: FONT_DISPLAY,
      fill: "#E10600",
      letterSpacing: 1,
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
