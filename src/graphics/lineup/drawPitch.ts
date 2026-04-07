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

  {
    const arcR = cr;
    const spotY = penSpotTopY;
    const boxBottomY = py + pah;
    const dy = boxBottomY - spotY;
    const halfAngleRad = dy < arcR ? Math.asin(dy / arcR) : Math.PI / 2;
    const halfAngleDeg = (halfAngleRad * 180) / Math.PI;
    const startAngle = 90 + halfAngleDeg;
    const endAngle = 90 + (180 - halfAngleDeg);

    const arcPath = describeArc(cx, spotY, arcR, startAngle, endAngle);
    layer.add(
      new Konva.Path({
        data: arcPath,
        stroke: lc,
        strokeWidth: lw,
        fill: "rgba(0,0,0,0)",
      }),
    );
  }

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

  // penalty arc - bottom
  {
    const arcR = cr;
    const spotY = penSpotBotY;
    const boxTopY = py + ph - pah;
    const dy = spotY - boxTopY;
    const halfAngleRad = dy < arcR ? Math.asin(dy / arcR) : Math.PI / 2;
    const halfAngleDeg = (halfAngleRad * 180) / Math.PI;
    const startAngle = 270 + halfAngleDeg;
    const endAngle = 270 + (180 - halfAngleDeg);

    const arcPath = describeArc(cx, spotY, arcR, startAngle, endAngle);
    layer.add(
      new Konva.Path({
        data: arcPath,
        stroke: lc,
        strokeWidth: lw,
        fill: "rgba(0,0,0,0)",
      }),
    );
  }

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

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngleDeg: number,
  endAngleDeg: number,
): string {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startAngleDeg));
  const y1 = cy + r * Math.sin(toRad(startAngleDeg));
  const x2 = cx + r * Math.cos(toRad(endAngleDeg));
  const y2 = cy + r * Math.sin(toRad(endAngleDeg));
  const largeArc = endAngleDeg - startAngleDeg > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}
