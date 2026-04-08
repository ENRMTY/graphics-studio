import type { QuoteData, Competition } from "@types";
import { CompetitionPicker } from "./CompetitionPicker";
import { Icons } from "./Icons";
import { useFileUpload } from "../hooks/useFileUpload";

interface Props {
  data: QuoteData;
  onChange: (d: QuoteData) => void;
  competitions: Competition[];
  onCompetitionsChange: (c: Competition[]) => void;
}

const PRESET_ACCENT_COLORS = [
  "#C8102E",
  "#F6C326",
  "#FFFFFF",
  "#3d195b",
  "#001489",
  "#00A550",
];

export function QuotePanel({
  data,
  onChange,
  competitions,
  onCompetitionsChange,
}: Props) {
  const bgUpload = useFileUpload((url, file) =>
    onChange({ ...data, bgImage: url, bgImageFile: file }),
  );

  const playerImgUpload = useFileUpload((url, file) =>
    onChange({ ...data, playerImage: url, playerImageFile: file }),
  );

  return (
    <div className="panel-body">
      {/* background */}
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
          </div>
        ) : (
          <div className="upload-zone" onClick={bgUpload.open}>
            <Icons.Image style={{ width: 20, height: 20 }} />
            <span>Upload background photo</span>
            <p>1080×1080 recommended</p>
          </div>
        )}
      </div>

      {/* player image */}
      <div>
        <div className="section-label">Player Image</div>
        <input {...playerImgUpload.inputProps} />
        {data.playerImage ? (
          <div className="bg-preview-row">
            <div className="bg-thumb">
              <img src={data.playerImage} alt="" />
            </div>
            <div style={{ flex: 1 }}>
              <div className="team-name-display" style={{ fontSize: 12 }}>
                Player image set
              </div>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={playerImgUpload.open}
            >
              Replace
            </button>
          </div>
        ) : (
          <div className="upload-zone" onClick={playerImgUpload.open}>
            <Icons.Image style={{ width: 20, height: 20 }} />
            <span>Upload player image</span>
            <p>PNG cutout or portrait works best</p>
          </div>
        )}
      </div>

      {/* player Name */}
      <div>
        <div className="section-label">Player Name</div>
        <input
          className="input"
          placeholder="e.g. Mohamed Salah"
          value={data.playerName}
          onChange={(e) => onChange({ ...data, playerName: e.target.value })}
        />
      </div>

      {/* player role */}
      <div>
        <div className="section-label">Player Role / Subtitle</div>
        <input
          className="input"
          placeholder="e.g. Liverpool FC · Forward"
          value={data.playerRole}
          onChange={(e) => onChange({ ...data, playerRole: e.target.value })}
        />
      </div>

      {/* quote text */}
      <div>
        <div className="section-label">Quote</div>
        <textarea
          className="input"
          placeholder="Type the quote here…"
          value={data.quoteText}
          onChange={(e) => onChange({ ...data, quoteText: e.target.value })}
          rows={5}
          style={{
            resize: "vertical",
            lineHeight: 1.6,
            fontFamily: "var(--font-body)",
          }}
        />
      </div>

      {/* competition */}
      <CompetitionPicker
        competitions={competitions}
        selected={data.competition}
        selectedIcon={data.competitionIcon}
        selectedColor={data.competitionColor}
        onSelect={(name, icon, color) =>
          onChange({
            ...data,
            competition: name,
            competitionIcon: icon,
            competitionColor: color,
          })
        }
        onCompetitionsChange={onCompetitionsChange}
      />

      {/* accent colour */}
      <div>
        <div className="section-label">Accent Colour</div>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {PRESET_ACCENT_COLORS.map((col) => (
            <button
              key={col}
              onClick={() => onChange({ ...data, accentColor: col })}
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: col,
                border:
                  data.accentColor === col
                    ? "2px solid white"
                    : "2px solid transparent",
                cursor: "pointer",
                outline: "none",
                boxShadow:
                  data.accentColor === col ? `0 0 0 2px ${col}` : "none",
                flexShrink: 0,
              }}
            />
          ))}
          <input
            type="color"
            value={data.accentColor || "#C8102E"}
            onChange={(e) => onChange({ ...data, accentColor: e.target.value })}
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              background: "none",
              padding: 0,
            }}
            title="Custom colour"
          />
        </div>
      </div>
    </div>
  );
}
