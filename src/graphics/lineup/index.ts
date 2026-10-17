import Konva from "konva";
import { drawPitch } from "./drawPitch";
import { loadImage, coverFit } from "../helpers";
import { LineupData } from "@types";
import { drawPlayerDot } from "./drawPlayerDot";
import { displayName } from "./displayName";

export async function renderLineup(
  stage: Konva.Stage,
  data: LineupData,
  W: number,
  H: number = W,
): Promise<void> {
  stage.destroyChildren();
  const layer = new Konva.Layer();
  stage.add(layer);

  const ACCENT = data.dotColor || data.competitionColor || "#E10600";
  const PAD = 40;

  layer.add(
    new Konva.Rect({ x: 0, y: 0, width: W, height: H, fill: "#050505" }),
  );

  if (data.bgImage) {
    try {
      const img = await loadImage(data.bgImage);
      const { w, h, x, y } = coverFit(img.width, img.height, W, H);
      const photo = new Konva.Image({ image: img, x, y, width: w, height: h });
      layer.add(photo);
      try {
        photo.cache();
        photo.filters([Konva.Filters.Contrast, Konva.Filters.Brighten]);
        photo.contrast(12);
        photo.brightness(-0.12);
      } catch {
        photo.clearCache();
        photo.filters([]);
      }
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
      fill: "rgba(110,0,16,0.42)",
      listening: false,
    }),
  );
  layer.add(
    new Konva.Rect({
      x: 0,
      y: 0,
      width: W * 0.28,
      height: H,
      listening: false,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: W * 0.28, y: 0 },
      fillLinearGradientColorStops: [
        0,
        "rgba(190,8,24,0.75)",
        0.45,
        "rgba(140,0,16,0.28)",
        1,
        "rgba(80,0,10,0)",
      ],
    }),
  );
  layer.add(
    new Konva.Rect({
      x: W * 0.72,
      y: 0,
      width: W * 0.28,
      height: H,
      listening: false,
      fillLinearGradientStartPoint: { x: W * 0.28, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: 0 },
      fillLinearGradientColorStops: [
        0,
        "rgba(190,8,24,0.7)",
        0.45,
        "rgba(140,0,16,0.25)",
        1,
        "rgba(80,0,10,0)",
      ],
    }),
  );

  const HEADER_H = Math.round(W * 0.115);
  const FOOTER_H = Math.round(W * 0.2);
  layer.add(
    new Konva.Rect({
      x: 0,
      y: 0,
      width: W,
      height: HEADER_H - 8,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: HEADER_H },
      fillLinearGradientColorStops: [0, "rgba(0,0,0,0.92)", 1, "rgba(0,0,0,0)"],
    }),
  );

  const PITCH_TOP = HEADER_H + 6;
  const PITCH_H = H - PITCH_TOP - FOOTER_H - 8;
  const PITCH_PAD_X = PAD;
  const pw = W - PITCH_PAD_X * 2;
  const ph = PITCH_H;
  const px = PITCH_PAD_X;
  const py = PITCH_TOP;

  drawPitch(layer, px, py, pw, ph);

  // players - remap y coords from full-pitch space (0=attack top, 1=GK bottom)
  // to half-pitch space. Full pitch y range used: ~0.10 (ST) to ~0.92 (GK).
  // We stretch that range to fill the half-pitch canvas.
  const Y_TOP = 0.08; // y value that maps to the top of the half-pitch
  const Y_BOT = 0.95; // y value that maps to the bottom of the half-pitch
  const dotR = Math.round(W * 0.032);
  for (const player of data.players) {
    const remappedPlayer = {
      ...player,
      y: Math.max(0, Math.min(1, (player.y - Y_TOP) / (Y_BOT - Y_TOP))),
    };
    await drawPlayerDot(layer, px, py, pw, ph, remappedPlayer, dotR, ACCENT);
  }

  // header: competition + match info
  let headerX = PAD;

  const logoSize = Math.round(W * 0.072);
  if (data.competitionIcon) {
    try {
      const ci = await loadImage(data.competitionIcon);
      layer.add(
        new Konva.Image({
          image: ci,
          x: PAD,
          y: 18,
          width: logoSize,
          height: logoSize,
        }),
      );
      headerX += logoSize + 14;
    } catch {
      // ignore
    }
  }

  if (data.competition) {
    layer.add(
      new Konva.Text({
        text: data.competition.toUpperCase(),
        x: headerX,
        y: 16,
        fontSize: Math.round(W * 0.032),
        fontFamily: "Bebas Neue",
        fill: "#FFFFFF",
        letterSpacing: 1.5,
      }),
    );
  }

  const homeName = data.homeTeam?.name ?? "LIVERPOOL FC";
  const awayName = data.awayTeam?.name ?? "OPPONENT";
  const matchText = `${homeName.toUpperCase()} VS ${awayName.toUpperCase()}`;
  const match = new Konva.Text({
    text: matchText,
    x: headerX,
    y: 18 + Math.round(W * 0.034),
    fontSize: Math.round(W * 0.038),
    fontFamily: "Bebas Neue",
    fill: "#FFFFFF",
    letterSpacing: 0.5,
  });
  layer.add(match);
  layer.add(
    new Konva.Rect({
      x: headerX,
      y: match.y() + match.height() + 2,
      width: Math.min(72, match.width() * 0.28),
      height: 4,
      fill: ACCENT,
    }),
  );

  const BADGE_W = Math.round(W * 0.22);
  layer.add(
    new Konva.Text({
      text: data.formation,
      x: W - PAD - BADGE_W,
      y: 8,
      width: BADGE_W,
      fontSize: Math.round(W * 0.072),
      fontFamily: "Bebas Neue",
      fill: ACCENT,
      align: "right",
    }),
  );
  layer.add(
    new Konva.Text({
      text: "STARTING XI",
      x: W - PAD - BADGE_W,
      y: 12 + Math.round(W * 0.07),
      width: BADGE_W,
      fontSize: Math.round(W * 0.016),
      fontFamily: "Bebas Neue",
      fill: "#FFFFFF",
      letterSpacing: 2,
      align: "right",
    }),
  );

  const FOOTER_Y = H - FOOTER_H;
  layer.add(
    new Konva.Rect({
      x: 0,
      y: FOOTER_Y - 24,
      width: W,
      height: FOOTER_H + 24,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: 40 },
      fillLinearGradientColorStops: [0, "rgba(0,0,0,0)", 1, "#050505"],
    }),
  );
  layer.add(
    new Konva.Rect({
      x: 0,
      y: FOOTER_Y,
      width: W,
      height: FOOTER_H,
      fill: "#050505",
    }),
  );

  layer.add(
    new Konva.Text({
      text: "SUBSTITUTES",
      x: PAD,
      y: FOOTER_Y + 8,
      fontSize: Math.round(W * 0.016),
      fontFamily: "Bebas Neue",
      fill: ACCENT,
      letterSpacing: 3,
    }),
  );

  if (data.manager) {
    layer.add(
      new Konva.Text({
        text: `MGR: ${data.manager.toUpperCase()}`,
        x: PAD,
        y: FOOTER_Y + 8,
        width: W - PAD * 2,
        fontSize: Math.round(W * 0.014),
        fontFamily: "Bebas Neue",
        fill: "rgba(255,255,255,0.4)",
        letterSpacing: 1.5,
        align: "right",
      }),
    );
  }

  const subs = data.subs.slice(0, 12);
  const twoRows = subs.length > 6;
  const rowCount = twoRows ? 2 : 1;
  const perRow = Math.max(1, Math.ceil(subs.length / rowCount));
  const gapX = twoRows ? 8 : 12;
  const gapY = Math.round(W * 0.008);
  const availW = W - PAD * 2;
  const chipW = Math.min(
    Math.round(W * (twoRows ? 0.2 : 0.14)),
    Math.floor((availW - gapX * Math.max(perRow - 1, 0)) / perRow),
  );
  const chipsTop = FOOTER_Y + Math.round(W * 0.038);
  const availH = FOOTER_H - Math.round(W * 0.038) - Math.round(W * 0.012);
  const chipH = Math.min(
    Math.round(W * (twoRows ? 0.078 : 0.125)),
    Math.floor((availH - gapY * (rowCount - 1)) / rowCount),
  );

  for (let r = 0; r < rowCount; r++) {
    const rowSubs = subs.slice(r * perRow, r * perRow + perRow);
    if (!rowSubs.length) continue;
    const rowW =
      rowSubs.length * chipW + Math.max(rowSubs.length - 1, 0) * gapX;
    const startX = (W - rowW) / 2;
    const rowY = chipsTop + r * (chipH + gapY);

    rowSubs.forEach((sub, i) => {
      const cx = startX + i * (chipW + gapX);
      layer.add(
        new Konva.Rect({
          x: cx,
          y: rowY,
          width: chipW,
          height: chipH,
          fill: "#070707",
          stroke: ACCENT,
          strokeWidth: 1.5,
          cornerRadius: twoRows ? 8 : 12,
        }),
      );
      if (sub.number !== null) {
        layer.add(
          new Konva.Text({
            text: String(sub.number),
            x: cx,
            y: rowY + chipH * 0.06,
            width: chipW,
            fontSize: Math.round(chipH * (twoRows ? 0.42 : 0.48)),
            fontFamily: "Bebas Neue",
            fill: ACCENT,
            align: "center",
          }),
        );
      }
      const label = displayName(sub.name).toUpperCase();
      const maxLabelW = chipW - 8;
      const singleWord = !/\s/.test(label.trim());
      const allowWrap = !singleWord && !twoRows;
      let labelSize = Math.min(Math.round(W * 0.014), Math.round(chipH * 0.24));
      if (label && (!allowWrap || singleWord)) {
        const probe = new Konva.Text({
          text: label,
          fontSize: labelSize,
          fontFamily: "DM Sans",
          fontStyle: "600",
          letterSpacing: 0.4,
        });
        while (probe.width() > maxLabelW && labelSize > 8) {
          labelSize -= 1;
          probe.fontSize(labelSize);
        }
        probe.destroy();
      }
      layer.add(
        new Konva.Text({
          text: label,
          x: cx + 4,
          y: rowY + chipH - Math.round(chipH * (allowWrap ? 0.32 : 0.28)),
          width: maxLabelW,
          fontSize: labelSize,
          fontFamily: "DM Sans",
          fontStyle: "600",
          fill: "#FFFFFF",
          align: "center",
          letterSpacing: singleWord ? 0.4 : 0.6,
          wrap: allowWrap ? "word" : "none",
        }),
      );
    });
  }

  layer.draw();
}
