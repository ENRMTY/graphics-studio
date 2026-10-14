import type { NewsData, Competition } from "@types";
import { CompetitionPicker } from "./CompetitionPicker";
import { Icons } from "./Icons";
import { useFileUpload } from "../hooks/useFileUpload";

interface Props {
  data: NewsData;
  onChange: (d: NewsData) => void;
  onClearImage: () => void;
  competitions: Competition[];
  onCompetitionsChange: (c: Competition[]) => void;
}

const HEADLINES = ["QUALIFIED", "BREAKING", "CONFIRMED"];

export function NewsPanel({
  data,
  onChange,
  onClearImage,
  competitions,
  onCompetitionsChange,
}: Props) {
  const bgUpload = useFileUpload((url, file) =>
    onChange({ ...data, bgImage: url, bgImageFile: file }),
  );

  return (
    <div className="panel-body">
      <div>
        <div className="section-label">Headline</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          {HEADLINES.map((word) => {
            const on = data.headline.trim().toUpperCase() === word;
            return (
              <button
                key={word}
                type="button"
                onClick={() => onChange({ ...data, headline: word })}
                style={{
                  flex: 1,
                  padding: "8px 6px",
                  borderRadius: "var(--radius)",
                  border: on
                    ? "2px solid var(--red)"
                    : "2px solid var(--border2)",
                  background: on ? "rgba(200,16,46,0.12)" : "var(--surface2)",
                  color: on ? "#fff" : "var(--text-muted)",
                  fontFamily: "var(--font-display)",
                  fontSize: 13,
                  letterSpacing: 0.6,
                  cursor: "pointer",
                }}
              >
                {word}
              </button>
            );
          })}
        </div>
        <input
          className="input"
          value={data.headline}
          placeholder="QUALIFIED"
          onChange={(e) => onChange({ ...data, headline: e.target.value })}
          style={{
            fontFamily: "var(--font-display)",
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        />
        <p className="help-text" style={{ marginTop: 6 }}>
          One big word. It scales to fit the frame.
        </p>
      </div>

      <div>
        <div className="section-label">Message</div>
        <textarea
          className="input"
          placeholder="Finished top four. Champions League football next season."
          value={data.caption}
          rows={3}
          onChange={(e) => onChange({ ...data, caption: e.target.value })}
          style={{
            resize: "vertical",
            lineHeight: 1.5,
            fontFamily: "var(--font-body)",
          }}
        />
        <p className="help-text" style={{ marginTop: 6 }}>
          Optional. Leave it blank and only the headline and red line show.
        </p>
      </div>

      <CompetitionPicker
        competitions={competitions}
        selected={data.competition}
        selectedIcon={data.competitionIcon}
        selectedColor={data.competitionColor}
        onSelect={(competition, competitionIcon, competitionColor) =>
          onChange({ ...data, competition, competitionIcon, competitionColor })
        }
        onCompetitionsChange={onCompetitionsChange}
      />
      <p className="help-text" style={{ marginTop: -4 }}>
        Optional. Tap the selected competition again to remove it.
      </p>

      <div>
        <div className="section-label">Background Image</div>
        <input {...bgUpload.inputProps} />
        {data.bgImage ? (
          <div className="bg-preview-row">
            <div className="bg-thumb">
              <img src={data.bgImage} alt="" />
            </div>
            <div style={{ flex: 1 }}>
              <div className="team-name-display" style={{ fontSize: 12 }}>
                Background set
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={bgUpload.open}>
              Replace
            </button>
            <button
              className="btn btn-icon danger"
              title="Remove background"
              onClick={() => {
                onChange({ ...data, bgImage: null, bgImageFile: undefined });
                onClearImage();
              }}
            >
              <Icons.Trash style={{ width: 13, height: 13 }} />
            </button>
          </div>
        ) : (
          <div className="upload-zone" onClick={bgUpload.open}>
            <Icons.Image style={{ width: 20, height: 20 }} />
            <span>Upload background photo</span>
            <p>1080×1080 recommended</p>
          </div>
        )}
      </div>
    </div>
  );
}
