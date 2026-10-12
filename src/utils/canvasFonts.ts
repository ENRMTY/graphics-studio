/**
 * konva draws text on a <canvas>, and browsers (mobile Safari in particular)
 * do not wait for web fonts before canvas draws. make sure every face used by
 * the graphics is loaded before rendering / exporting.
 */
const FACES = [
  '400 24px "Bebas Neue"',
  '400 24px "DM Sans"',
  '500 24px "DM Sans"',
  '600 24px "DM Sans"',
];

let pending: Promise<void> | null = null;

export function ensureCanvasFonts(): Promise<void> {
  if (!("fonts" in document)) {
    return Promise.resolve();
  }
  if (!pending) {
    pending = Promise.all(FACES.map((f) => document.fonts.load(f)))
      .then(() => document.fonts.ready)
      .then(() => undefined)
      .catch(() => {
        pending = null; // allow a retry if the font request failed
      });
  }
  return pending;
}
