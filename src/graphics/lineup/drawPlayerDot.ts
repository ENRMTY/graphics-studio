import Konva from "konva";
import { LineupPlayer } from "@types";
import { displayName } from "./displayName";
import { loadImage } from "../helpers";
import { pitchPoint } from "./drawPitch";

function coverInCircle(
  imgW: number,
  imgH: number,
  cx: number,
  cy: number,
  r: number,
) {
  const scale = Math.max((r * 2) / imgW, (r * 2) / imgH);
  const w = imgW * scale;
  const h = imgH * scale;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}

export async function drawPlayerDot(
  layer: Konva.Layer,
  px: number,
  py: number,
  pw: number,
  ph: number,
  player: LineupPlayer,
  dotR: number,
  accentColor: string,
) {
  const spot = pitchPoint(px, py, pw, ph, player.x, player.y);
  const bx = spot.x;
  let by = spot.y;

  const keepLabelOnPitch = (r: number, hasNumber: boolean) => {
    const labelH = (hasNumber ? 28 : 8) + 20;
    const overflow = by + r + labelH - (py + ph - 8);
    if (overflow > 0) by -= overflow;
  };

  if (player.photoUrl) {
    try {
      const img = await loadImage(player.photoUrl);
      const r = dotR * 1.2;
      keepLabelOnPitch(r, player.number !== null);
      layer.add(
        new Konva.Circle({
          x: bx,
          y: by,
          radius: r + 4,
          fill: "rgba(0,0,0,0.55)",
          stroke: accentColor,
          strokeWidth: 4,
          shadowColor: accentColor,
          shadowBlur: 22,
          shadowOpacity: 0.9,
        }),
      );
      const fitted = coverInCircle(img.width, img.height, bx, by, r);
      const group = new Konva.Group({
        clipFunc: (ctx) => {
          ctx.arc(bx, by, r, 0, Math.PI * 2, false);
        },
      });
      group.add(
        new Konva.Image({
          image: img,
          x: fitted.x,
          y: fitted.y,
          width: fitted.w,
          height: fitted.h,
        }),
      );
      layer.add(group);

      if (player.isCaptain) {
        const badgeR = r * 0.28;
        const badgeX = bx + r * 0.72;
        const badgeY = by - r * 0.72;
        layer.add(
          new Konva.Circle({
            x: badgeX,
            y: badgeY,
            radius: badgeR,
            fill: "#FFD700",
          }),
        );
        layer.add(
          new Konva.Text({
            x: badgeX - badgeR,
            y: badgeY - badgeR * 0.75,
            width: badgeR * 2,
            text: "C",
            fontSize: badgeR * 1.15,
            fontFamily: "Bebas Neue",
            fill: "#000",
            align: "center",
          }),
        );
      }

      if (player.number !== null) {
        layer.add(
          new Konva.Text({
            x: bx - 30,
            y: by + r + 2,
            width: 60,
            text: String(player.number),
            fontSize: 22,
            fontFamily: "Bebas Neue",
            fill: "#fff",
            align: "center",
          }),
        );
      }

      layer.add(
        new Konva.Text({
          x: bx - 70,
          y: by + r + (player.number !== null ? 24 : 6),
          width: 140,
          text: displayName(player.name),
          fontSize: 17,
          fontFamily: "DM Sans",
          fontStyle: "600",
          fill: "#fff",
          align: "center",
          shadowColor: "rgba(0,0,0,0.9)",
          shadowBlur: 6,
        }),
      );
      return;
    } catch {
      // fall through to the number dot
    }
  }

  keepLabelOnPitch(dotR, player.number !== null);
  layer.add(
    new Konva.Circle({
      x: bx,
      y: by,
      radius: dotR + 3,
      fill: "rgba(0,0,0,0.5)",
      stroke: player.isCaptain ? "#FFD700" : accentColor,
      strokeWidth: player.isCaptain ? 3 : 2,
    }),
  );

  layer.add(
    new Konva.Circle({ x: bx, y: by, radius: dotR, fill: accentColor }),
  );

  if (player.isCaptain) {
    const badgeR = dotR * 0.45;
    const badgeX = bx + dotR * 0.65;
    const badgeY = by - dotR * 0.65;
    layer.add(
      new Konva.Circle({
        x: badgeX,
        y: badgeY,
        radius: badgeR,
        fill: "#FFD700",
      }),
    );
    layer.add(
      new Konva.Text({
        x: badgeX - badgeR,
        y: badgeY - badgeR * 0.8,
        width: badgeR * 2,
        text: "C",
        fontSize: badgeR * 1.2,
        fontFamily: "Bebas Neue",
        fill: "#000",
        align: "center",
      }),
    );
  }

  if (player.number !== null) {
    layer.add(
      new Konva.Text({
        x: bx - dotR,
        y: by - dotR * 0.5,
        width: dotR * 2,
        text: String(player.number),
        fontSize: dotR * 1.0,
        fontFamily: "Bebas Neue",
        fill: "#fff",
        align: "center",
      }),
    );
  }

  layer.add(
    new Konva.Text({
      x: bx - 60,
      y: by + dotR + 5,
      width: 120,
      text: displayName(player.name),
      fontSize: 17,
      fontFamily: "DM Sans",
      fontStyle: "600",
      fill: "#fff",
      align: "center",
      shadowColor: "rgba(0,0,0,0.9)",
      shadowBlur: 6,
      shadowOffsetX: 0,
      shadowOffsetY: 1,
    }),
  );
}
