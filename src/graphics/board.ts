import Konva from "konva";
import type { BoardData, BoardRow } from "@types";
import { loadImage, FONT_DISPLAY, FONT_BODY } from "./helpers";
import { paintPhoto, redBar, watermark, fitSize, RED } from "./poster";

const UP = "#3DDC97";
const DOWN = "#FF4B4B";

/* ------------------------------------------------------------------ */
/* vertical text alignment                                             */
/* ------------------------------------------------------------------ */
/*
 * Konva draws text with a "middle" baseline at (y + fontSize / 2), so the
 * visible glyphs do not sit in the middle of the text box - how far off
 * depends on the font. Bebas Neue and DM Sans differ, which is why numbers,
 * names and arrows never lined up when positioned with fixed multipliers.
 * Instead we measure the real ink of a reference string and position by that.
 */
let measureCtx: CanvasRenderingContext2D | null = null;

function inkExtent(family: string, size: number, weight: string, ref: string) {
  if (!measureCtx) {
    measureCtx = document.createElement("canvas").getContext("2d");
  }
  let asc = size * 0.35;
  let desc = size * 0.35;
  if (measureCtx) {
    measureCtx.font = `${weight} ${size}px "${family}"`;
    measureCtx.textBaseline = "middle";
    const m = measureCtx.measureText(ref);
    if (
      typeof m.actualBoundingBoxAscent === "number" &&
      typeof m.actualBoundingBoxDescent === "number"
    ) {
      asc = m.actualBoundingBoxAscent;
      desc = m.actualBoundingBoxDescent;
    }
  }
  // relative to the top of a Konva.Text box (lineHeight 1)
  return { top: size / 2 - asc, bottom: size / 2 + desc };
}

/** y for a Konva.Text so the glyph ink of `ref` is centred on `mid`. */
function yCentered(
  mid: number,
  family: string,
  size: number,
  weight: string,
  ref: string,
) {
  const e = inkExtent(family, size, weight, ref);
  return mid - (e.top + e.bottom) / 2;
}

/** y for a Konva.Text so the glyph ink of `ref` starts at `top`. */
function yCapTop(
  top: number,
  family: string,
  size: number,
  weight: string,
  ref: string,
) {
  return top - inkExtent(family, size, weight, ref).top;
}

function inkHeight(family: string, size: number, weight: string, ref: string) {
  const e = inkExtent(family, size, weight, ref);
  return e.bottom - e.top;
}

function containFit(img: HTMLImageElement, box: number) {
  const k = Math.min(box / img.width, box / img.height);
  return { w: img.width * k, h: img.height * k };
}

