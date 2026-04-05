import Konva from "konva";
import { QuoteData } from "../types";
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

  // watermark
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
