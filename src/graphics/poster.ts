import Konva from "konva";
import { loadImage, coverFit, FONT_DISPLAY, FONT_BODY } from "./helpers";

export const RED = "#C8102E";

export async function paintPhoto(
  layer: Konva.Layer,
  src: string | null,
  W: number,
  H: number,
) {
  layer.add(
    new Konva.Rect({ x: 0, y: 0, width: W, height: H, fill: "#101014" }),
  );
  if (!src) return;
  try {
    const img = await loadImage(src);
    const { w, h, x, y } = coverFit(img.width, img.height, W, H);
    layer.add(new Konva.Image({ image: img, x, y, width: w, height: h }));
  } catch {
    // ignore
  }
}

export function edgeScrims(layer: Konva.Layer, W: number, H: number) {
  layer.add(
    new Konva.Rect({
      x: 0,
      y: 0,
      width: W,
      height: H * 0.34,
      listening: false,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: H * 0.34 },
      fillLinearGradientColorStops: [0, "rgba(0,0,0,0.55)", 1, "rgba(0,0,0,0)"],
    }),
  );
  layer.add(
    new Konva.Rect({
      x: 0,
      y: H * 0.46,
      width: W,
      height: H * 0.54,
      listening: false,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: H * 0.54 },
      fillLinearGradientColorStops: [
        0,
        "rgba(0,0,0,0)",
        0.45,
        "rgba(0,0,0,0.56)",
        1,
        "rgba(0,0,0,0.94)",
      ],
    }),
  );
}

export function redBar(layer: Konva.Layer, W: number, H: number, ratio = 0.03) {
  const h = Math.round(W * ratio);
  layer.add(new Konva.Rect({ x: 0, y: H - h, width: W, height: h, fill: RED }));
  return h;
}

export function watermark(
  layer: Konva.Layer,
  W: number,
  H: number,
  barH: number,
) {
  layer.add(
    new Konva.Text({
      text: "ENORMITY OF LFC",
      x: Math.round(W * 0.05),
      y: H - barH - Math.round(W * 0.048),
      width: W - Math.round(W * 0.1),
      align: "right",
      fontSize: Math.round(W * 0.014),
      fontFamily: FONT_DISPLAY,
      fill: "rgba(255,255,255,0.9)",
      letterSpacing: 2.2,
    }),
  );
}

export function measureDisplay(text: string, size: number, spacing = -1) {
  const node = new Konva.Text({
    text,
    fontSize: size,
    fontFamily: FONT_DISPLAY,
    letterSpacing: spacing,
  });
  const width = node.width();
  node.destroy();
  return width;
}

export function fitSize(
  text: string,
  maxW: number,
  start: number,
  min: number,
  spacing = -1,
) {
  let size = start;
  while (size > min && measureDisplay(text, size, spacing) > maxW) size -= 4;
  return size;
}

export function drawGlow(
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
      fill: RED,
      opacity: 0.75,
      shadowColor: RED,
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

export function drawLabel(
  layer: Konva.Layer,
  text: string,
  x: number,
  y: number,
  width: number,
  size: number,
) {
  layer.add(
    new Konva.Text({
      text: text.toUpperCase(),
      x,
      y,
      width,
      fontSize: size,
      fontFamily: FONT_BODY,
      fontStyle: "700",
      fill: "rgba(255,255,255,0.9)",
      letterSpacing: Math.round(size * 0.12),
      wrap: "word",
    }),
  );
}

export async function drawCompLogo(
  layer: Konva.Layer,
  icon: string | null,
  name: string,
  W: number,
  H: number,
  barH: number,
) {
  const s = Math.round(Math.min(W, H) * 0.11);
  const x = Math.round(W * 0.05);
  const y = H - barH - s - Math.round(Math.min(W, H) * 0.055);
  if (icon) {
    try {
      const img = await loadImage(icon);
      layer.add(new Konva.Image({ image: img, x, y, width: s, height: s }));
      return;
    } catch {
      // name fallback
    }
  }
  if (name) {
    layer.add(
      new Konva.Text({
        text: name.toUpperCase(),
        x,
        y: y + s * 0.3,
        width: W * 0.4,
        fontSize: Math.round(s * 0.28),
        fontFamily: FONT_DISPLAY,
        fill: "#FFFFFF",
        letterSpacing: 2,
      }),
    );
  }
}

export function ordinal(raw: string) {
  const n = parseInt(raw.replace(/[^\d]/g, ""), 10);
  if (!n) return (raw || "1").toUpperCase();
  const mod = n % 100;
  const suffix =
    mod >= 11 && mod <= 13 ? "TH" : (["TH", "ST", "ND", "RD"][n % 10] ?? "TH");
  return `${n}${suffix}`;
}
