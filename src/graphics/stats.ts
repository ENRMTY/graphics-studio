import Konva from "konva";
import { StatsData } from "@types";
import { loadImage, coverFit, FONT_BODY, FONT_DISPLAY } from "./helpers";

export async function renderStats(
  stage: Konva.Stage,
  data: StatsData,
  W: number,
  H: number = W,
): Promise<void> {
  const layout = data.layout ?? "classic";
  if (layout === "overlay") {
    return renderStatsOverlay(stage, data, W, H);
  }
  return renderStatsClassic(stage, data, W, H);
}

// classic layout
async function renderStatsClassic(
  stage: Konva.Stage,
  data: StatsData,
  W: number,
  H: number,
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

// overlay layout
async function renderStatsOverlay(
  stage: Konva.Stage,
  data: StatsData,
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

  // full-bleed background
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
      const imgH = H * 0.75;
      const imgW = (img.width / img.height) * imgH;
      const imgX = W - imgW * 0.92;
      const imgY = H - RED_BAR_H - imgH;
      layer.add(
        new Konva.Image({
          image: img,
          x: imgX,
          y: imgY,
          width: imgW,
          height: imgH,
          opacity: 0.88,
        }),
      );
      // fade left edge and bottom edge
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

  // calculate overlay height
  const enabledStats = data.stats.filter((s) => s.enabled && s.value);
  const STAT_BLOCK_H = enabledStats.length > 0 ? 110 : 0;
  const NAME_H = 48;
  const CONTEXT_H = data.matchContext ? 26 : 0;
  const LABEL_H = 36;
  const BOTTOM_PAD = 36;
  const TOP_BREATHING = 24;

  const CONTENT_H =
    BOTTOM_PAD +
    STAT_BLOCK_H +
    16 +
    CONTEXT_H +
    NAME_H +
    LABEL_H +
    TOP_BREATHING;
  const OVERLAY_H = Math.min(CONTENT_H + 150, H * 0.88);

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
        "rgba(0,0,0,0.09)",
        0.3,
        "rgba(0,0,0,0.18)",
        0.45,
        "rgba(0,0,0,0.45)",
        0.6,
        "rgba(0,0,0,0.63)",
        0.75,
        "rgba(0,0,0,0.74)",
        1,
        "rgba(0,0,0,0.8)",
      ],
    }),
  );

  // accent bar at bottom
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

  // competition — pinned to top-left corner
  if (data.competitionIcon) {
    try {
      const ci = await loadImage(data.competitionIcon);
      layer.add(
        new Konva.Image({
          image: ci,
          x: PAD,
          y: PAD - 8,
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
        y: PAD - 2,
        width: W - PAD * 2,
        align: "left",
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

  // stats row
  if (enabledStats.length > 0) {
    cursorY -= STAT_BLOCK_H;
    const colW = Math.min(
      160,
      (W - PAD * 2) / Math.max(enabledStats.length, 1),
    );
    enabledStats.forEach((stat, i) => {
      const x = PAD + i * (colW + 16);
      layer.add(
        new Konva.Text({
          text: stat.value,
          x,
          y: cursorY,
          fontSize: 80,
          fontFamily: FONT_DISPLAY,
          fill: "#FFFFFF",
          letterSpacing: -2,
        }),
      );
      layer.add(
        new Konva.Text({
          text: stat.label.toUpperCase(),
          x,
          y: cursorY + 84,
          fontSize: 12,
          fontFamily: FONT_BODY,
          fill: "rgba(255,255,255,0.5)",
          letterSpacing: 3,
          fontStyle: "600",
        }),
      );
      if (i < enabledStats.length - 1) {
        layer.add(
          new Konva.Circle({
            x: x + colW + 8,
            y: cursorY + 40,
            radius: 3,
            fill: ACCENT,
            opacity: 0.7,
          }),
        );
      }
    });
    cursorY -= 16;
  }

  // match context ("Virgil's take on the game")
  if (data.matchContext) {
    cursorY -= CONTEXT_H;
    layer.add(
      new Konva.Text({
        text: `on ${data.matchContext}`,
        x: PAD,
        y: cursorY + 4,
        width: W - PAD * 2,
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
      width: W - PAD * 2,
      fontSize: 36,
      fontFamily: FONT_DISPLAY,
      fill: "#FFFFFF",
      letterSpacing: 3,
    }),
  );

  // "STATS" label
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
