import Konva from "konva";

export const TOP_INSET_RATIO = 0.1;

export function pitchPoint(
  px: number,
  py: number,
  pw: number,
  ph: number,
  fx: number,
  fy: number,
) {
  const inset = pw * TOP_INSET_RATIO * (1 - fy);
  return {
    x: px + inset + fx * (pw - inset * 2),
    y: py + fy * ph,
  };
}

function addLine(
  layer: Konva.Layer,
  pts: { x: number; y: number }[],
  stroke: string,
  strokeWidth: number,
  closed = false,
  fill?: string,
) {
  layer.add(
    new Konva.Line({
      points: pts.flatMap((p) => [p.x, p.y]),
      closed,
      stroke,
      strokeWidth,
      fill,
      lineJoin: "round",
      lineCap: "round",
      shadowColor: "rgba(255,255,255,0.35)",
      shadowBlur: fill ? 0 : 8,
    }),
  );
}

function arcPoints(
  px: number,
  py: number,
  pw: number,
  ph: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  from: number,
  to: number,
  steps = 28,
) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = from + ((to - from) * i) / steps;
    pts.push(
      pitchPoint(px, py, pw, ph, cx + rx * Math.cos(t), cy + ry * Math.sin(t)),
    );
  }
  return pts;
}

export function drawPitch(
  layer: Konva.Layer,
  px: number,
  py: number,
  pw: number,
  ph: number,
) {
  const line = "rgba(236,255,244,0.92)";
  const lw = 2.4;
  const p = (fx: number, fy: number) => pitchPoint(px, py, pw, ph, fx, fy);

  const tl = p(0, 0);
  const tr = p(1, 0);
  const br = p(1, 1);
  const bl = p(0, 1);

  addLine(layer, [tl, tr, br, bl], line, lw, true, "#07140f");

  addLine(layer, [tl, tr], line, lw);
  addLine(layer, [bl, br], line, lw);
  addLine(layer, [tl, bl], line, lw);
  addLine(layer, [tr, br], line, lw);

  addLine(
    layer,
    arcPoints(px, py, pw, ph, 0.5, 0, 0.155, 0.17, 0.02, Math.PI - 0.02),
    line,
    lw,
  );
  const spot = p(0.5, 0);
  layer.add(
    new Konva.Circle({ x: spot.x, y: spot.y, radius: 3.5, fill: line }),
  );

  const box = [p(0.2, 0.7), p(0.8, 0.7), p(0.8, 1), p(0.2, 1)];
  addLine(layer, box, line, lw, true);
  const six = [p(0.36, 0.9), p(0.64, 0.9), p(0.64, 1), p(0.36, 1)];
  addLine(layer, six, line, lw, true);

  const pen = p(0.5, 0.8);
  layer.add(new Konva.Circle({ x: pen.x, y: pen.y, radius: 3.5, fill: line }));

  const d = arcPoints(
    px,
    py,
    pw,
    ph,
    0.5,
    0.8,
    0.14,
    0.15,
    Math.PI + 0.55,
    Math.PI * 2 - 0.55,
  );
  addLine(layer, d, line, lw);

  const cr = 0.035;
  addLine(
    layer,
    arcPoints(
      px,
      py,
      pw,
      ph,
      0,
      1,
      cr,
      cr * (pw / ph),
      Math.PI * 1.5,
      Math.PI * 2,
    ),
    line,
    lw,
  );
  addLine(
    layer,
    arcPoints(px, py, pw, ph, 1, 1, cr, cr * (pw / ph), Math.PI, Math.PI * 1.5),
    line,
    lw,
  );
}
