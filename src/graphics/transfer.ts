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

  // left side dark gradient overlay, to ensure text is visible
  const OVERLAY_W = Math.round(W * 0.52);

  // multi-stop gradient: opaque on left, fully transparent on right
  layer.add(
    new Konva.Rect({
      x: 0,
      y: 0,
      width: OVERLAY_W,
      height: H,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: OVERLAY_W, y: 0 },
      fillLinearGradientColorStops: [
        0,
        "rgba(0,0,0,0.97)",
        0.35,
        "rgba(0,0,0,0.92)",
        0.55,
        "rgba(0,0,0,0.80)",
        0.72,
        "rgba(0,0,0,0.55)",
        0.85,
        "rgba(0,0,0,0.25)",
        1,
        "rgba(0,0,0,0)",
      ],
    }),
  );

  // layout constants
  const PAD_X = 52;
  const CONTENT_W = OVERLAY_W - PAD_X - 20;
  const RED = "#C8102E";

  // red left accent bar
  layer.add(
    new Konva.Rect({
      x: 0,
      y: 0,
      width: 5,
      height: H,
      fill: RED,
    }),
  );

  // status badge
  const STATUS_Y = 52;
  const statusText = data.status === "confirmed" ? "CONFIRMED" : "RUMOUR";
  const statusColor = data.status === "confirmed" ? RED : "#f59e0b";

  // badge pill background
  const STATUS_PAD_H = 7;
  const STATUS_PAD_W = 14;
  const STATUS_FONT = 13;
  // approximate text width
  const statusCharW = STATUS_FONT * 0.62;
  const statusTextW = statusText.length * statusCharW;
  const badgeW = statusTextW + STATUS_PAD_W * 2;
  const badgeH = STATUS_FONT + STATUS_PAD_H * 2;

  layer.add(
    new Konva.Rect({
      x: PAD_X,
      y: STATUS_Y,
      width: badgeW,
      height: badgeH,
      fill: statusColor,
      cornerRadius: 3,
    }),
  );
  layer.add(
    new Konva.Text({
      text: statusText,
      x: PAD_X + STATUS_PAD_W,
      y: STATUS_Y + STATUS_PAD_H,
      fontSize: STATUS_FONT,
      fontFamily: FONT_DISPLAY,
      fill: "#ffffff",
      letterSpacing: 2,
    }),
  );

  // player name
  const PLAYER_Y = STATUS_Y + badgeH + 22;
  if (data.playerName) {
    const nameParts = data.playerName.trim().split(" ");
    const lastName =
      nameParts.length > 1
        ? nameParts[nameParts.length - 1].toUpperCase()
        : nameParts[0].toUpperCase();
    const firstName =
      nameParts.length > 1
        ? nameParts.slice(0, -1).join(" ").toUpperCase()
        : "";

    if (firstName) {
      layer.add(
        new Konva.Text({
          text: firstName,
          x: PAD_X,
          y: PLAYER_Y,
          fontSize: 28,
          fontFamily: FONT_DISPLAY,
          fill: "rgba(255,255,255,0.70)",
          letterSpacing: 3,
          width: CONTENT_W,
        }),
      );
      layer.add(
        new Konva.Text({
          text: lastName,
          x: PAD_X,
          y: PLAYER_Y + 32,
          fontSize: 62,
          fontFamily: FONT_DISPLAY,
          fill: "#ffffff",
          letterSpacing: 2,
          width: CONTENT_W,
        }),
      );
    } else {
      layer.add(
        new Konva.Text({
          text: lastName,
          x: PAD_X,
          y: PLAYER_Y,
          fontSize: 62,
          fontFamily: FONT_DISPLAY,
          fill: "#ffffff",
          letterSpacing: 2,
          width: CONTENT_W,
        }),
      );
    }
  }

  // divider line
  const DIV_Y = PLAYER_Y + 120;
  layer.add(
    new Konva.Line({
      points: [PAD_X, DIV_Y, PAD_X + CONTENT_W * 0.75, DIV_Y],
      stroke: "rgba(255,255,255,0.15)",
      strokeWidth: 1,
    }),
  );

  // transfer kind (loan / free / transfer)
  const KIND_Y = DIV_Y + 18;
  const kindLabel =
    data.transferKind === "loan"
      ? "LOAN"
      : data.transferKind === "free"
        ? "FREE TRANSFER"
        : "TRANSFER";

  layer.add(
    new Konva.Text({
      text: kindLabel,
      x: PAD_X,
      y: KIND_Y,
      fontSize: 12,
      fontFamily: FONT_BODY,
      fill: statusColor,
      letterSpacing: 3,
      fontStyle: "700",
    }),
  );

  // logo row
  const LOGO_ROW_Y = KIND_Y + 28;
  const LOGO_SIZE = 72;
  const ARROW_GAP = 22;
  // positioning
  const logo1CX = PAD_X + LOGO_SIZE / 2;
  const logo1CY = LOGO_ROW_Y + LOGO_SIZE / 2;

  await drawTeamLogo(
    layer,
    data.fromTeam?.logo ?? null,
    logo1CX,
    logo1CY,
    LOGO_SIZE,
    "plain",
  );

  // arrow chevrons
  const ARROW_X = PAD_X + LOGO_SIZE + ARROW_GAP;
  const ARROW_Y = LOGO_ROW_Y + LOGO_SIZE / 2;
  const arrowColor = "rgba(255,255,255,0.55)";
  const chevronSize = 8;
  const chevronSpacing = 11;

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
        stroke: arrowColor,
        strokeWidth: 2.5,
        lineCap: "round",
        lineJoin: "round",
      }),
    );
  }

  const logo2CX = ARROW_X + 3 * chevronSpacing + ARROW_GAP + LOGO_SIZE / 2;
  const logo2CY = LOGO_ROW_Y + LOGO_SIZE / 2;

  await drawTeamLogo(
    layer,
    data.toTeam?.logo ?? null,
    logo2CX,
    logo2CY,
    LOGO_SIZE,
    "plain",
  );

  // club names below logos
  const CLUB_NAME_Y = LOGO_ROW_Y + LOGO_SIZE + 10;
  const nameStyle = {
    fontSize: 10,
    fontFamily: FONT_BODY,
    fill: "rgba(255,255,255,0.45)",
    letterSpacing: 1.5,
    fontStyle: "600",
  };

  layer.add(
    new Konva.Text({
      ...nameStyle,
      text: (data.fromTeam?.name ?? "").toUpperCase(),
      x: PAD_X,
      y: CLUB_NAME_Y,
      width: LOGO_SIZE,
      align: "center",
    }),
  );
  layer.add(
    new Konva.Text({
      ...nameStyle,
      text: (data.toTeam?.name ?? "").toUpperCase(),
      x: logo2CX - LOGO_SIZE / 2,
      y: CLUB_NAME_Y,
      width: LOGO_SIZE,
      align: "center",
    }),
  );

  // fee, if not loan
  if (data.transferKind !== "loan") {
    const FEE_Y = CLUB_NAME_Y + 30;

    layer.add(
      new Konva.Text({
        text: "FEE",
        x: PAD_X,
        y: FEE_Y,
        fontSize: 10,
        fontFamily: FONT_BODY,
        fill: "rgba(255,255,255,0.35)",
        letterSpacing: 3,
        fontStyle: "600",
      }),
    );

    // build fee display string
    let feeDisplay: string;
    if (data.transferKind === "free") {
      feeDisplay = "FREE";
    } else if (data.fee) {
      const currency = (data as any).currency ?? "£";
      feeDisplay = (currency + data.fee).toUpperCase();
    } else {
      feeDisplay = "TBC";
    }

    layer.add(
      new Konva.Text({
        text: feeDisplay,
        x: PAD_X,
        y: FEE_Y + 18,
        fontSize: 36,
        fontFamily: FONT_DISPLAY,
        fill: "#ffffff",
        letterSpacing: 1,
        width: CONTENT_W,
      }),
    );
  }

  // watermark
  layer.add(
    new Konva.Text({
      text: "ENORMITY OF LFC",
      x: PAD_X,
      y: H - 32,
      width: CONTENT_W,
      fontSize: 11,
      fontFamily: FONT_DISPLAY,
      fill: "rgba(255,255,255,0.10)",
      letterSpacing: 3,
    }),
  );

  layer.draw();
}
