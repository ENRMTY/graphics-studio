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
  const name = (data.opponent || "OPPONENT").toUpperCase();
  let textX = pad;
  const logoS = Math.round(Math.min(W, H) * 0.14);
  if (data.opponentLogo) {
    try {
      const logo = await loadImage(data.opponentLogo);
      layer.add(
        new Konva.Image({
          image: logo,
          x: pad,
          y: Math.round(H * 0.05),
          width: logoS,
          height: logoS,
        }),
      );
      textX = pad + logoS + Math.round(W * 0.03);
    } catch {
      // name only
    }
  }

  const nameMax = W - textX - pad;
  const nameSize = fitSize(
    name,
    nameMax,
    Math.round(W * 0.12),
    Math.round(W * 0.05),
    0,
  );
  layer.add(
    new Konva.Text({
      text: "NEXT UP",
      x: textX,
      y: Math.round(H * 0.055),
      fontSize: Math.round(W * 0.028),
      fontFamily: FONT_BODY,
      fontStyle: "700",
      fill: "rgba(255,255,255,0.85)",
      letterSpacing: 3,
    }),
  );
  layer.add(
    new Konva.Text({
      text: name,
      x: textX,
      y: Math.round(H * 0.09),
      width: nameMax,
      fontSize: nameSize,
      fontFamily: FONT_DISPLAY,
      fill: "#FFFFFF",
      letterSpacing: 0.5,
      wrap: "none",
      shadowColor: "rgba(200,16,46,0.9)",
      shadowBlur: nameSize * 0.12,
      shadowOpacity: 0.85,
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
