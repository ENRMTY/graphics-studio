import Konva from "konva";
import type { GoalsData } from "@types";
import { loadImage, coverFit, FONT_DISPLAY } from "./helpers";

export async function renderGoals(
  stage: Konva.Stage,
  data: GoalsData,
  W: number,
  H: number = W,
): Promise<void> {
  stage.destroyChildren();
  const layer = new Konva.Layer();
  stage.add(layer);

  layer.add(
    new Konva.Rect({ x: 0, y: 0, width: W, height: H, fill: "#101014" }),
  );

  if (data.bgImage) {
    try {
      const img = await loadImage(data.bgImage);
      const { w, h, x, y } = coverFit(img.width, img.height, W, H);
      layer.add(new Konva.Image({ image: img, x, y, width: w, height: h }));
    } catch {
      // ignore
    }
  }

  const count = Math.min(6, Math.max(3, data.count || 3));
  const times = Array.from({ length: count }, (_, i) => {
    const raw = (data.minutes?.[i] ?? "").replace(/[^\d]/g, "");
    return `${raw || "0"}'`;
  });

  const gap = Math.round(W * (count <= 3 ? 0.04 : count === 4 ? 0.028 : 0.018));
  const pad = Math.round(W * 0.04);

  const widthAt = (text: string, size: number) => {
    const node = new Konva.Text({
      text,
      fontSize: size,
      fontFamily: FONT_DISPLAY,
      letterSpacing: -1,
    });
    const width = node.width();
    node.destroy();
    return width;
  };

  let size = Math.round(Math.min(W, H) * 0.34);
  const rowWidth = (s: number) =>
    times.reduce((sum, text) => sum + widthAt(text, s), 0);
  while (size > 48 && rowWidth(size) + gap * (count - 1) > W - pad * 2) {
    size -= 2;
  }

  const widths = times.map((text) => widthAt(text, size));
  const total = widths.reduce((sum, w) => sum + w, 0) + gap * (count - 1);
  let x = (W - total) / 2;
  const y = Math.round(H * 0.035);

  times.forEach((text, i) => {
    drawGlowNumber(layer, text, x, y, size, widths[i]);
    x += widths[i] + gap;
  });

  await drawBadge(layer, data, W, H);
  layer.draw();
}

function drawGlowNumber(
  layer: Konva.Layer,
  text: string,
  x: number,
  y: number,
  size: number,
  width: number,
) {
  const base = {
    text,
    y,
    width,
    align: "center" as const,
    fontSize: size,
    fontFamily: FONT_DISPLAY,
    letterSpacing: -1,
    wrap: "none" as const,
  };

  layer.add(
    new Konva.Text({
      ...base,
      x: x - size * 0.012,
      fill: "#ff3b3b",
      opacity: 0.85,
      shadowColor: "#ff3b3b",
      shadowBlur: size * 0.14,
      shadowOpacity: 0.9,
    }),
  );
  layer.add(
    new Konva.Text({
      ...base,
      x: x + size * 0.014,
      fill: "#C8102E",
      opacity: 0.75,
      shadowColor: "#C8102E",
      shadowBlur: size * 0.14,
      shadowOpacity: 0.85,
    }),
  );
  layer.add(
    new Konva.Text({
      ...base,
      x,
      fill: "#ffffff",
      shadowColor: "rgba(200,16,46,0.95)",
      shadowBlur: size * 0.1,
      shadowOpacity: 0.85,
    }),
  );
}

async function drawBadge(
  layer: Konva.Layer,
  data: GoalsData,
  W: number,
  H: number,
) {
  const s = Math.round(Math.min(W, H) * 0.11);
  const x = Math.round(W * 0.05);
  const y = H - s - Math.round(Math.min(W, H) * 0.05);

  if (data.competitionIcon) {
    try {
      const icon = await loadImage(data.competitionIcon);
      layer.add(
        new Konva.Image({
          image: icon,
          x,
          y,
          width: s,
          height: s,
        }),
      );
      return;
    } catch {
      // fall through to the name
    }
  }

  if (data.competition) {
    layer.add(
      new Konva.Text({
        text: data.competition.toUpperCase(),
        x,
        y: y + s * 0.35,
        fontSize: Math.round(s * 0.28),
        fontFamily: FONT_DISPLAY,
        fill: "#FFFFFF",
        letterSpacing: 2,
      }),
    );
  }
}
