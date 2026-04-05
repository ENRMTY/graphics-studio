import Konva from "konva";
import { drawPitch } from "./drawPitch";
import { loadImage, coverFit } from "../helpers";
import { LineupData } from "@types";
import { drawPlayerDot } from "./drawPlayerDot";

export async function renderLineup(
  stage: Konva.Stage,
  data: LineupData,
  W: number,
  H: number = W,
): Promise<void> {
  stage.destroyChildren();
  const layer = new Konva.Layer();
  stage.add(layer);

  const ACCENT = data.competitionColor || "#C8102E";
  const PAD = 44;

  // dark base
  layer.add(
    new Konva.Rect({ x: 0, y: 0, width: W, height: H, fill: "#0e1117" }),
  );

  // background image
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
          opacity: 0.18,
        }),
      );
    } catch {
      // ignore
    }
  }

  // full dark gradient vignette over everything
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
        0.5,
        "rgba(0,0,0,0.2)",
        1,
        "rgba(0,0,0,0.75)",
      ],
    }),
  );

  // layout zones
  const HEADER_H = 90; // top: competition + match
  const FOOTER_H = H > 1080 ? 260 : 200; // subs strip
  const PITCH_TOP = HEADER_H + 12;
  const PITCH_H = H - PITCH_TOP - FOOTER_H - 16;
  const PITCH_PAD_X = PAD + 10;
  const pw = W - PITCH_PAD_X * 2;
  const ph = PITCH_H;
  const px = PITCH_PAD_X;
  const py = PITCH_TOP;

  // subtle pitch green tint
  layer.add(
    new Konva.Rect({
      x: px - 2,
      y: py - 2,
      width: pw + 4,
      height: ph + 4,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: ph },
      fillLinearGradientColorStops: [
        0,
        "rgba(20,80,30,0.35)",
        0.5,
        "rgba(15,60,25,0.20)",
        1,
        "rgba(20,80,30,0.35)",
      ],
      cornerRadius: 4,
    }),
  );

  // draw pitch lines
  drawPitch(layer, px, py, pw, ph);

  // players
  const dotR = W > 1080 ? 26 : 22;
  for (const player of data.players) {
    drawPlayerDot(layer, px, py, pw, ph, player, dotR, ACCENT);
  }

  // header: competition + match info
  let headerX = PAD;

  if (data.competitionIcon) {
    try {
      const ci = await loadImage(data.competitionIcon);
      layer.add(
        new Konva.Image({
          image: ci,
          x: headerX,
          y: 18,
          width: 36,
          height: 36,
        }),
      );
      headerX += 46;
    } catch {
      // ignore
    }
  }

  if (data.competition) {
    layer.add(
      new Konva.Text({
        text: data.competition.toUpperCase(),
        x: data.competitionIcon ? headerX : PAD,
        y: 26,
        fontSize: 13,
        fontFamily: "DM Sans",
        fontStyle: "600",
        fill: "rgba(255,255,255,0.5)",
        letterSpacing: 2,
      }),
    );
  }

  // match: home vs away
  const homeName = data.homeTeam?.name ?? "LIVERPOOL FC";
  const awayName = data.awayTeam?.name ?? "OPPONENT";
  const matchText = `${homeName.toUpperCase()}  vs  ${awayName.toUpperCase()}`;
  layer.add(
    new Konva.Text({
      text: matchText,
      x: PAD,
      y: 50,
      width: W - PAD * 2 - 120,
      fontSize: 24,
      fontFamily: "Bebas Neue",
      fill: "#fff",
      letterSpacing: 3,
    }),
  );

  // formation badge (top right)
  layer.add(
    new Konva.Text({
      text: data.formation,
      x: W - PAD - 90,
      y: 18,
      width: 90,
      fontSize: 32,
      fontFamily: "Bebas Neue",
      fill: ACCENT,
      letterSpacing: 2,
      align: "right",
    }),
  );

  // lineup label
  layer.add(
    new Konva.Text({
      text: "STARTING XI",
      x: W - PAD - 90,
      y: 54,
      width: 90,
      fontSize: 11,
      fontFamily: "DM Sans",
      fontStyle: "600",
      fill: "rgba(255,255,255,0.35)",
      letterSpacing: 2,
      align: "right",
    }),
  );

  // red bar accent below header
  layer.add(
    new Konva.Rect({
      x: PAD,
      y: HEADER_H - 4,
      width: 40,
      height: 3,
      fill: ACCENT,
      cornerRadius: 1.5,
    }),
  );

  // footer: subs strip
  const FOOTER_Y = H - FOOTER_H;

  // footer background
  layer.add(
    new Konva.Rect({
      x: 0,
      y: FOOTER_Y,
      width: W,
      height: FOOTER_H,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: FOOTER_H },
      fillLinearGradientColorStops: [
        0,
        "rgba(0,0,0,0.75)",
        1,
        "rgba(0,0,0,0.95)",
      ],
    }),
  );

  // divider line
  layer.add(
    new Konva.Line({
      points: [PAD, FOOTER_Y + 1, W - PAD, FOOTER_Y + 1],
      stroke: "rgba(255,255,255,0.10)",
      strokeWidth: 1,
    }),
  );

  // "subs" label + manager
  layer.add(
    new Konva.Text({
      text: "SUBSTITUTES",
      x: PAD,
      y: FOOTER_Y + 14,
      fontSize: 12,
      fontFamily: "DM Sans",
      fontStyle: "600",
      fill: ACCENT,
      letterSpacing: 3,
    }),
  );

  if (data.manager) {
    layer.add(
      new Konva.Text({
        text: `MGR: ${data.manager.toUpperCase()}`,
        x: PAD,
        y: FOOTER_Y + 14,
        width: W - PAD * 2,
        fontSize: 12,
        fontFamily: "DM Sans",
        fontStyle: "600",
        fill: "rgba(255,255,255,0.35)",
        letterSpacing: 2,
        align: "right",
      }),
    );
  }

  // sub player chips
  const subs = data.subs.slice(0, 9);
  const chipW = Math.min(
    Math.floor((W - PAD * 2) / Math.max(subs.length, 1)) - 8,
    110,
  );
  const chipH = FOOTER_H - 55;
  const totalChipsW = subs.length * (chipW + 8) - 8;
  const chipsStartX = (W - totalChipsW) / 2;
  const chipY = FOOTER_Y + 36;

  subs.forEach((sub, i) => {
    const cx = chipsStartX + i * (chipW + 8);

    // chip bg
    layer.add(
      new Konva.Rect({
        x: cx,
        y: chipY,
        width: chipW,
        height: chipH,
        fill: "rgba(255,255,255,0.06)",
        stroke: "rgba(255,255,255,0.10)",
        strokeWidth: 1,
        cornerRadius: 6,
      }),
    );

    // number
    if (sub.number !== null) {
      layer.add(
        new Konva.Text({
          text: String(sub.number),
          x: cx,
          y: chipY + 8,
          width: chipW,
          fontSize: 28,
          fontFamily: "Bebas Neue",
          fill: ACCENT,
          align: "center",
        }),
      );
    }

    // name
    layer.add(
      new Konva.Text({
        text: (sub.name.split(" ").pop() ?? sub.name).toUpperCase(),
        x: cx + 4,
        y: chipY + chipH - 24,
        width: chipW - 8,
        fontSize: 11,
        fontFamily: "DM Sans",
        fontStyle: "600",
        fill: "rgba(255,255,255,0.75)",
        align: "center",
        letterSpacing: 0.5,
      }),
    );
  });

  // watermark
  layer.add(
    new Konva.Text({
      text: "ENORMITY OF LFC",
      x: PAD,
      y: H - 22,
      width: W - PAD * 2,
      fontSize: 11,
      fontFamily: "Bebas Neue",
      fill: "rgba(255,255,255,0.08)",
      letterSpacing: 3,
      align: "right",
    }),
  );

  // red bottom bar
  layer.add(
    new Konva.Rect({ x: 0, y: H - 6, width: W, height: 6, fill: ACCENT }),
  );

  layer.draw();
}
