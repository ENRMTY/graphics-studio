import Konva from "konva";
import type { NewsData } from "@types";
import {
  loadImage,
  coverFit,
  drawCompetition,
  FONT_BODY,
  FONT_DISPLAY,
} from "./helpers";

function fitWidth(
  text: string,
  maxW: number,
  start: number,
): { size: number; width: number } {
  let size = start;
  const probe = new Konva.Text({
    text,
    fontSize: size,
    fontFamily: FONT_DISPLAY,
    letterSpacing: -1,
  });
  while (probe.width() > maxW && size > 72) {
    size -= 4;
    probe.fontSize(size);
  }
  const width = probe.width();
  probe.destroy();
  return { size, width };
}

export async function renderNews(
  stage: Konva.Stage,
  data: NewsData,
  W: number,
  H: number = W,
): Promise<void> {
  stage.destroyChildren();
  const layer = new Konva.Layer();
  stage.add(layer);

  const PAD = 64;
  const maxW = W - PAD * 2;
  const story = H > W;
  const bottom = story ? 150 : 80;

  layer.add(
    new Konva.Rect({ x: 0, y: 0, width: W, height: H, fill: "#111114" }),
  );

  if (data.bgImage) {
    try {
      const img = await loadImage(data.bgImage);
      const { w, h, x, y } = coverFit(img.width, img.height, W, H);
      layer.add(new Konva.Image({ image: img, x, y, width: w, height: h }));
    } catch {
      // ignore bad images
    }
  }

  // keeps the word readable without covering the face
  layer.add(
    new Konva.Rect({
      x: 0,
      y: H * 0.5,
      width: W,
      height: H * 0.5,
      listening: false,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: H * 0.5 },
      fillLinearGradientColorStops: [
        0,
        "rgba(0,0,0,0)",
        0.45,
        "rgba(0,0,0,0.18)",
        1,
        "rgba(0,0,0,0.62)",
      ],
    }),
  );

  layer.add(
    new Konva.Text({
      text: "ENORMITY OF LFC",
      x: PAD,
      y: 28,
      width: W - PAD * 2,
      fontSize: 12,
      fontFamily: FONT_DISPLAY,
      fill: "rgba(255,255,255,0.28)",
      letterSpacing: 3,
      align: "right",
    }),
  );

  const headline = (data.headline || "QUALIFIED").trim().toUpperCase();
  const caption = data.caption.trim();
  const { size: headSize } = fitWidth(headline, maxW, story ? 150 : 156);

  let cursor = H - bottom;

  if (caption) {
    const cap = new Konva.Text({
      text: caption,
      x: PAD,
      width: maxW,
      fontSize: story ? 26 : 24,
      fontFamily: FONT_BODY,
      fill: "rgba(255,255,255,0.94)",
      lineHeight: 1.35,
    });
    cap.y(cursor - cap.height());
    layer.add(cap);
    cursor = cap.y() - 20;
  }

  const ruleW = 118;
  const ruleH = 5;
  cursor -= ruleH;
  layer.add(
    new Konva.Rect({
      x: PAD,
      y: cursor,
      width: ruleW,
      height: ruleH,
      fill: "#E10600",
    }),
  );
  cursor -= 18;

  // Bebas sits high in the em box. 0.8 lands the caps just above the rule.
  const headY = cursor - headSize * 0.8;
  layer.add(
    new Konva.Text({
      text: headline,
      x: PAD,
      y: headY,
      width: maxW,
      fontSize: headSize,
      fontFamily: FONT_DISPLAY,
      fill: "#FFFFFF",
      letterSpacing: -1,
      shadowColor: "rgba(0,0,0,0.45)",
      shadowBlur: 10,
      shadowOffsetY: 2,
    }),
  );

  if (data.competition) {
    await drawCompetition(layer, data, headY - 48, PAD);
  }

  layer.draw();
}
