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

  const playerImgUpload = useFileUpload((url, file) =>
    onChange({ ...data, playerImage: url, playerImageFile: file }),
  );

  const layout = data.layout ?? "classic";

  return (
    <div className="panel-body">
      {/* Layout switcher */}
      <div>
        <div className="section-label">Design Layout</div>
        <div style={{ display: "flex", gap: 8 }}>
          {(["classic", "overlay"] as const).map((l) => (
            <button
              key={l}
              onClick={() => onChange({ ...data, layout: l })}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "var(--radius)",
                border:
                  layout === l
                    ? "2px solid var(--red)"
                    : "2px solid var(--border2)",
                background:
                  layout === l ? "rgba(200,16,46,0.12)" : "var(--surface2)",
                color: layout === l ? "#fff" : "var(--text-muted)",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: layout === l ? 700 : 400,
                cursor: "pointer",
                textTransform: "capitalize",
                letterSpacing: 0.5,
              }}
            >
              {l === "classic" ? "Classic" : "Overlay"}
            </button>
          ))}
        </div>
        {layout === "overlay" && (
          <p
            className="help-text"
            style={{ marginTop: 6, fontSize: 11, color: "var(--text-muted)" }}
          >
            Full photo background with a bottom gradient panel — like the Full
            Time &amp; Match Day graphics.
          </p>
        )}
      </div>

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
            <button
              className="btn btn-icon danger"
              title="Remove background"
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
            <button
              className="btn btn-icon danger"
              title="Remove player image"
              onClick={() => {
                onChange({
                  ...data,
                  playerImage: null,
                  playerImageFile: undefined,
                });
                onClearImage("playerImage");
              }}
            >
              <Icons.Trash style={{ width: 13, height: 13 }} />
            </button>
          </div>
        ) : (
          <div className="upload-zone" onClick={playerImgUpload.open}>
            <Icons.Image style={{ width: 20, height: 20 }} />
            <span>Upload player image</span>
            <p>
              {layout === "overlay"
                ? "PNG cutout or portrait"
                : "PNG cutout or portrait works best"}
            </p>
          </div>
        )}
      </div>

      {/* player Name */}
      <div>
        <div className="section-label">Player Name</div>
        <input
          className="input"
          placeholder="e.g. Virgil van Dijk"
          value={data.playerName}
          onChange={(e) => onChange({ ...data, playerName: e.target.value })}
        />
      </div>

      {/* match context (overlay only) */}
      {layout === "overlay" ? (
        <div>
          <div className="section-label">
            Match Context{" "}
            <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>
              (optional)
            </span>
          </div>
          <input
            className="input"
            placeholder="e.g. yesterday's game · vs Man City"
            value={data.matchContext ?? ""}
            onChange={(e) =>
              onChange({ ...data, matchContext: e.target.value })
            }
          />
          <p
            className="help-text"
            style={{ marginTop: 4, fontSize: 11, color: "var(--text-muted)" }}
          >
            Shown as "on [your text]" beneath the player name
          </p>
        </div>
      ) : (
        /* player role (classic only) */
        <div>
          <div className="section-label">Player Role / Subtitle</div>
          <input
            className="input"
            placeholder="e.g. Liverpool FC · Forward"
            value={data.playerRole}
            onChange={(e) => onChange({ ...data, playerRole: e.target.value })}
          />
        </div>
      )}

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
