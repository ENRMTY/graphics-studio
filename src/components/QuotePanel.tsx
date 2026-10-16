import type { QuoteData, Competition } from "@types";
import { CompetitionPicker } from "./CompetitionPicker";
import { Icons } from "./Icons";
import { useFileUpload } from "../hooks/useFileUpload";

interface Props {
  data: QuoteData;
  onChange: (d: QuoteData) => void;
  onClearImage: (field: "bgImage" | "playerImage") => void;
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
  onClearImage,
  competitions,
  onCompetitionsChange,
}: Props) {
  const bgUpload = useFileUpload((url, file) =>
    onChange({ ...data, bgImage: url, bgImageFile: file }),
  );

  const position = data.layout === "top" ? "top" : "bottom";
  const quoteSize = data.quoteSize === "big" ? "big" : "small";

  return (
    <div className="panel-body">
      <div>
        <div className="section-label">Quote position</div>
        <div style={{ display: "flex", gap: 8 }}>
          {(
            [
              ["bottom", "Bottom"],
              ["top", "Top"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => onChange({ ...data, layout: value })}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "var(--radius)",
                border:
                  position === value
                    ? "2px solid var(--red)"
                    : "2px solid var(--border2)",
                background:
                  position === value
                    ? "rgba(200,16,46,0.12)"
                    : "var(--surface2)",
                color: position === value ? "#fff" : "var(--text-muted)",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: position === value ? 700 : 400,
                cursor: "pointer",
                letterSpacing: 0.5,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="section-label">Quote size</div>
        <div style={{ display: "flex", gap: 8 }}>
          {(
            [
              ["small", "Small"],
              ["big", "Big"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => onChange({ ...data, quoteSize: value })}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "var(--radius)",
                border:
                  quoteSize === value
                    ? "2px solid var(--red)"
                    : "2px solid var(--border2)",
                background:
                  quoteSize === value
                    ? "rgba(200,16,46,0.12)"
                    : "var(--surface2)",
                color: quoteSize === value ? "#fff" : "var(--text-muted)",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: quoteSize === value ? 700 : 400,
                cursor: "pointer",
                letterSpacing: 0.5,
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <p
          className="help-text"
          style={{ marginTop: 6, fontSize: 11, color: "var(--text-muted)" }}
        >
          Small stays as it is. Big is larger and thicker, like the stats
          numbers.
        </p>
      </div>

      <div>
        <div className="section-label">Photo</div>
        <input {...bgUpload.inputProps} />
        {data.bgImage ? (
          <div className="bg-preview-row">
            <div className="bg-thumb">
              <img src={data.bgImage} alt="" />
            </div>
            <div style={{ flex: 1 }}>
              <div className="team-name-display" style={{ fontSize: 12 }}>
                Photo set
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={bgUpload.open}>
              Replace
            </button>
            <button
              className="btn btn-icon danger"
              title="Remove photo"
              onClick={() => {
                onChange({ ...data, bgImage: null, bgImageFile: undefined });
                onClearImage("bgImage");
              }}
            >
              <Icons.Trash style={{ width: 13, height: 13 }} />
            </button>
          </div>
        ) : (
          <div className="upload-zone" onClick={bgUpload.open}>
            <Icons.Image style={{ width: 20, height: 20 }} />
            <span>Upload photo</span>
            <p>One picture. 1080×1080 recommended</p>
          </div>
        )}
      </div>

      <div>
        <div className="section-label">Player Name</div>
        <input
          className="input"
          placeholder="e.g. Alexis Mac Allister"
          value={data.playerName}
          onChange={(e) => onChange({ ...data, playerName: e.target.value })}
        />
      </div>

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
