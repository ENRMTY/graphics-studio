import Konva from "konva";
import type { GoalMomentData } from "@types";
import { FONT_DISPLAY } from "./helpers";
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

export async function renderGoalMoment(
  stage: Konva.Stage,
  data: GoalMomentData,
  W: number,
  H: number = W,
) {
  stage.destroyChildren();
  const layer = new Konva.Layer();
  stage.add(layer);

  await paintPhoto(layer, data.bgImage, W, H);
  edgeScrims(layer, W, H);

  const minute = `${(data.minute || "0").replace(/[^\d]/g, "") || "0"}'`;
  const size = fitSize(minute, W * 0.72, Math.round(Math.min(W, H) * 0.34), 90);
  const width = measureDisplay(minute, size);
  drawGlow(layer, minute, (W - width) / 2, Math.round(H * 0.045), size, width);

  const bar = redBar(layer, W, H);
  const pad = Math.round(W * 0.05);
  const logoS = Math.round(Math.min(W, H) * 0.11);
  const name = (data.playerName || "SCORER").toUpperCase();
  const nameSize = Math.round(W * 0.055);
  const score = `${data.ourScore || "0"}  –  ${data.theirScore || "0"}`;
  const scoreSize = Math.round(W * 0.09);
  const opp = (data.opponent || "").toUpperCase();
  const oppSize = Math.round(W * 0.028);

  let y =
    H - bar - logoS - Math.round(Math.min(W, H) * 0.07) - Math.round(W * 0.02);
  if (opp) {
    y -= oppSize;
    layer.add(
      new Konva.Text({
        text: opp,
        x: pad,
        y,
        width: W - pad * 2,
        fontSize: oppSize,
        fontFamily: FONT_DISPLAY,
        fill: "rgba(255,255,255,0.82)",
        letterSpacing: 2,
      }),
    );
    y -= Math.round(W * 0.012);
  }
  y -= Math.round(scoreSize * 0.78);
  layer.add(
    new Konva.Text({
      text: score,
      x: pad,
      y,
      fontSize: scoreSize,
      fontFamily: FONT_DISPLAY,
      fill: "#FFFFFF",
      letterSpacing: 1,
    }),
  );
  y -= Math.round(W * 0.02);
  layer.add(
    new Konva.Rect({
      x: pad,
      y,
      width: Math.round(W * 0.14),
      height: Math.max(3, Math.round(W * 0.0035)),
      fill: RED,
    }),
  );
  y -= Math.round(nameSize * 0.82) + Math.round(W * 0.012);
  layer.add(
    new Konva.Text({
      text: name,
      x: pad,
      y,
      width: W - pad * 2,
      fontSize: nameSize,
      fontFamily: FONT_DISPLAY,
      fill: "#FFFFFF",
      letterSpacing: 1.2,
    }),
  );

  watermark(layer, W, H, bar);
  await drawCompLogo(layer, data.competitionIcon, data.competition, W, H, bar);
  layer.draw();
}
