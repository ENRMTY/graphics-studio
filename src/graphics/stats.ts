import Konva from "konva";
import { StatsData } from "@types";
import { loadImage, coverFit, FONT_BODY, FONT_DISPLAY } from "./helpers";

export async function renderStats(
  stage: Konva.Stage,
  data: StatsData,
  W: number,
  H: number = W,
): Promise<void> {
  return renderStatsBig(stage, data, W, H);
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

/** Full-bleed portrait, name, then huge numbers with a red bar. */
async function renderStatsBig(
  stage: Konva.Stage,
  data: StatsData,
  W: number,
  H: number,
): Promise<void> {
  stage.destroyChildren();
  const layer = new Konva.Layer();
  stage.add(layer);

  const ACCENT = data.accentColor || "#E10600";
  const PAD = Math.round(W * 0.06);
  const RED_BAR_H = Math.round(W * 0.03);

  layer.add(
    new Konva.Rect({ x: 0, y: 0, width: W, height: H, fill: "#14080c" }),
  );

  const photo = data.playerImage || data.bgImage;
  if (photo) {
    try {
      const img = await loadImage(photo);
      const { w, h, x, y } = coverFit(img.width, img.height, W, H);
      layer.add(new Konva.Image({ image: img, x, y, width: w, height: h }));
    } catch {
      // ignore
    }
  }

  layer.add(
    new Konva.Rect({
      x: 0,
      y: H * 0.42,
      width: W,
      height: H * 0.58,
      listening: false,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: H * 0.58 },
      fillLinearGradientColorStops: [
        0,
        "rgba(0,0,0,0)",
        0.35,
        "rgba(0,0,0,0.28)",
        0.7,
        "rgba(0,0,0,0.62)",
        1,
        "rgba(0,0,0,0.82)",
      ],
    }),
  );

  const enabled = data.stats.filter((s) => s.enabled && s.value);
  const labelSize = Math.max(14, Math.round(W * 0.016));
  const labelTrack = Math.round(W * 0.0028);
  const gap = Math.round(W * 0.08); // SPACING between stat blocks
  const maxRow = W - Math.round(W * 0.05);

  const measure = (
    text: string,
    size: number,
    family: string,
    spacing: number,
    weight = "",
  ) => {
    const probe = new Konva.Text({
      text,
      fontSize: size,
      fontFamily: family,
      letterSpacing: spacing,
      fontStyle: weight,
    });
    const width = probe.width();
    probe.destroy();
    return width;
  };

  const widthsAt = (size: number) =>
    enabled.map((stat) =>
      Math.max(
        measure(stat.value, size, FONT_DISPLAY, -2),
        measure(
          stat.label.toUpperCase(),
          labelSize,
          FONT_BODY,
          labelTrack,
          "700",
        ),
      ),
    );

  const rowWidthAt = (size: number) => {
    const widths = widthsAt(size);
    if (widths.length === 0) return 0;
    return widths.reduce((sum, w) => sum + w, 0) + gap * (widths.length - 1);
  };

  let numberSize = Math.round(W * 0.28);
  while (numberSize > 72 && rowWidthAt(numberSize) > maxRow) numberSize -= 4;

  const labelY = H - RED_BAR_H - labelSize - Math.round(W * 0.02);
  const numberY =
    labelY - Math.round(numberSize * 0.92) - Math.round(W * 0.014);
  const widths = widthsAt(numberSize);
  const rowW =
    widths.reduce((sum, w) => sum + w, 0) +
    gap * Math.max(widths.length - 1, 0);
  let cursorX = (W - rowW) / 2;

  const slots: { w: number; x: number }[] = widths.map((w) => {
    const slot = { w, x: cursorX };
    cursorX += w + gap;
    return slot;
  });

  const stroke = Math.max(2, Math.round(numberSize * 0.012));

  slots.forEach((slot, i) => {
    const stat = enabled[i];
    layer.add(
      new Konva.Text({
        text: stat.value,
        x: slot.x,
        y: numberY,
        width: slot.w,
        align: "center",
        fontSize: numberSize,
        fontFamily: FONT_DISPLAY,
        fill: "#FFFFFF",
        stroke: "#FFFFFF",
        strokeWidth: stroke,
        letterSpacing: -2,
        wrap: "none",
      }),
    );
    layer.add(
      new Konva.Text({
        text: stat.label.toUpperCase(),
        x: slot.x,
        y: labelY,
        width: slot.w,
        align: "center",
        fontSize: labelSize,
        fontFamily: FONT_BODY,
        fontStyle: "700",
        fill: "rgba(255,255,255,0.92)",
        letterSpacing: labelTrack,
        wrap: "none",
      }),
    );
    if (i < slots.length - 1) {
      const next = slots[i + 1];
      layer.add(
        new Konva.Circle({
          x: (slot.x + slot.w + next.x) / 2,
          y: numberY + numberSize * 0.42,
          radius: Math.max(4, Math.round(W * 0.0055)),
          fill: ACCENT,
        }),
      );
    }
  });

  const caption = (data.matchContext ?? "").trim();
  const captionSize = Math.round(W * 0.02);
  const nameSize = Math.round(W * 0.046);
  const name = (data.playerName || "PLAYER NAME").toUpperCase();
  let above = numberY - Math.round(W * 0.018);

  if (caption) {
    above -= captionSize;
    layer.add(
      new Konva.Text({
        text: caption,
        x: 0,
        y: above,
        width: W,
        align: "center",
        fontSize: captionSize,
        fontFamily: FONT_BODY,
        fontStyle: "600",
        fill: "rgba(255,255,255,0.86)",
      }),
    );
    above -= Math.round(W * 0.014);
  }

  const ruleW = Math.round(W * 0.11);
  layer.add(
    new Konva.Rect({
      x: (W - ruleW) / 2,
      y: above,
      width: ruleW,
      height: Math.max(3, Math.round(W * 0.0035)),
      fill: ACCENT,
    }),
  );

  layer.add(
    new Konva.Text({
      text: name,
      x: 0,
      y: above - Math.round(nameSize * 0.82),
      width: W,
      align: "center",
      fontSize: nameSize,
      fontFamily: FONT_DISPLAY,
      fill: "#FFFFFF",
      letterSpacing: 1.4,
    }),
  );

  if (data.competitionIcon) {
    try {
      const ci = await loadImage(data.competitionIcon);
      const s = Math.round(W * 0.052);
      layer.add(
        new Konva.Image({
          image: ci,
          x: PAD,
          y: Math.round(W * 0.04),
          width: s,
          height: s,
        }),
      );
    } catch {
      // ignore
    }
  }

  layer.add(
    new Konva.Text({
      text: "ENORMITY OF LFC",
      x: PAD,
      y: Math.round(W * 0.048),
      width: W - PAD * 2,
      fontSize: Math.round(W * 0.014),
      fontFamily: FONT_DISPLAY,
      fill: "rgba(255,255,255,0.88)",
      letterSpacing: 2.5,
      align: "right",
    }),
  );

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
