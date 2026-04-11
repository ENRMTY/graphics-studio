import Konva from "konva";
import { QuoteData } from "@types";
import { loadImage, coverFit, FONT_BODY, FONT_DISPLAY } from "./helpers";

export async function renderQuote(
  stage: Konva.Stage,
  data: QuoteData,
  W: number,
  H: number = W,
): Promise<void> {
  const layout = data.layout ?? "classic";
  if (layout === "overlay") {
    return renderQuoteOverlay(stage, data, W, H);
  }
  return renderQuoteClassic(stage, data, W, H);
}

// classic layout
async function renderQuoteClassic(
  stage: Konva.Stage,
  data: QuoteData,
  W: number,
  H: number,
): Promise<void> {
  stage.destroyChildren();
  const layer = new Konva.Layer();
  stage.add(layer);

  const ACCENT = data.accentColor || "#C8102E";
  const PAD = 64;

  layer.add(
    new Konva.Rect({ x: 0, y: 0, width: W, height: H, fill: "#0d0d10" }),
  );

  if (data.bgImage) {
    try {
      const img = await loadImage(data.bgImage);
      const { w, h, x, y } = coverFit(img.width, img.height, W, H);
      layer.add(
        new Konva.Image({
          image: img,
          x,
          y,
          width: w,
          height: h,
          opacity: 0.25,
        }),
      );
    } catch {
      // ignore
    }
  }

  layer.add(
    new Konva.Rect({
      x: 0,
      y: 0,
      width: W,
      height: H,
      fillRadialGradientStartPoint: { x: W / 2, y: H / 2 },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndPoint: { x: W / 2, y: H / 2 },
      fillRadialGradientEndRadius: Math.max(W, H) * 0.75,
      fillRadialGradientColorStops: [0, "rgba(0,0,0,0)", 1, "rgba(0,0,0,0.82)"],
    }),
  );

  if (data.playerImage) {
    try {
      const img = await loadImage(data.playerImage);
      const imgH = H * 0.65;
      const imgW = (img.width / img.height) * imgH;
      const imgX = -imgW * 0.05;
      const imgY = H - imgH;
      layer.add(
        new Konva.Image({
          image: img,
          x: imgX,
          y: imgY,
          width: imgW,
          height: imgH,
          opacity: 0.85,
        }),
      );
      layer.add(
        new Konva.Rect({
          x: imgX,
          y: imgY,
          width: imgW,
          height: imgH,
          fillLinearGradientStartPoint: { x: imgW * 0.5, y: 0 },
          fillLinearGradientEndPoint: { x: imgW, y: 0 },
          fillLinearGradientColorStops: [
            0,
            "rgba(0,0,0,0)",
            1,
            "rgba(0,0,0,0.9)",
          ],
        }),
      );
      layer.add(
        new Konva.Rect({
          x: imgX,
          y: imgY + imgH * 0.65,
          width: imgW,
          height: imgH * 0.35,
          fillLinearGradientStartPoint: { x: 0, y: 0 },
          fillLinearGradientEndPoint: { x: 0, y: imgH * 0.35 },
          fillLinearGradientColorStops: [
            0,
            "rgba(0,0,0,0)",
            1,
            "rgba(0,0,0,0.97)",
          ],
        }),
      );
    } catch {
      // ignore
    }
  }

  if (data.competitionIcon) {
    try {
      const ci = await loadImage(data.competitionIcon);
      layer.add(
        new Konva.Image({
          image: ci,
          x: W - PAD - 32,
          y: PAD - 8,
          width: 32,
          height: 32,
        }),
      );
    } catch {
      // ignore
    }
  } else if (data.competition) {
    layer.add(
      new Konva.Text({
        text: data.competition.toUpperCase(),
        x: PAD,
        y: PAD - 4,
        width: W - PAD * 2,
        align: "right",
        fontSize: 13,
        fontFamily: FONT_BODY,
        fill: "rgba(255,255,255,0.4)",
        letterSpacing: 2,
        fontStyle: "600",
      }),
    );
  }

  layer.add(
    new Konva.Text({
      text: "\u201C",
      x: W * 0.42,
      y: H * 0.1,
      fontSize: 160,
      fontFamily: FONT_DISPLAY,
      fill: ACCENT,
      opacity: 0.18,
    }),
  );

  const quoteX = W * 0.44;
  const quoteW = W - quoteX - PAD;
  layer.add(
    new Konva.Text({
      text: `\u201C${data.quoteText || "Add your quote here"}\u201D`,
      x: quoteX,
      y: H * 0.22,
      width: quoteW,
      fontSize: 32,
      fontFamily: FONT_BODY,
      fill: "#FFFFFF",
      fontStyle: "600 italic",
      lineHeight: 1.45,
      wrap: "word",
    }),
  );

  layer.add(
    new Konva.Rect({
      x: quoteX,
      y: H * 0.72,
      width: 40,
      height: 3,
      fill: ACCENT,
      cornerRadius: 1.5,
    }),
  );
  layer.add(
    new Konva.Text({
      text: (data.playerName || "Player Name").toUpperCase(),
      x: quoteX,
      y: H * 0.74,
      width: quoteW,
      fontSize: 22,
      fontFamily: FONT_DISPLAY,
      fill: "#FFFFFF",
      letterSpacing: 3,
    }),
  );

  if (data.playerRole) {
    layer.add(
      new Konva.Text({
        text: data.playerRole,
        x: quoteX,
        y: H * 0.74 + 30,
        width: quoteW,
        fontSize: 13,
        fontFamily: FONT_BODY,
        fill: "rgba(255,255,255,0.45)",
        letterSpacing: 1,
        fontStyle: "500",
      }),
    );
  }

  layer.add(
    new Konva.Text({
      text: "ENORMITY OF LFC",
      x: PAD,
      y: H - 36,
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

// overlay layout
async function renderQuoteOverlay(
  stage: Konva.Stage,
  data: QuoteData,
  W: number,
  H: number,
): Promise<void> {
  stage.destroyChildren();
  const layer = new Konva.Layer();
  stage.add(layer);

  const ACCENT = data.accentColor || "#C8102E";
  const PAD = 56;
  const RED_BAR_H = 6;

  layer.add(
    new Konva.Rect({ x: 0, y: 0, width: W, height: H, fill: "#111114" }),
  );

  // full-bleed background image
  if (data.bgImage) {
    try {
      const img = await loadImage(data.bgImage);
      const { w, h, x, y } = coverFit(img.width, img.height, W, H);
      layer.add(new Konva.Image({ image: img, x, y, width: w, height: h }));
    } catch {
      // ignore
    }
  }

  // player image
  if (data.playerImage) {
    try {
      const img = await loadImage(data.playerImage);
      const imgH = H * 0.72;
      const imgW = (img.width / img.height) * imgH;
      const imgX = W * 0.04;
      const imgY = H - RED_BAR_H - imgH;
      layer.add(
        new Konva.Image({
          image: img,
          x: imgX,
          y: imgY,
          width: imgW,
          height: imgH,
          opacity: 0.92,
        }),
      );
      // fade bottom edge into overlay
      layer.add(
        new Konva.Rect({
          x: imgX,
          y: imgY,
          width: imgW,
          height: imgH,
          fillLinearGradientStartPoint: { x: 0, y: imgH * 0.6 },
          fillLinearGradientEndPoint: { x: 0, y: imgH },
          fillLinearGradientColorStops: [
            0,
            "rgba(0,0,0,0)",
            1,
            "rgba(0,0,0,0.95)",
          ],
        }),
      );
    } catch {
      // ignore
    }
  }

  // estimate overlay height from quote text length
  const QUOTE_FONT = 34;
  const QUOTE_LINE_H = QUOTE_FONT * 1.45;
  const quoteText = data.quoteText || "Add your quote here";
  const overlayTextW = W - PAD * 2;
  const charsPerLine = Math.floor(overlayTextW / (QUOTE_FONT * 0.52));
  const estimatedLines = Math.max(
    1,
    Math.ceil(quoteText.length / charsPerLine),
  );
  const QUOTE_BLOCK_H = estimatedLines * QUOTE_LINE_H + 16;

  const NAME_H = 38;
  const CONTEXT_H = data.matchContext ? 26 : 0;
  const DIVIDER_H = 30;
  const LABEL_H = 36;
  const BOTTOM_PAD = 36;
  const TOP_BREATHING = 24;

  const CONTENT_H =
    BOTTOM_PAD +
    QUOTE_BLOCK_H +
    DIVIDER_H +
    CONTEXT_H +
    NAME_H +
    LABEL_H +
    TOP_BREATHING;
  const OVERLAY_H = Math.min(CONTENT_H + 80, H * 0.9);

  // gradient overlay
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
        "rgba(0,0,0,0.14)",
        0.3,
        "rgba(0,0,0,0.38)",
        0.45,
        "rgba(0,0,0,0.65)",
        0.6,
        "rgba(0,0,0,0.83)",
        0.75,
        "rgba(0,0,0,0.93)",
        1,
        "rgba(0,0,0,0.97)",
      ],
    }),
  );

  // accent color bar at bottom
  layer.add(
    new Konva.Rect({
      x: 0,
      y: H - RED_BAR_H,
      width: W,
      height: RED_BAR_H,
      fill: ACCENT,
    }),
  );

  // watermark
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

  // competition label/icon in upper-right of overlay zone
  if (data.competitionIcon) {
    try {
      const ci = await loadImage(data.competitionIcon);
      layer.add(
        new Konva.Image({
          image: ci,
          x: W - PAD - 28,
          y: H - OVERLAY_H + 20,
          width: 28,
          height: 28,
        }),
      );
    } catch {
      // ignore
    }
  } else if (data.competition) {
    layer.add(
      new Konva.Text({
        text: data.competition.toUpperCase(),
        x: PAD,
        y: H - OVERLAY_H + 22,
        width: W - PAD * 2,
        align: "right",
        fontSize: 13,
        fontFamily: FONT_BODY,
        fill: "rgba(255,255,255,0.45)",
        letterSpacing: 2,
        fontStyle: "600",
      }),
    );
  }

  // content
  let cursorY = H - RED_BAR_H - BOTTOM_PAD;

  // quote text
  cursorY -= QUOTE_BLOCK_H;
  layer.add(
    new Konva.Text({
      text: quoteText,
      x: PAD,
      y: cursorY,
      width: overlayTextW,
      fontSize: QUOTE_FONT,
      fontFamily: FONT_BODY,
      fill: "#FFFFFF",
      fontStyle: "600 italic",
      lineHeight: 1.45,
      wrap: "word",
    }),
  );

  // divider
  cursorY -= DIVIDER_H;
  const divY = cursorY + DIVIDER_H / 2;
  const GLYPH_W = 65; // ← widened to comfortably fit two quotes
  const LINE_GAP = 10;
  const glyphX = PAD + overlayTextW * 0.36;

  layer.add(
    new Konva.Line({
      points: [PAD, divY + 1, glyphX - LINE_GAP, divY + 1],
      stroke: "rgba(255,255,255,0.22)",
      strokeWidth: 1,
    }),
  );

  // Left quote “
  layer.add(
    new Konva.Text({
      text: "\u201C",
      x: glyphX + 3,
      y: divY - 24,
      fontSize: 38,
      fontFamily: FONT_DISPLAY,
      fill: ACCENT,
      opacity: 0.95,
    }),
  );

  // Right quote ” (facing the first one)
  layer.add(
    new Konva.Text({
      text: "\u201D",
      x: glyphX + GLYPH_W - 29,
      y: divY - 24,
      fontSize: 38,
      fontFamily: FONT_DISPLAY,
      fill: ACCENT,
      opacity: 0.95,
    }),
  );

  layer.add(
    new Konva.Line({
      points: [
        glyphX + GLYPH_W + LINE_GAP,
        divY + 1,
        PAD + overlayTextW,
        divY + 1,
      ],
      stroke: "rgba(255,255,255,0.22)",
      strokeWidth: 1,
    }),
  );

  // match context (e.g. "on the night of the final")
  if (data.matchContext) {
    cursorY -= CONTEXT_H;
    layer.add(
      new Konva.Text({
        text: `on ${data.matchContext}`,
        x: PAD,
        y: cursorY + 4,
        width: overlayTextW,
        fontSize: 15,
        fontFamily: FONT_BODY,
        fill: "rgba(255,255,255,0.5)",
        letterSpacing: 0.5,
        fontStyle: "400 italic",
      }),
    );
  }

  // player name
  cursorY -= NAME_H;
  layer.add(
    new Konva.Text({
      text: (data.playerName || "PLAYER NAME").toUpperCase(),
      x: PAD,
      y: cursorY,
      width: overlayTextW,
      fontSize: 30,
      fontFamily: FONT_DISPLAY,
      fill: "#FFFFFF",
      letterSpacing: 3,
    }),
  );

  // "quote" label at top of overlay
  cursorY -= LABEL_H;
  layer.add(
    new Konva.Text({
      // text: "", // no label for now, but could add one later if desired
      x: PAD,
      y: cursorY,
      fontSize: 24,
      fontFamily: FONT_DISPLAY,
      fill: ACCENT,
      letterSpacing: 5,
    }),
  );

  layer.draw();
}
