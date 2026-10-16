import Konva from "konva";
import { TransferData } from "@types";
import {
  loadImage,
  coverFit,
  drawTeamLogo,
  FONT_DISPLAY,
  FONT_BODY,
} from "./helpers";

export async function renderTransfer(
  stage: Konva.Stage,
  data: TransferData,
  W: number,
  H: number = W,
): Promise<void> {
  stage.destroyChildren();
  const layer = new Konva.Layer();
  stage.add(layer);

  // base dark background
  layer.add(
    new Konva.Rect({ x: 0, y: 0, width: W, height: H, fill: "#0d0d0f" }),
  );

  // base player background image
  if (data.bgImage) {
    try {
      const img = await loadImage(data.bgImage);
      const { w, h, x, y } = coverFit(img.width, img.height, W, H);
      layer.add(new Konva.Image({ image: img, x, y, width: w, height: h }));
    } catch {
      // ignore
    }
  }

  // left panel fades out so the big type can reach the photo
  const OVERLAY_W = Math.round(W * 0.62);
  const PAD_X = Math.round(W * 0.05);
  const TEXT_W = Math.round(W * 0.48);
  const RED = "#C8102E";

  layer.add(
    new Konva.Rect({
      x: 0,
      y: 0,
      width: OVERLAY_W,
      height: H,
      listening: false,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: OVERLAY_W, y: 0 },
      fillLinearGradientColorStops: [
        0,
        "rgba(22,4,8,0.94)",
        0.42,
        "rgba(18,3,6,0.82)",
        0.68,
        "rgba(12,2,4,0.4)",
        1,
        "rgba(0,0,0,0)",
      ],
    }),
  );

  layer.add(
    new Konva.Rect({
      x: 0,
      y: 0,
      width: Math.max(6, Math.round(W * 0.008)),
      height: H,
      fill: RED,
    }),
  );

  const measure = (text: string, size: number, spacing: number) => {
    const node = new Konva.Text({
      text,
      fontSize: size,
      fontFamily: FONT_DISPLAY,
      letterSpacing: spacing,
    });
    const width = node.width();
    node.destroy();
    return width;
  };

  const fitWidth = (
    text: string,
    target: number,
    maxSize: number,
    minSize: number,
    spacing: number,
  ) => {
    let size = maxSize;
    while (size > minSize && measure(text, size, spacing) > target) size -= 2;
    return size;
  };

  let y = Math.round(W * 0.062);

  const statusText = data.status === "confirmed" ? "CONFIRMED" : "RUMOUR";
  const statusColor = data.status === "confirmed" ? RED : "#f59e0b";
  const statusFont = Math.round(W * 0.024);
  const statusProbe = new Konva.Text({
    text: statusText,
    fontSize: statusFont,
    fontFamily: FONT_DISPLAY,
    letterSpacing: 2,
  });
  const badgeW = statusProbe.width() + Math.round(W * 0.04);
  const badgeH = Math.round(statusFont * 1.15);
  statusProbe.destroy();

  layer.add(
    new Konva.Rect({
      x: PAD_X,
      y,
      width: badgeW,
      height: badgeH,
      fill: statusColor,
      cornerRadius: 4,
    }),
  );
  layer.add(
    new Konva.Text({
      text: statusText,
      x: PAD_X,
      y: y + Math.round(statusFont * 0.2),
      width: badgeW,
      align: "center",
      fontSize: statusFont,
      fontFamily: FONT_DISPLAY,
      fill: "#ffffff",
      letterSpacing: 2,
    }),
  );

  y += badgeH + Math.round(W * 0.03);

  const nameParts = (data.playerName || "PLAYER NAME").trim().split(/\s+/);
  const lastName = nameParts[nameParts.length - 1].toUpperCase();
  const firstName =
    nameParts.length > 1 ? nameParts.slice(0, -1).join(" ").toUpperCase() : "";

  if (firstName) {
    const firstSize = Math.round(W * 0.034);
    layer.add(
      new Konva.Text({
        text: firstName,
        x: PAD_X,
        y,
        width: TEXT_W,
        fontSize: firstSize,
        fontFamily: FONT_DISPLAY,
        fill: "rgba(255,255,255,0.82)",
        letterSpacing: Math.round(W * 0.004),
      }),
    );
    y += Math.round(firstSize * 0.95);
  }

  let lastSize = fitWidth(
    lastName,
    TEXT_W,
    Math.round(W * 0.32),
    Math.round(W * 0.1),
    -1,
  );
  let nameScaleX = 1;
  const minNameH = Math.round(W * 0.17);
  if (lastSize * 0.7 < minNameH) {
    lastSize = Math.round(minNameH / 0.7);
    const naturalW = measure(lastName, lastSize, -1);
    nameScaleX = Math.min(1, TEXT_W / naturalW);
  }
  layer.add(
    new Konva.Text({
      text: lastName,
      x: PAD_X,
      y,
      fontSize: lastSize,
      scaleX: nameScaleX,
      fontFamily: FONT_DISPLAY,
      fill: "#ffffff",
      letterSpacing: -1,
    }),
  );

  const aroundLine = Math.round(W * 0.032);
  const lineH = Math.max(3, Math.round(W * 0.0035));
  y += Math.round(lastSize * 0.7) + aroundLine;

  layer.add(
    new Konva.Rect({
      x: PAD_X,
      y,
      width: Math.round(W * 0.16),
      height: lineH,
      fill: RED,
    }),
  );
  y += lineH + aroundLine;

  const kindLabel =
    data.transferKind === "loan"
      ? "LOAN"
      : data.transferKind === "free"
        ? "FREE TRANSFER"
        : "TRANSFER";
  const kindSize = Math.round(W * 0.02);
  layer.add(
    new Konva.Text({
      text: kindLabel,
      x: PAD_X,
      y,
      fontSize: kindSize,
      fontFamily: FONT_BODY,
      fontStyle: "700",
      fill: "rgba(255,255,255,0.88)",
      letterSpacing: Math.round(W * 0.004),
    }),
  );
  y += kindSize + Math.round(W * 0.02);

  const LOGO_SIZE = Math.round(W * 0.125);
  const ARROW_GAP = Math.round(W * 0.02);
  const logo1CX = PAD_X + LOGO_SIZE / 2;
  const logo1CY = y + LOGO_SIZE / 2;

  await drawTeamLogo(
    layer,
    data.fromTeam?.logo ?? null,
    logo1CX,
    logo1CY,
    LOGO_SIZE,
    "plain",
  );

  const ARROW_X = PAD_X + LOGO_SIZE + ARROW_GAP;
  const ARROW_Y = y + LOGO_SIZE / 2;
  const chevronSize = Math.round(W * 0.011);
  const chevronSpacing = Math.round(W * 0.014);
  for (let i = 0; i < 3; i++) {
    const cx = ARROW_X + i * chevronSpacing;
    layer.add(
      new Konva.Line({
        points: [
          cx,
          ARROW_Y - chevronSize,
          cx + chevronSize,
          ARROW_Y,
          cx,
          ARROW_Y + chevronSize,
        ],
        stroke: "rgba(255,255,255,0.8)",
        strokeWidth: Math.max(2, Math.round(W * 0.003)),
        lineCap: "round",
        lineJoin: "round",
      }),
    );
  }

  const logo2CX = ARROW_X + 3 * chevronSpacing + ARROW_GAP + LOGO_SIZE / 2;
  await drawTeamLogo(
    layer,
    data.toTeam?.logo ?? null,
    logo2CX,
    logo1CY,
    LOGO_SIZE,
    "plain",
  );

  y += LOGO_SIZE + Math.round(W * 0.012);
  const clubSize = Math.round(W * 0.016);
  layer.add(
    new Konva.Text({
      text: (data.fromTeam?.name ?? "").toUpperCase(),
      x: PAD_X - 8,
      y,
      width: LOGO_SIZE + 16,
      align: "center",
      fontSize: clubSize,
      fontFamily: FONT_BODY,
      fontStyle: "700",
      fill: "rgba(255,255,255,0.7)",
      letterSpacing: 1,
    }),
  );
  layer.add(
    new Konva.Text({
      text: (data.toTeam?.name ?? "").toUpperCase(),
      x: logo2CX - LOGO_SIZE / 2 - 8,
      y,
      width: LOGO_SIZE + 16,
      align: "center",
      fontSize: clubSize,
      fontFamily: FONT_BODY,
      fontStyle: "700",
      fill: "rgba(255,255,255,0.7)",
      letterSpacing: 1,
    }),
  );

  y += clubSize + Math.round(W * 0.03) + Math.round(W * 0.014);

  let feeDisplay = "TBC";
  if (data.transferKind === "free") feeDisplay = "FREE";
  else if (data.transferKind === "loan") feeDisplay = "LOAN";
  else if (data.fee)
    feeDisplay = `${data.currency ?? "£"}${data.fee}`.toUpperCase();

  const feeLabel = data.transferKind === "loan" ? "DEAL" : "FEE";
  const feeLabelSize = Math.round(W * 0.016);
  layer.add(
    new Konva.Text({
      text: feeLabel,
      x: PAD_X,
      y,
      fontSize: feeLabelSize,
      fontFamily: FONT_BODY,
      fontStyle: "700",
      fill: "rgba(255,255,255,0.55)",
      letterSpacing: Math.round(W * 0.004),
    }),
  );
  y += feeLabelSize + Math.round(W * 0.008);

  const feeSize = Math.round(W * 0.175);
  const feeTarget = Math.round(TEXT_W * 0.56);
  const feeScaleX = Math.min(
    1,
    feeTarget / Math.max(measure(feeDisplay, feeSize, 0), 1),
  );
  layer.add(
    new Konva.Text({
      text: feeDisplay,
      x: PAD_X,
      y,
      fontSize: feeSize,
      scaleX: feeScaleX,
      fontFamily: FONT_DISPLAY,
      fill: "#ffffff",
      letterSpacing: 0,
    }),
  );

  layer.add(
    new Konva.Text({
      text: "ENORMITY OF LFC",
      x: PAD_X,
      y: H - Math.round(W * 0.04),
      fontSize: Math.round(W * 0.014),
      fontFamily: FONT_DISPLAY,
      fill: "rgba(255,255,255,0.45)",
      letterSpacing: 2,
    }),
  );

  layer.draw();
}
