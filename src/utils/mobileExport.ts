import Konva from "konva";

/**
 * Mobile browsers cap canvas memory (iOS Safari: ~16.7M pixels per canvas).
 * A 1080x1920 stage at a device pixel ratio of 3 is 18.6M pixels and silently
 * exports blank/black. For the duration of an export we force every canvas to
 * a pixel ratio of 1 so the output is exactly 1080 x (1080|1920) pixels,
 * identical to the desktop export. Returns a function that restores the
 * on-screen sharpness.
 */
export function lockPixelRatioForExport(stage: Konva.Stage): () => void {
  const prevGlobal = Konva.pixelRatio;
  const restoreRatio = prevGlobal || window.devicePixelRatio || 1;

  // the stage keeps a hidden full-size buffer canvas (used for shadows/opacity)
  const buffer = stage.bufferCanvas;

  Konva.pixelRatio = 1; // layers created during export (e.g. lineup re-render)
  stage.getLayers().forEach((l) => l.getCanvas().setPixelRatio(1));
  buffer.setPixelRatio(1);

  return () => {
    Konva.pixelRatio = prevGlobal;
    stage.getLayers().forEach((l) => l.getCanvas().setPixelRatio(restoreRatio));
    buffer.setPixelRatio(restoreRatio);
  };
}

export type ShareOutcome = "shared" | "cancelled" | "unsupported";

/** opens the native share sheet (save image / instagram / whatsApp ...). */
export async function shareImage(
  blob: Blob,
  filename: string,
): Promise<ShareOutcome> {
  const file = new File([blob], filename, { type: "image/png" });
  const nav = navigator as Navigator & {
    canShare?: (d: ShareData) => boolean;
  };
  if (!nav.share || !nav.canShare || !nav.canShare({ files: [file] })) {
    return "unsupported";
  }
  try {
    await nav.share({ files: [file] });
    return "shared";
  } catch (err) {
    if ((err as DOMException)?.name === "AbortError") {
      return "cancelled";
    }
    return "unsupported"; // e.g. user-gesture expired -> use fallback sheet
  }
}
