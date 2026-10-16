import Konva from "konva";
import type { NextUpData } from "@types";
import { loadImage, FONT_DISPLAY, FONT_BODY } from "./helpers";
import {
  paintPhoto,
  edgeScrims,
  redBar,
  watermark,
  measureDisplay,
  fitSize,
  drawGlow,
  drawCompLogo,
  RED,
} from "./poster";

export async function renderNextUp(
  stage: Konva.Stage,
  data: NextUpData,
  W: number,
  H: number = W,
) {
  stage.destroyChildren();
  const layer = new Konva.Layer();
  stage.add(layer);

  await paintPhoto(layer, data.bgImage, W, H);
  edgeScrims(layer, W, H);

  const pad = Math.round(W * 0.05);
  const logoS = Math.round(Math.min(W, H) * 0.16);
  const colW = (W - pad * 2 - Math.round(W * 0.16)) / 2;
  const top = Math.round(H * 0.07);

  layer.add(
    new Konva.Text({
      text: "NEXT UP",
      x: pad,
      y: top,
      width: W - pad * 2,
      align: "center",
      fontSize: Math.round(W * 0.028),
      fontFamily: FONT_BODY,
      fontStyle: "700",
      fill: "rgba(255,255,255,0.85)",
      letterSpacing: 3,
    }),
  );

  const logoY = top + Math.round(W * 0.05);
  const leftX = pad;
  const rightX = W - pad - colW;
  await drawSide(
    layer,
    data.usName || "Liverpool",
    data.usLogo,
    leftX,
    logoY,
    colW,
    logoS,
    W,
  );
  await drawSide(
    layer,
    data.opponent || "Opponent",
    data.opponentLogo,
    rightX,
    logoY,
    colW,
    logoS,
    W,
  );

  layer.add(
    new Konva.Text({
      text: "VS",
      x: 0,
      y: logoY + logoS * 0.32,
      width: W,
      align: "center",
      fontSize: Math.round(W * 0.055),
      fontFamily: FONT_DISPLAY,
      fill: RED,
      letterSpacing: 1,
    }),
  );

  const kick = (data.kickoff || "20:00").trim();
  const kickSize = fitSize(
    kick,
    W * 0.7,
    Math.round(Math.min(W, H) * 0.16),
    64,
  );
  const kickW = measureDisplay(kick, kickSize);
  const kickY = H * 0.52;
  drawGlow(layer, kick, (W - kickW) / 2, kickY, kickSize, kickW);

  const zone = (data.timezone || "").trim().toUpperCase();
  if (zone) {
    layer.add(
      new Konva.Text({
        text: zone,
        x: (W + kickW) / 2 + Math.round(W * 0.018),
        y: kickY + kickSize * 0.32,
        fontSize: Math.round(W * 0.026),
        fontFamily: FONT_BODY,
        fontStyle: "700",
        fill: "rgba(255,255,255,0.9)",
        letterSpacing: 1.4,
      }),
    );
  }

  layer.add(
    new Konva.Rect({
      x: (W - Math.round(W * 0.14)) / 2,
      y: kickY - Math.round(W * 0.02),
      width: Math.round(W * 0.14),
      height: Math.max(3, Math.round(W * 0.0035)),
      fill: RED,
    }),
  );

  if (data.matchDate) {
    layer.add(
      new Konva.Text({
        text: data.matchDate.toUpperCase(),
        x: pad,
        y: kickY + Math.round(kickSize * 0.82),
        width: W - pad * 2,
        align: "center",
        fontSize: Math.round(W * 0.028),
        fontFamily: FONT_BODY,
        fontStyle: "700",
        fill: "rgba(255,255,255,0.88)",
        letterSpacing: 2,
      }),
    );
  }

  const bar = redBar(layer, W, H);
  watermark(layer, W, H, bar);
  await drawCompLogo(layer, data.competitionIcon, data.competition, W, H, bar);
  layer.draw();
}

async function drawSide(
  layer: Konva.Layer,
  name: string,
  logo: string | null,
  x: number,
  y: number,
  colW: number,
  logoS: number,
  W: number,
) {
  const label = name.toUpperCase();
  if (logo) {
    try {
      const img = await loadImage(logo);
      layer.add(
        new Konva.Image({
          image: img,
          x: x + (colW - logoS) / 2,
          y,
          width: logoS,
          height: logoS,
        }),
      );
    } catch {
      // name only
    }
  }
  const size = fitSize(
    label,
    colW,
    Math.round(W * 0.05),
    Math.round(W * 0.026),
    0,
  );
  layer.add(
    new Konva.Text({
      text: label,
      x,
      y: y + logoS + Math.round(W * 0.012),
      width: colW,
      align: "center",
      fontSize: size,
      fontFamily: FONT_DISPLAY,
      fill: "#FFFFFF",
      wrap: "none",
      shadowColor: "rgba(200,16,46,0.9)",
      shadowBlur: size * 0.12,
      shadowOpacity: 0.8,
    }),
  );
}
