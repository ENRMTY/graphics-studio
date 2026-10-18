import Konva from "konva";
import type { BoardData, BoardRow } from "@types";
import { loadImage, FONT_DISPLAY, FONT_BODY } from "./helpers";
import { paintPhoto, redBar, watermark, fitSize, RED } from "./poster";

const UP = "#3DDC97";
const DOWN = "#FF4B4B";

export async function renderBoard(
  stage: Konva.Stage,
  data: BoardData,
  W: number,
  H: number = W,
) {
  stage.destroyChildren();
  const layer = new Konva.Layer();
  stage.add(layer);

  await paintPhoto(layer, data.bgImage, W, H);
  layer.add(
    new Konva.Rect({
      x: 0,
      y: 0,
      width: W,
      height: H,
      listening: false,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: H },
      fillLinearGradientColorStops: [
        0,
        "rgba(0,0,0,0.28)",
        0.22,
        "rgba(0,0,0,0.45)",
        1,
        "rgba(0,0,0,0.82)",
      ],
    }),
  );

  const league = data.kind !== "scorers";
  const rows = (league ? data.rows : data.scorerRows) ?? [];
  const pad = Math.round(W * 0.045);
  const bar = redBar(layer, W, H);
  const logoS = Math.round(Math.min(W, H) * 0.09);
  const title = (
    data.title || (league ? "PREMIER LEAGUE" : "TOP SCORERS")
  ).toUpperCase();
  const kicker = league ? "TABLE" : "SCORERS";
  const kickerSize = Math.round(W * 0.02);
  const titleMax = W - pad * 2 - logoS - Math.round(W * 0.03);
  const titleSize = fitSize(
    title,
    titleMax,
    Math.round(W * 0.078),
    Math.round(W * 0.04),
    0.5,
  );
  const titleY = Math.round(H * 0.05);

  layer.add(
    new Konva.Text({
      text: kicker,
      x: pad,
      y: titleY,
      fontSize: kickerSize,
      fontFamily: FONT_BODY,
      fontStyle: "700",
      fill: RED,
      letterSpacing: 3,
    }),
  );
  layer.add(
    new Konva.Text({
      text: title,
      x: pad,
      y: titleY + kickerSize + Math.round(W * 0.006),
      width: titleMax,
      fontSize: titleSize,
      fontFamily: FONT_DISPLAY,
      fill: "#FFFFFF",
      letterSpacing: 0.5,
      wrap: "none",
      shadowColor: "rgba(200,16,46,0.95)",
      shadowBlur: titleSize * 0.16,
      shadowOpacity: 0.9,
    }),
  );

  if (data.competitionIcon) {
    try {
      const img = await loadImage(data.competitionIcon);
      layer.add(
        new Konva.Image({
          image: img,
          x: W - pad - logoS,
          y: titleY,
          width: logoS,
          height: logoS,
        }),
      );
    } catch {
      // no logo
    }
  }

  const tableTop =
    titleY + kickerSize + Math.round(titleSize * 0.82) + Math.round(W * 0.04);
  const tableBottom = H - bar - Math.round(W * 0.07);
  const tableX = pad;
  const tableW = W - pad * 2;
  const tableH = Math.max(Math.round(W * 0.2), tableBottom - tableTop);

  layer.add(
    new Konva.Rect({
      x: tableX,
      y: tableTop,
      width: tableW,
      height: tableH,
      cornerRadius: Math.round(W * 0.016),
      fill: "rgba(6,6,8,0.78)",
      stroke: RED,
      strokeWidth: Math.max(1.5, W * 0.0022),
      shadowColor: "#ff2d3a",
      shadowBlur: Math.round(W * 0.018),
      shadowOpacity: 0.9,
      shadowForStrokeEnabled: true,
    }),
  );

  const count = Math.max(rows.length, 1);
  const headerH = Math.round(Math.min(W * 0.04, tableH * 0.08));
  const rowH = Math.max(
    12,
    Math.floor((tableH - headerH - Math.round(W * 0.012)) / count),
  );
  const cols = league
    ? { move: 0.07, pos: 0.09, name: 0.48, a: 0.11, b: 0.12, c: 0.13 }
    : { move: 0.08, pos: 0.1, name: 0.62, a: 0, b: 0, c: 0.2 };

  const xAt = (frac: number) => tableX + tableW * frac;
  const moveX = xAt(0.015);
  const posX = xAt(cols.move);
  const nameX = xAt(cols.move + cols.pos);
  const aX = xAt(cols.move + cols.pos + cols.name);
  const bX = xAt(cols.move + cols.pos + cols.name + cols.a);
  const cX = xAt(1 - cols.c);
  const nameW = tableW * cols.name - Math.round(W * 0.02);

  const headY = tableTop + Math.round(headerH * 0.28);
  const headSize = Math.max(
    10,
    Math.round(Math.min(headerH * 0.46, W * 0.014)),
  );
  const head = (
    text: string,
    x: number,
    w: number,
    align: "left" | "center",
  ) => {
    layer.add(
      new Konva.Text({
        text,
        x,
        y: headY,
        width: w,
        align,
        fontSize: headSize,
        fontFamily: FONT_BODY,
        fontStyle: "700",
        fill: "rgba(255,255,255,0.55)",
        letterSpacing: 1.2,
      }),
    );
  };
  head("POS", posX, tableW * cols.pos, "left");
  head(league ? "TEAM" : "PLAYER", nameX, nameW, "left");
  if (league) {
    head("P", aX, tableW * cols.a, "center");
    head("GD", bX, tableW * cols.b, "center");
    head("PTS", cX, tableW * cols.c - pad * 0.3, "center");
  } else {
    head("GOALS", cX, tableW * cols.c - pad * 0.3, "center");
  }

  const ruleY = tableTop + headerH;
  layer.add(
    new Konva.Rect({
      x: tableX + Math.round(W * 0.015),
      y: ruleY,
      width: tableW - Math.round(W * 0.03),
      height: Math.max(1.5, W * 0.0016),
      fill: RED,
      shadowColor: "#ff2d3a",
      shadowBlur: Math.round(W * 0.01),
      shadowOpacity: 0.85,
    }),
  );

  const logos = await Promise.all(
    rows.map(async (row) => {
      if (!row.logo) return null;
      try {
        return await loadImage(row.logo);
      } catch {
        return null;
      }
    }),
  );

  rows.forEach((row, i) => {
    drawRow(layer, row, logos[i], i, {
      W,
      tableX,
      tableW,
      rowY: ruleY + i * rowH,
      rowH,
      moveX,
      posX,
      nameX,
      nameW,
      aX,
      bX,
      cX,
      cols,
      league,
    });
  });

  watermark(layer, W, H, bar);
  layer.draw();
}

