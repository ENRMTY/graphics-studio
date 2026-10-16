import type { Competition, GoalsData } from "@types";
import { CompetitionPicker } from "./CompetitionPicker";
import { Icons } from "./Icons";
import { useFileUpload } from "../hooks/useFileUpload";

interface Props {
  data: GoalsData;
  onChange: (d: GoalsData) => void;
  competitions: Competition[];
  onCompetitionsChange: (c: Competition[]) => void;
}

const COUNTS = [3, 4, 5, 6] as const;

export function GoalsPanel({
  data,
  onChange,
  competitions,
  onCompetitionsChange,
}: Props) {
  const photoUpload = useFileUpload((url, file) =>
    onChange({ ...data, bgImage: url, bgImageFile: file }),
  );

  const setMinute = (index: number, value: string) => {
    const minutes = [...data.minutes];
    while (minutes.length < 6) minutes.push("");
    minutes[index] = value.replace(/[^\d]/g, "").slice(0, 3);
    onChange({ ...data, minutes });
  };

  return (
    <div className="panel-body">
      <div>
        <div className="section-label">Goals</div>
        <div style={{ display: "flex", gap: 8 }}>
          {COUNTS.map((count) => (
            <button
              key={count}
              onClick={() => onChange({ ...data, count })}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: "var(--radius)",
                border:
                  data.count === count
                    ? "2px solid var(--red)"
                    : "2px solid var(--border2)",
                background:
                  data.count === count
                    ? "rgba(200,16,46,0.12)"
                    : "var(--surface2)",
                color: data.count === count ? "#fff" : "var(--text-muted)",
                fontFamily: "var(--font-body)",
                fontSize: 14,
                fontWeight: data.count === count ? 700 : 400,
                cursor: "pointer",
              }}
            >
              {count}
            </button>
          ))}
        </div>
        <p
          className="help-text"
          style={{ marginTop: 6, fontSize: 11, color: "var(--text-muted)" }}
        >
          Three to six. The times grow or shrink to fill the top.
        </p>
      </div>

      <div>
        <div className="section-label">Minutes</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Array.from({ length: data.count }, (_, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <span
                style={{ width: 18, color: "var(--text-muted)", fontSize: 12 }}
              >
                {i + 1}
              </span>
              <input
                className="input"
                inputMode="numeric"
                placeholder="Minute the goal was scored"
                value={data.minutes[i] ?? ""}
                onChange={(e) => setMinute(i, e.target.value)}
              />
              <span style={{ color: "var(--text-muted)" }}>'</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="section-label">Photo</div>
        <input {...photoUpload.inputProps} />
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
            <button className="btn btn-ghost btn-sm" onClick={photoUpload.open}>
              Replace
            </button>
            <button
              className="btn btn-icon danger"
              title="Remove photo"
              onClick={() =>
                onChange({ ...data, bgImage: null, bgImageFile: undefined })
              }
            >
              <Icons.Trash style={{ width: 13, height: 13 }} />
            </button>
          </div>
        ) : (
          <div className="upload-zone" onClick={photoUpload.open}>
            <Icons.Image style={{ width: 20, height: 20 }} />
            <span>Upload photo</span>
            <p>The player fills the picture</p>
          </div>
        )}
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
    </div>
  );
}