/* ------------------------------------------------------------------ */

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

  // light on top so the photo stays prominent, darker towards the table
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
        "rgba(0,0,0,0.10)",
        0.4,
        "rgba(0,0,0,0.12)",
        0.62,
        "rgba(0,0,0,0.66)",
        1,
        "rgba(0,0,0,0.96)",
      ],
    }),
  );

  const league = data.kind !== "scorers";
  const rows = (league ? data.rows : data.scorerRows) ?? [];
  const count = Math.max(rows.length, 1);

  /* ---- table geometry: compact, centred, anchored to the bottom ---- */
  const bar = redBar(layer, W, H, 0.012);
  const tableW = Math.round(W * 0.8);
  const tableX = Math.round((W - tableW) / 2);
  const headerH = Math.round(W * 0.036);
  const padBottom = Math.round(W * 0.008);
  const maxTableH = Math.round(Math.min(H * 0.5, W * 0.72));
  const rowH = Math.max(
    12,
    Math.floor(Math.min(W * 0.058, (maxTableH - headerH - padBottom) / count)),
  );
  const tableH = headerH + rowH * count + padBottom;
  const tableBottom = H - bar - Math.round(W * 0.065);
  const tableTop = tableBottom - tableH;

  /* ---- competition header, sits directly above the table ---- */
  const logoS = Math.round(W * 0.05);
  const headGap = Math.round(W * 0.02);
  const groupTop = tableTop - headGap - logoS;
  const title = (
    data.title || (league ? "PREMIER LEAGUE" : "TOP SCORERS")
  ).toUpperCase();
  const kicker = league ? "TABLE" : "SCORERS";
  const kickerSize = Math.max(10, Math.round(W * 0.0135));
  const titleMax = tableW - logoS - Math.round(W * 0.025);
  const titleSize = fitSize(
    title,
    titleMax,
    Math.round(W * 0.046),
    Math.round(W * 0.026),
    0.5,
  );
  const kickerCap = inkHeight(FONT_BODY, kickerSize, "700", "H");
  const titleCap = inkHeight(FONT_DISPLAY, titleSize, "400", "H");
  const innerGap = Math.round(W * 0.007);
  const textBlockH = kickerCap + innerGap + titleCap;
  const blockTop = groupTop + (logoS - textBlockH) / 2;

  layer.add(
    new Konva.Text({
      text: kicker,
      x: tableX,
      y: yCapTop(blockTop, FONT_BODY, kickerSize, "700", "H"),
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
      x: tableX,
      y: yCapTop(
        blockTop + kickerCap + innerGap,
        FONT_DISPLAY,
        titleSize,
        "400",
        "H",
      ),
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
      const { w, h } = containFit(img, logoS);
      layer.add(
        new Konva.Image({
          image: img,
          x: tableX + tableW - w,
          y: groupTop + (logoS - h) / 2,
          width: w,
          height: h,
        }),
      );
    } catch {
      // no logo
    }
  }

  /* ---- table panel ---- */
  layer.add(
    new Konva.Rect({
      x: tableX,
      y: tableTop,
      width: tableW,
      height: tableH,
      cornerRadius: Math.round(W * 0.014),
      fill: "rgba(6,6,8,0.78)",
      stroke: RED,
      strokeWidth: Math.max(1.5, W * 0.002),
      shadowColor: "#ff2d3a",
      shadowBlur: Math.round(W * 0.016),
      shadowOpacity: 0.9,
      shadowForStrokeEnabled: true,
    }),
  );

  const cols = league
    ? { move: 0.075, pos: 0.085, name: 0.47, a: 0.11, b: 0.12, c: 0.14 }
    : { move: 0.085, pos: 0.095, name: 0.62, a: 0, b: 0, c: 0.2 };

  const xAt = (frac: number) => tableX + tableW * frac;
  const moveX = xAt(0.025);
  const posX = xAt(cols.move);
  const nameX = xAt(cols.move + cols.pos);
  const aX = xAt(cols.move + cols.pos + cols.name);
  const bX = xAt(cols.move + cols.pos + cols.name + cols.a);
  const cX = xAt(1 - cols.c);
  const nameW = tableW * cols.name - Math.round(W * 0.016);
  // header and values share the same box so they centre identically
  const lastColW = tableW * cols.c - Math.round(W * 0.016);

  const headSize = Math.max(9, Math.round(Math.min(headerH * 0.4, W * 0.0125)));
  const headMid = tableTop + headerH / 2;
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
        y: yCentered(headMid, FONT_BODY, headSize, "700", "H"),
        width: w,
        align,
        fontSize: headSize,
        fontFamily: FONT_BODY,
        fontStyle: "700",
        fill: "rgba(255,255,255,0.55)",
        letterSpacing: 1.2,
        wrap: "none",
      }),
    );
  };
  head("POS", posX, tableW * cols.pos, "left");
  head(league ? "TEAM" : "PLAYER", nameX, nameW, "left");
  if (league) {
    head("P", aX, tableW * cols.a, "center");
    head("GD", bX, tableW * cols.b, "center");
    head("PTS", cX, lastColW, "center");
  } else {
    head("GOALS", cX, lastColW, "center");
  }

  const ruleY = tableTop + headerH;
  layer.add(
    new Konva.Rect({
      x: tableX + Math.round(W * 0.012),
      y: ruleY,
      width: tableW - Math.round(W * 0.024),
      height: Math.max(1.5, W * 0.0015),
      fill: RED,
      shadowColor: "#ff2d3a",
      shadowBlur: Math.round(W * 0.008),
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
      lastColW,
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
    lastColW: number;
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
        shadowBlur: Math.round(W * 0.01),
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

  // every element in the row is centred on this one line
  const mid = rowY + rowH / 2;

  /* movement indicator - drawn as an explicit shape so its visual centre
     (not the triangle centroid) is exactly on `mid` */
  const aw = Math.max(7, Math.round(rowH * 0.26));
  const ah = Math.max(6, Math.round(rowH * 0.22));
  if (row.move === "up" || row.move === "down") {
    const color = row.move === "up" ? UP : DOWN;
    const top = mid - ah / 2;
    const bottom = mid + ah / 2;
    const points =
      row.move === "up"
        ? [aw / 2, top, aw, bottom, 0, bottom]
        : [0, top, aw, top, aw / 2, bottom];
    layer.add(
      new Konva.Line({
        x: box.moveX,
        y: 0,
        points,
        closed: true,
        fill: color,
        shadowColor: color,
        shadowBlur: aw * 0.8,
        shadowOpacity: 0.9,
      }),
    );
  } else {
    const t = Math.max(2, Math.round(rowH * 0.035));
    layer.add(
      new Konva.Rect({
        x: box.moveX,
        y: mid - t / 2,
        width: aw,
        height: t,
        fill: "rgba(255,255,255,0.35)",
      }),
    );
  }

  const posSize = Math.min(Math.round(rowH * 0.46), Math.round(W * 0.03));
  layer.add(
    new Konva.Text({
      text: row.pos || String(index + 1),
      x: box.posX,
      y: yCentered(mid, FONT_DISPLAY, posSize, "400", "0"),
      width: box.tableW * box.cols.pos,
      fontSize: posSize,
      fontFamily: FONT_DISPLAY,
      fill: "#FFFFFF",
      wrap: "none",
    }),
  );

  let textX = box.nameX;
  let textW = box.nameW;
  if (logo) {
    const { w, h } = containFit(logo, Math.round(rowH * 0.62));
    layer.add(
      new Konva.Image({
        image: logo,
        x: box.nameX,
        y: mid - h / 2,
        width: w,
        height: h,
      }),
    );
    const used = Math.round(rowH * 0.62) + Math.round(W * 0.01);
    textX += used;
    textW -= used;
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
      y: yCentered(mid, FONT_BODY, nameSize, "700", "H"),
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
      ? Math.min(Math.round(rowH * 0.48), Math.round(W * 0.032))
      : Math.min(Math.round(rowH * 0.34), Math.round(W * 0.024));
    layer.add(
      new Konva.Text({
        text,
        x,
        y: yCentered(
          mid,
          bebas ? FONT_DISPLAY : FONT_BODY,
          size,
          bebas ? "400" : "700",
          "0",
        ),
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
    stat(row.points || "0", box.cX, box.lastColW, true);
  } else {
    stat(row.goals || "0", box.cX, box.lastColW, true);
  }
}