function drawRow(
  layer: Konva.Layer,
  row: BoardRow,
  logo: HTMLImageElement | null,
  index: number,
  box: {
    W: number;
    tableX: number;
    tableW: number;
    rowY: number;
    rowH: number;
    moveX: number;
    posX: number;
    nameX: number;
    nameW: number;
    aX: number;
    bX: number;
    cX: number;
    cols: { pos: number; a: number; b: number; c: number };
    league: boolean;
  },
) {
  const { W, tableX, tableW, rowY, rowH } = box;
  if (row.highlight) {
    layer.add(
      new Konva.Rect({
        x: tableX + 2,
        y: rowY + 1,
        width: tableW - 4,
        height: rowH - 2,
        fill: "rgba(200,16,46,0.28)",
        shadowColor: RED,
        shadowBlur: Math.round(W * 0.012),
        shadowOpacity: 0.45,
      }),
    );
    layer.add(
      new Konva.Rect({
        x: tableX + 2,
        y: rowY + 2,
        width: Math.max(3, W * 0.004),
        height: rowH - 4,
        fill: RED,
        shadowColor: "#ff2d3a",
        shadowBlur: 8,
        shadowOpacity: 0.8,
      }),
    );
  } else if (index % 2 === 1) {
    layer.add(
      new Konva.Rect({
        x: tableX + 2,
        y: rowY,
        width: tableW - 4,
        height: rowH,
        fill: "rgba(255,255,255,0.035)",
      }),
    );
  }

  const mid = rowY + rowH / 2;
  const arrow = Math.max(4, Math.round(rowH * 0.16));
  if (row.move === "up" || row.move === "down") {
    const color = row.move === "up" ? UP : DOWN;
    layer.add(
      new Konva.RegularPolygon({
        x: box.moveX + arrow,
        y: mid,
        sides: 3,
        radius: arrow,
        rotation: row.move === "up" ? 0 : 180,
        fill: color,
        shadowColor: color,
        shadowBlur: arrow * 1.4,
        shadowOpacity: 0.9,
      }),
    );
  } else {
    layer.add(
      new Konva.Rect({
        x: box.moveX + arrow * 0.4,
        y: mid - Math.max(1, arrow * 0.12),
        width: arrow * 1.3,
        height: Math.max(1.5, arrow * 0.22),
        fill: "rgba(255,255,255,0.35)",
      }),
    );
  }

  const posSize = Math.min(Math.round(rowH * 0.46), Math.round(W * 0.032));
  layer.add(
    new Konva.Text({
      text: row.pos || String(index + 1),
      x: box.posX,
      y: mid - posSize * 0.72,
      width: box.tableW * box.cols.pos,
      fontSize: posSize,
      fontFamily: FONT_DISPLAY,
      fill: "#FFFFFF",
    }),
  );

  let textX = box.nameX;
  let textW = box.nameW;
  if (logo) {
    const s = Math.round(rowH * 0.62);
    layer.add(
      new Konva.Image({
        image: logo,
        x: box.nameX,
        y: mid - s / 2,
        width: s,
        height: s,
      }),
    );
    textX += s + Math.round(W * 0.01);
    textW -= s + Math.round(W * 0.01);
  }

  const name = (row.name || "—").toUpperCase();
  let nameSize = Math.min(Math.round(rowH * 0.38), Math.round(W * 0.026));
  const probe = new Konva.Text({
    text: name,
    fontSize: nameSize,
    fontFamily: FONT_BODY,
    fontStyle: "700",
  });
  while (nameSize > 9 && probe.width() > textW) {
    nameSize -= 1;
    probe.fontSize(nameSize);
  }
  probe.destroy();
  layer.add(
    new Konva.Text({
      text: name,
      x: textX,
      y: mid - nameSize * 0.65,
      width: textW,
      fontSize: nameSize,
      fontFamily: FONT_BODY,
      fontStyle: "700",
      fill: "#FFFFFF",
      wrap: "none",
    }),
  );

  const stat = (text: string, x: number, w: number, bebas = false) => {
    const size = bebas
      ? Math.min(Math.round(rowH * 0.48), Math.round(W * 0.034))
      : Math.min(Math.round(rowH * 0.34), Math.round(W * 0.024));
    layer.add(
      new Konva.Text({
        text,
        x,
        y: mid - size * (bebas ? 0.72 : 0.62),
        width: w,
        align: "center",
        fontSize: size,
        fontFamily: bebas ? FONT_DISPLAY : FONT_BODY,
        fontStyle: bebas ? "normal" : "700",
        fill: bebas ? "#FFFFFF" : "rgba(255,255,255,0.82)",
        wrap: "none",
      }),
    );
  };

  if (box.league) {
    stat(row.played || "0", box.aX, box.tableW * box.cols.a);
    stat(row.gd || "0", box.bX, box.tableW * box.cols.b);
    stat(
      row.points || "0",
      box.cX,
      box.tableW * box.cols.c - Math.round(W * 0.012),
      true,
    );
  } else {
    stat(
      row.goals || "0",
      box.cX,
      box.tableW * box.cols.c - Math.round(W * 0.012),
      true,
    );
  }
}
