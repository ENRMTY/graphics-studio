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

/**
 * Saves the PNG with a real file download. Does not open the share sheet.
 *
 * Android (Chrome, Samsung Internet): the browser hands the image to the
 * system download manager, which registers it with the media store. Gallery
 * and Photos then show it under Downloads / recent pictures. No app picker.
 *
 * iOS: Safari will not write the Photos library from a website. The file
 * lands in Files → Downloads instead.
 */
export function downloadImage(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  window.setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 60000);
}
