import Konva from "konva";

/**
 * draws the DEFENSIVE HALF of the pitch only
 * py            = halfway line (top of canvas area)
 * py + ph       = goal line / GK end (bottom of canvas area)
 *
 * layout (top to bottom):
 *   - halfway line
 *   - open pitch
 *   - penalty area
 *   - 6-yard box
 *   - goal line
 */
export function drawPitch(
  layer: Konva.Layer,
  px: number,
  py: number,
  pw: number,
  ph: number,
) {
  const lc = "rgba(255,255,255,0.30)";
  const lw = 2;
  const cx = px + pw / 2;
  const goalLineY = py + ph; // bottom edge - GK goal line

  // touchline
  layer.add(
    new Konva.Line({
      points: [px, py, px, goalLineY],
      stroke: lc,
      strokeWidth: lw,
    }),
  );
  layer.add(
    new Konva.Line({
      points: [px + pw, py, px + pw, goalLineY],
      stroke: lc,
      strokeWidth: lw,
    }),
  );

  // half-way line
  layer.add(
    new Konva.Line({
      points: [px, py, px + pw, py],
      stroke: lc,
      strokeWidth: lw,
      // dash: [8, 6],
    }),
  );

  // center circle arc
  const circleR = pw * 0.13;
  const arcStartX = cx - circleR;
  const arcEndX = cx + circleR;
  layer.add(
    new Konva.Path({
      data: `M ${arcStartX} ${py} A ${circleR} ${circleR} 0 0 0 ${arcEndX} ${py}`,
      stroke: lc,
      strokeWidth: lw,
      fill: "",
    }),
  );
  // centre spot
  layer.add(new Konva.Circle({ x: cx, y: py, radius: 3, fill: lc }));

  // goal line
  layer.add(
    new Konva.Line({
      points: [px, goalLineY, px + pw, goalLineY],
      stroke: lc,
      strokeWidth: lw,
    }),
  );

  // penalty area
  const paw = pw * 0.6;
  const pah = ph * 0.3;
  const pax = px + (pw - paw) / 2;
  const penAreaTopY = goalLineY - pah;
  layer.add(
    new Konva.Rect({
      x: pax,
      y: penAreaTopY,
      width: paw,
      height: pah,
      stroke: lc,
      strokeWidth: lw,
      fill: "rgba(0,0,0,0)",
    }),
  );

  // 6-yard box
  const syw = pw * 0.28;
  const syh = ph * 0.1;
  const syx = px + (pw - syw) / 2;
  layer.add(
    new Konva.Rect({
      x: syx,
      y: goalLineY - syh,
      width: syw,
      height: syh,
      stroke: lc,
      strokeWidth: lw,
      fill: "rgba(0,0,0,0)",
    }),
  );

  // penalty spot
  const penSpotY = goalLineY - ph * 0.2;
  layer.add(new Konva.Circle({ x: cx, y: penSpotY, radius: 3, fill: lc }));

  // penalty arc
  // the D is centered on the penalty spot. only the portion above the penalty
  // area top line is drawn. we compute the chord angle mathematically.
  const dR = circleR;
  const dToTop = penSpotY - penAreaTopY; // vertical distance
  const cosHalfAngle = Math.min(1, Math.max(-1, dToTop / dR));
  const halfAngleDeg = (Math.acos(cosHalfAngle) * 180) / Math.PI;
  const arcStartAngle = 270 - halfAngleDeg;
  const arcSpan = halfAngleDeg * 2;

  layer.add(
    new Konva.Arc({
      x: cx,
      y: penSpotY,
      innerRadius: dR - lw / 2,
      outerRadius: dR + lw / 2,
      angle: arcSpan,
      rotation: arcStartAngle,
      fill: lc,
      stroke: "",
      strokeWidth: 0,
    }),
  );

  // corner arcs
  const cornerR = pw * 0.03;
  [
    { x: px, y: goalLineY, rot: 270 },
    { x: px + pw, y: goalLineY, rot: 180 },
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
