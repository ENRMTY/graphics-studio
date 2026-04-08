import Konva from "konva";

export function drawPitch(
  layer: Konva.Layer,
  px: number,
  py: number,
  pw: number,
  ph: number,
) {
  const lc = "rgba(255,255,255,0.30)"; // line colour
  const lw = 2;

  // outer boundary
  layer.add(
    new Konva.Rect({
      x: px,
      y: py,
      width: pw,
      height: ph,
      stroke: lc,
      strokeWidth: lw,
      fill: "rgba(0,0,0,0)",
    }),
  );

  // halfway line
  layer.add(
    new Konva.Line({
      points: [px, py + ph / 2, px + pw, py + ph / 2],
      stroke: lc,
      strokeWidth: lw,
    }),
  );

  // centre circle
  const cx = px + pw / 2;
  const cy = py + ph / 2;
  const cr = pw * 0.13;
  layer.add(
    new Konva.Circle({
      x: cx,
      y: cy,
      radius: cr,
      stroke: lc,
      strokeWidth: lw,
      fill: "rgba(0,0,0,0)",
    }),
  );
  layer.add(new Konva.Circle({ x: cx, y: cy, radius: 3, fill: lc }));

  // penalty areas
  const paw = pw * 0.6;
  const pah = ph * 0.18;
  const pax = px + (pw - paw) / 2;

  // attacking end (top)
  layer.add(
    new Konva.Rect({
      x: pax,
      y: py,
      width: paw,
      height: pah,
      stroke: lc,
      strokeWidth: lw,
      fill: "rgba(0,0,0,0)",
    }),
  );

  // 6-yard box - top
  const syw = pw * 0.28;
  const syh = ph * 0.07;
  const syx = px + (pw - syw) / 2;
  layer.add(
    new Konva.Rect({
      x: syx,
      y: py,
      width: syw,
      height: syh,
      stroke: lc,
      strokeWidth: lw,
      fill: "rgba(0,0,0,0)",
    }),
  );

  // penalty spot - top
  const penSpotTopY = py + ph * 0.115;
  layer.add(new Konva.Circle({ x: cx, y: penSpotTopY, radius: 3, fill: lc }));

  // defending end (bottom)
  layer.add(
    new Konva.Rect({
      x: pax,
      y: py + ph - pah,
      width: paw,
      height: pah,
      stroke: lc,
      strokeWidth: lw,
      fill: "rgba(0,0,0,0)",
    }),
  );

  // 6-yard box - bottom
  layer.add(
    new Konva.Rect({
      x: syx,
      y: py + ph - syh,
      width: syw,
      height: syh,
      stroke: lc,
      strokeWidth: lw,
      fill: "rgba(0,0,0,0)",
    }),
  );

  // penalty spot - bottom
  const penSpotBotY = py + ph - ph * 0.115;
  layer.add(new Konva.Circle({ x: cx, y: penSpotBotY, radius: 3, fill: lc }));

  // corner arcs
  const cornerR = pw * 0.03;
  [
    { x: px, y: py, rot: 0 },
    { x: px + pw, y: py, rot: 90 },
    { x: px, y: py + ph, rot: 270 },
    { x: px + pw, y: py + ph, rot: 180 },
  ].forEach(({ x, y, rot }) => {
    layer.add(
      new Konva.Arc({
        x,
        y,
        innerRadius: 0,
        outerRadius: cornerR,
        angle: 90,
        rotation: rot,
        stroke: lc,
        strokeWidth: lw,
        fill: "rgba(0,0,0,0)",
      }),
    );
  });
}
