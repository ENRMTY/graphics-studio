import { useEffect } from "react";

interface Props {
  url: string;
  filename: string;
  onClose: () => void;
}

/**
 * mobile fallback shown when the native share sheet is unavailable.
 * shows the full-resolution export; the image can be long-pressed to save,
 * or downloaded with the button.
 */
export function ExportSheet({ url, filename, onClose }: Props) {
  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal export-sheet" onClick={(e) => e.stopPropagation()}>
        <h3>Your graphic is ready</h3>
        <p className="help-text" style={{ marginBottom: 12 }}>
          Press and hold the image to save it to your photos, or tap Download.
        </p>
        <img src={url} alt="Exported graphic" className="export-sheet-img" />
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
          <a className="btn btn-primary" href={url} download={filename}>
            Download
          </a>
        </div>
      </div>
    </div>
  );
}
