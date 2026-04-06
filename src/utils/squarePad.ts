/**
 * squarePad
 *
 * places an image on a transparent square canvas so neither dimension is
 * shrunk. The image is centred. If the image is already square it is returned
 * unchanged (no re-encoding, no quality loss)
 *
 * works for any image with a transparent background (PNG, WebP, etc.) —
 * ctx.clearRect keeps the canvas fully transparent before drawing.
 */
export async function squarePad(
  file: File,
): Promise<{ dataUrl: string; file: File }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const { naturalWidth: w, naturalHeight: h } = img;

      // already square - skip re-encoding entirely
      if (w === h) {
        const reader = new FileReader();
        reader.onload = (ev) =>
          resolve({ dataUrl: ev.target!.result as string, file });
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      // square canvas sized to the larger dimension
      const size = Math.max(w, h);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d")!;
      // clearRect ensures the background stays fully transparent
      ctx.clearRect(0, 0, size, size);

      // center the image in the square
      const offsetX = Math.round((size - w) / 2);
      const offsetY = Math.round((size - h) / 2);
      ctx.drawImage(img, offsetX, offsetY, w, h);

      const dataUrl = canvas.toDataURL("image/png");

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("squarePad: toBlob returned null"));
          return;
        }
        const paddedFile = new File(
          [blob],
          file.name.replace(/\.[^.]+$/, ".png"),
          { type: "image/png" },
        );
        resolve({ dataUrl, file: paddedFile });
      }, "image/png");
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("squarePad: failed to load image"));
    };

    img.src = objectUrl;
  });
}
