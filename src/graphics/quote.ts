import Konva from "konva";
import { QuoteData } from "@types";
import { loadImage, coverFit, FONT_BODY, FONT_DISPLAY } from "./helpers";

export async function renderQuote(
  stage: Konva.Stage,
  data: QuoteData,
  W: number,
  H: number = W,
): Promise<void> {
  stage.destroyChildren();
  const layer = new Konva.Layer();
  stage.add(layer);

  const ACCENT = data.accentColor || "#C8102E";
  const PAD = Math.round(W * 0.058);
  const RED_BAR_H = Math.round(W * 0.034);
  const position = data.layout === "top" ? "top" : "bottom";
  const big = data.quoteSize === "big";

  layer.add(
    new Konva.Rect({ x: 0, y: 0, width: W, height: H, fill: "#101014" }),
  );

  const photo = data.bgImage || data.playerImage;
  if (photo) {
    try {
      const img = await loadImage(photo);
      const { w, h, x, y } = coverFit(img.width, img.height, W, H);
      layer.add(new Konva.Image({ image: img, x, y, width: w, height: h }));
    } catch {
      // ignore
    }
  }

  if (position === "bottom") {
    layer.add(
      new Konva.Rect({
        x: 0,
        y: H * 0.4,
        width: W,
        height: H * 0.6,
        listening: false,
        fillLinearGradientStartPoint: { x: 0, y: 0 },
        fillLinearGradientEndPoint: { x: 0, y: H * 0.6 },
        fillLinearGradientColorStops: [
          0,
          "rgba(0,0,0,0)",
          0.4,
          "rgba(0,0,0,0.48)",
          0.75,
          "rgba(0,0,0,0.82)",
          1,
          "rgba(0,0,0,0.96)",
        ],
      }),
    );
  } else {
    layer.add(
      new Konva.Rect({
        x: 0,
        y: 0,
        width: W,
        height: H * 0.55,
        listening: false,
        fillLinearGradientStartPoint: { x: 0, y: 0 },
        fillLinearGradientEndPoint: { x: 0, y: H * 0.55 },
        fillLinearGradientColorStops: [
          0,
          "rgba(0,0,0,0.72)",
          0.55,
          "rgba(0,0,0,0.38)",
          1,
          "rgba(0,0,0,0)",
        ],
      }),
    );
  }

  const quote = (data.quoteText || "Add your quote here").trim();
  const name = (data.playerName || "PLAYER NAME").toUpperCase();
  const smallSize = Math.round(W * 0.033);
  const markSize = Math.round(W * (position === "top" ? 0.09 : 0.055));
  const textX = position === "top" ? PAD + Math.round(markSize * 0.62) : PAD;
  const textW = W - textX - PAD;
  const quoteFont = big
    ? fitSize(quote, textW, H * 0.38, Math.round(W * 0.055), smallSize)
    : smallSize;
  const stroke = big ? Math.max(2, quoteFont * 0.065) : 0;
  const quoteH = measureText(quote, textW, quoteFont);

  if (position === "bottom") {
    const quoteY = H - RED_BAR_H - Math.round(W * 0.048) - quoteH;
    addQuote(layer, quote, PAD, quoteY, textW, quoteFont, stroke);

    const ruleY = quoteY - Math.round(W * 0.02);
    layer.add(
      new Konva.Rect({
        x: PAD + Math.round(markSize * 0.42),
        y: ruleY,
        width: Math.round(W * 0.145),
        height: Math.max(3, Math.round(W * 0.0035)),
        fill: ACCENT,
      }),
    );

    const nameSize = Math.round(W * 0.05);
    const nameY = ruleY - Math.round(nameSize * 0.86);
    layer.add(
      new Konva.Text({
        text: "\u201C",
        x: PAD - Math.round(W * 0.006),
        y: nameY - Math.round(markSize * 0.28),
        fontSize: markSize,
        fontFamily: FONT_DISPLAY,
        fill: ACCENT,
      }),
    );
    layer.add(
      new Konva.Text({
        text: name,
        x: PAD + Math.round(markSize * 0.42),
        y: nameY,
        width: textW - Math.round(markSize * 0.42),
        fontSize: nameSize,
        fontFamily: FONT_DISPLAY,
        fill: "#FFFFFF",
        letterSpacing: 1.2,
      }),
    );
  } else {
    const topY = Math.round(W * 0.055);
    layer.add(
      new Konva.Text({
        text: "\u201C",
        x: PAD - Math.round(W * 0.008),
        y: topY - Math.round(markSize * 0.22),
        fontSize: markSize,
        fontFamily: FONT_DISPLAY,
        fill: ACCENT,
      }),
    );
    addQuote(layer, quote, textX, topY, textW, quoteFont, stroke);

    const ruleY = topY + quoteH + Math.round(W * 0.018);
    layer.add(
      new Konva.Rect({
        x: textX,
        y: ruleY,
        width: Math.round(W * 0.145),
        height: Math.max(3, Math.round(W * 0.0035)),
        fill: ACCENT,
      }),
    );
    layer.add(
      new Konva.Text({
        text: name,
        x: textX,
        y: ruleY + Math.round(W * 0.016),
        width: textW,
        fontSize: Math.round(W * 0.026),
        fontFamily: FONT_DISPLAY,
        fill: "rgba(255,255,255,0.92)",
        letterSpacing: 2.4,
      }),
    );
  }

  const brandY =
    position === "bottom"
      ? Math.round(W * 0.046)
      : H - RED_BAR_H - Math.round(W * 0.048);
  layer.add(
    new Konva.Text({
      text: "ENORMITY OF LFC",
      x: PAD,
      y: brandY,
      width: W - PAD * 2,
      align: "right",
      fontSize: Math.round(W * 0.014),
      fontFamily: FONT_DISPLAY,
      fill: "rgba(255,255,255,0.9)",
      letterSpacing: 2.2,
    }),
  );

  if (data.competitionIcon) {
    try {
      const ci = await loadImage(data.competitionIcon);
      const s = Math.round(W * 0.044);
      const iconY =
        position === "bottom"
          ? Math.round(W * 0.038)
          : H - RED_BAR_H - s - Math.round(W * 0.045);
      layer.add(
        new Konva.Image({ image: ci, x: PAD, y: iconY, width: s, height: s }),
      );
    } catch {
      // ignore
    }
  }

  layer.add(
    new Konva.Rect({
      x: 0,
      y: H - RED_BAR_H,
      width: W,
      height: RED_BAR_H,
      fill: ACCENT,
    }),
  );

  layer.draw();
}

function addQuote(
  layer: Konva.Layer,
  text: string,
  x: number,
  y: number,
  width: number,
  fontSize: number,
  stroke: number,
) {
  layer.add(
    new Konva.Text({
      text,
      x,
      y,
      width,
      fontSize,
      fontFamily: FONT_BODY,
      fontStyle: "bold",
      fill: "#FFFFFF",
      stroke: stroke > 0 ? "#FFFFFF" : undefined,
      strokeWidth: stroke,
      fillAfterStrokeEnabled: true,
      lineHeight: 1.22,
      wrap: "word",
    }),
  );
}

function measureText(text: string, width: number, fontSize: number) {
  const node = new Konva.Text({
    text,
    width,
    fontSize,
    fontFamily: FONT_BODY,
    fontStyle: "bold",
    lineHeight: 1.22,
    wrap: "word",
  });
  const height = node.height();
  node.destroy();
  return height;
}

function fitSize(
  text: string,
  width: number,
  maxH: number,
  start: number,
  min: number,
) {
  let size = start;
  while (size > min && measureText(text, width, size) > maxH) size -= 2;
  return size;
}
