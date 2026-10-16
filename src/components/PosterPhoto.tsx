import { Icons } from "./Icons";
import { useFileUpload } from "../hooks/useFileUpload";

interface Props {
  image: string | null;
  onPick: (url: string, file: File) => void;
  onClear: () => void;
}

export function PosterPhoto({ image, onPick, onClear }: Props) {
  const upload = useFileUpload(onPick);
  return (
    <div>
      <div className="section-label">Photo</div>
      <input {...upload.inputProps} />
      {image ? (
        <div className="bg-preview-row">
          <div className="bg-thumb">
            <img src={image} alt="" />
          </div>
          <div style={{ flex: 1 }}>
            <div className="team-name-display" style={{ fontSize: 12 }}>
              Photo set
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={upload.open}>
            Replace
          </button>
          <button
            className="btn btn-icon danger"
            title="Remove photo"
            onClick={onClear}
          >
            <Icons.Trash style={{ width: 13, height: 13 }} />
          </button>
        </div>
      ) : (
        <div className="upload-zone" onClick={upload.open}>
          <Icons.Image style={{ width: 20, height: 20 }} />
          <span>Upload photo</span>
          <p>The picture fills the graphic</p>
        </div>
      )}
    </div>
  );
}
