import type { StatsData, Competition } from "@types";
import { CompetitionPicker } from "./CompetitionPicker";
import { Icons } from "./Icons";
import { useFileUpload } from "../hooks/useFileUpload";

interface Props {
  data: StatsData;
  onChange: (d: StatsData) => void;
  competitions: Competition[];
  onCompetitionsChange: (c: Competition[]) => void;
}

const PRESET_STATS = [
  { label: "Goals", value: "" },
  { label: "Assists", value: "" },
  { label: "Appearances", value: "" },
  { label: "Clean Sheets", value: "" },
];

const PRESET_ACCENT_COLORS = [
  "#C8102E",
  "#F6C326",
  "#FFFFFF",
  "#3d195b",
  "#001489",
  "#00A550",
];

export function StatsPanel({
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

  const addStat = () => {
    onChange({
      ...data,
      stats: [
        ...data.stats,
        { id: Date.now().toString(), label: "", value: "", enabled: true },
      ],
    });
  };

  const updateStat = (id: string, patch: Partial<(typeof data.stats)[0]>) => {
    onChange({
      ...data,
      stats: data.stats.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  };

  const removeStat = (id: string) => {
    onChange({ ...data, stats: data.stats.filter((s) => s.id !== id) });
  };

  const addPresetStats = () => {
    const existing = new Set(data.stats.map((s) => s.label.toLowerCase()));
    const toAdd = PRESET_STATS.filter(
      (p) => !existing.has(p.label.toLowerCase()),
    ).map((p) => ({
      id: Date.now().toString() + Math.random(),
      ...p,
      enabled: true,
    }));
    if (toAdd.length > 0) {
      onChange({ ...data, stats: [...data.stats, ...toAdd] });
    }
  };

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

      {/* player Image */}
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
            <p>PNG cutout works best</p>
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
      <div style={{ marginTop: -10, marginBottom: 2 }}>
        <p
          className="help-text"
          style={{ fontSize: 11, color: "var(--text-muted)" }}
        >
          Leave blank to show "All Competitions" as text
        </p>
      </div>

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

      {/* stats */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <div className="section-label" style={{ marginBottom: 0 }}>
            Stats
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={addPresetStats}
              title="Add common stats"
            >
              Presets
            </button>
            <button className="btn btn-ghost btn-sm" onClick={addStat}>
              <Icons.Plus style={{ width: 11, height: 11 }} /> Add
            </button>
          </div>
        </div>

        {data.stats.length === 0 && (
          <div className="empty-state" style={{ padding: 14 }}>
            <p>No stats yet — add some above</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {data.stats.map((stat) => (
            <div
              key={stat.id}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "8px 10px",
                opacity: stat.enabled ? 1 : 0.45,
              }}
            >
              {/* toggle */}
              <button
                onClick={() => updateStat(stat.id, { enabled: !stat.enabled })}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  border: `2px solid ${stat.enabled ? "var(--red)" : "var(--border2)"}`,
                  background: stat.enabled ? "var(--red)" : "transparent",
                  cursor: "pointer",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
                title={stat.enabled ? "Hide stat" : "Show stat"}
              >
                {stat.enabled && (
                  <svg
                    viewBox="0 0 10 8"
                    fill="none"
                    style={{ width: 10, height: 8 }}
                  >
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="white"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>

              {/* value */}
              <input
                className="input input-sm"
                style={{
                  width: 60,
                  textAlign: "center",
                  flexShrink: 0,
                  fontWeight: 700,
                }}
                placeholder="0"
                value={stat.value}
                onChange={(e) => updateStat(stat.id, { value: e.target.value })}
              />

              {/* label */}
              <input
                className="input input-sm"
                style={{ flex: 1 }}
                placeholder="Label (e.g. Goals)"
                value={stat.label}
                onChange={(e) => updateStat(stat.id, { label: e.target.value })}
              />

              {/* delete */}
              <button
                className="btn btn-icon danger"
                onClick={() => removeStat(stat.id)}
                title="Remove"
              >
                <Icons.Trash style={{ width: 13, height: 13 }} />
              </button>
            </div>
          ))}
        </div>

        {data.stats.length > 0 && (
          <p
            className="help-text"
            style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)" }}
          >
            Toggle the checkbox to show or hide each stat on the graphic
          </p>
        )}
      </div>
    </div>
  );
}
