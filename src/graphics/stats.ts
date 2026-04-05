import Konva from "konva";
import { StatsData } from "@types";
import { loadImage, coverFit, FONT_BODY, FONT_DISPLAY } from "./helpers";

export async function renderStats(
  stage: Konva.Stage,
  data: StatsData,
  W: number,
  H: number = W,
): Promise<void> {
  stage.destroyChildren();
  const layer = new Konva.Layer();
  stage.add(layer);

  const ACCENT = data.accentColor || "#C8102E";
  const PAD = 56;

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
          opacity: 0.35,
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
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: H },
      fillLinearGradientColorStops: [
        0,
        "rgba(0,0,0,0.55)",
        0.45,
        "rgba(0,0,0,0.72)",
        1,
        "rgba(0,0,0,0.96)",
      ],
    }),
  );

  layer.add(new Konva.Rect({ x: 0, y: 0, width: 6, height: H, fill: ACCENT }));

  if (data.playerImage) {
    try {
      const img = await loadImage(data.playerImage);
      const imgH = H;
      const imgW = (img.width / img.height) * imgH;
      const imgX = W - imgW * 0.72;
      const group = new Konva.Group({ opacity: 0.9 });
      group.add(
        new Konva.Image({
          image: img,
          x: imgX,
          y: 0,
          width: imgW,
          height: imgH,
        }),
      );
      layer.add(group);
      layer.add(
        new Konva.Rect({
          x: imgX,
          y: H * 0.55,
          width: imgW,
          height: H * 0.45,
          fillLinearGradientStartPoint: { x: 0, y: 0 },
          fillLinearGradientEndPoint: { x: 0, y: H * 0.45 },
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

  if (data.competition || data.competitionIcon) {
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
          y: PAD - 2,
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
  }

  const nameY = H * 0.3;
  layer.add(
    new Konva.Text({
      text: (data.playerName || "PLAYER NAME").toUpperCase(),
      x: PAD + 10,
      y: nameY,
      fontSize: 52,
      fontFamily: FONT_DISPLAY,
      fill: "#FFFFFF",
      letterSpacing: 3,
    }),
  );

  const nameMeasure = (data.playerName || "PLAYER NAME").length * 28;
  layer.add(
    new Konva.Rect({
      x: PAD + 10,
      y: nameY + 62,
      width: Math.min(nameMeasure, W - PAD * 2 - 20),
      height: 3,
      fill: ACCENT,
      cornerRadius: 1.5,
    }),
  );

  const enabledStats = data.stats.filter((s) => s.enabled && s.value);
  const statsY = H * 0.52;
  const colW = Math.min(
    180,
    (W - PAD * 2 - 10) / Math.max(enabledStats.length, 1),
  );

  enabledStats.forEach((stat, i) => {
    const x = PAD + 10 + i * (colW + 20);
    layer.add(
      new Konva.Text({
        text: stat.value,
        x,
        y: statsY,
        fontSize: 86,
        fontFamily: FONT_DISPLAY,
        fill: "#FFFFFF",
        letterSpacing: -2,
      }),
    );
    layer.add(
      new Konva.Text({
        text: stat.label.toUpperCase(),
        x,
        y: statsY + 90,
        fontSize: 13,
        fontFamily: FONT_BODY,
        fill: "rgba(255,255,255,0.5)",
        letterSpacing: 3,
        fontStyle: "600",
      }),
    );
    if (i < enabledStats.length - 1) {
      layer.add(
        new Konva.Circle({
          x: x + colW + 10,
          y: statsY + 45,
          radius: 3,
          fill: ACCENT,
          opacity: 0.7,
        }),
      );
    }
  });

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
