import Konva from "konva";
import type { MilestoneData } from "@types";
import { FONT_DISPLAY } from "./helpers";
import {
  paintPhoto,
  edgeScrims,
  redBar,
  watermark,
  measureDisplay,
  fitSize,
  drawGlow,
  drawLabel,
  drawCompLogo,
  RED,
} from "./poster";

export async function renderMilestone(
  stage: Konva.Stage,
  data: MilestoneData,
  W: number,
  H: number = W,
) {
  stage.destroyChildren();
  const layer = new Konva.Layer();
  stage.add(layer);

  await paintPhoto(layer, data.bgImage, W, H);
  edgeScrims(layer, W, H);

  const value = (data.value || "50").trim();
  const size = fitSize(value, W * 0.88, Math.round(Math.min(W, H) * 0.42), 120);
  const width = measureDisplay(value, size);
  drawGlow(layer, value, (W - width) / 2, Math.round(H * 0.04), size, width);

  const bar = redBar(layer, W, H);
  const pad = Math.round(W * 0.05);
  const logoS = Math.round(Math.min(W, H) * 0.11);
  const name = (data.playerName || "PLAYER").toUpperCase();
  const nameSize = Math.round(W * 0.05);
  const label = data.label || "Premier League goals";
  const labelSize = Math.round(W * 0.028);

  let y =
    H - bar - logoS - Math.round(Math.min(W, H) * 0.07) - Math.round(W * 0.02);
  y -= labelSize;
  drawLabel(layer, label, pad, y, W - pad * 2, labelSize);
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
