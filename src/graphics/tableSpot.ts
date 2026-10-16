import Konva from "konva";
import type { TableSpotData } from "@types";
import { FONT_DISPLAY, FONT_BODY } from "./helpers";
import {
  paintPhoto,
  edgeScrims,
  redBar,
  watermark,
  measureDisplay,
  fitSize,
  drawGlow,
  drawCompLogo,
  ordinal,
} from "./poster";

export async function renderTableSpot(
  stage: Konva.Stage,
  data: TableSpotData,
  W: number,
  H: number = W,
) {
  stage.destroyChildren();
  const layer = new Konva.Layer();
  stage.add(layer);

  await paintPhoto(layer, data.bgImage, W, H);
  edgeScrims(layer, W, H);

  const place = ordinal(data.position || "1");
  const size = fitSize(place, W * 0.8, Math.round(Math.min(W, H) * 0.4), 120);
  const width = measureDisplay(place, size);
  const x = (W - width) / 2;
  const y = Math.round(H * 0.04);
  drawGlow(layer, place, x, y, size, width);

  const statSize = Math.round(W * 0.11);
  const labelSize = Math.round(W * 0.02);
  const gap = Math.round(W * 0.08);
  const points = data.points || "0";
  const gd = data.gd || "0";
  const pointsW = Math.max(
    measureDisplay(points, statSize),
    measureDisplay("POINTS", labelSize, 2),
  );
  const gdW = Math.max(
    measureDisplay(gd, statSize),
    measureDisplay("GD", labelSize, 2),
  );
  const rowW = pointsW + gap + gdW;
  let sx = (W - rowW) / 2;
  const statY = y + Math.round(size * 0.78) + Math.round(W * 0.02);

  const stat = (text: string, label: string, at: number, w: number) => {
    layer.add(
      new Konva.Text({
        text,
        x: at,
        y: statY,
        width: w,
        align: "center",
        fontSize: statSize,
        fontFamily: FONT_DISPLAY,
        fill: "#FFFFFF",
      }),
    );
    layer.add(
      new Konva.Text({
        text: label,
        x: at,
        y: statY + Math.round(statSize * 0.78),
        width: w,
        align: "center",
        fontSize: labelSize,
        fontFamily: FONT_BODY,
        fontStyle: "700",
        fill: "rgba(255,255,255,0.85)",
        letterSpacing: 2,
      }),
    );
  };
  stat(points, "POINTS", sx, pointsW);
  sx += pointsW + gap;
  stat(gd, "GD", sx, gdW);

  const bar = redBar(layer, W, H);
  watermark(layer, W, H, bar);
  await drawCompLogo(layer, data.competitionIcon, data.competition, W, H, bar);
  layer.draw();
}
