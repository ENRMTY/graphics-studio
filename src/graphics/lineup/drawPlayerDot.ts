import Konva from "konva";
import { LineupPlayer } from "@types";
import { displayName } from "./displayName";

export function drawPlayerDot(
  layer: Konva.Layer,
  px: number,
  py: number,
  pw: number,
  ph: number,
  player: LineupPlayer,
  dotR: number,
  accentColor: string,
) {
  const bx = px + player.x * pw;
  const by = py + player.y * ph;

  // outer ring
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

  // fill
  layer.add(
    new Konva.Circle({ x: bx, y: by, radius: dotR, fill: accentColor }),
  );

  // captain armband "C" badge (top-right of dot)
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

  // number
  if (player.number !== null) {
    layer.add(
      new Konva.Text({
        x: bx - dotR,
        y: by - dotR * 0.7,
        width: dotR * 2,
        text: String(player.number),
        fontSize: dotR * 1.0,
        fontFamily: "Bebas Neue",
        fill: "#fff",
        align: "center",
      }),
    );
  }

  // name label below dot
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
