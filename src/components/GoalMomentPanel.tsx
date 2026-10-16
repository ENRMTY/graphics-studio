import type { Competition, GoalMomentData } from "@types";
import { CompetitionPicker } from "./CompetitionPicker";
import { PosterPhoto } from "./PosterPhoto";

interface Props {
  data: GoalMomentData;
  onChange: (d: GoalMomentData) => void;
  competitions: Competition[];
  onCompetitionsChange: (c: Competition[]) => void;
}

export function GoalMomentPanel({
  data,
  onChange,
  competitions,
  onCompetitionsChange,
}: Props) {
  return (
    <div className="panel-body">
      <PosterPhoto
        image={data.bgImage}
        onPick={(url, file) =>
          onChange({ ...data, bgImage: url, bgImageFile: file })
        }
        onClear={() =>
          onChange({ ...data, bgImage: null, bgImageFile: undefined })
        }
      />
      <div>
        <div className="section-label">Scorer</div>
        <input
          className="input"
          placeholder="Mohamed Salah"
          value={data.playerName}
          onChange={(e) => onChange({ ...data, playerName: e.target.value })}
        />
      </div>
      <div>
        <div className="section-label">Minute</div>
        <input
          className="input"
          inputMode="numeric"
          placeholder="24"
          value={data.minute}
          onChange={(e) =>
            onChange({
              ...data,
              minute: e.target.value.replace(/[^\d]/g, "").slice(0, 3),
            })
          }
        />
      </div>
      <div>
        <div className="section-label">Score after the goal</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="input"
            inputMode="numeric"
            placeholder="Us"
            value={data.ourScore}
            onChange={(e) =>
              onChange({
                ...data,
                ourScore: e.target.value.replace(/[^\d]/g, "").slice(0, 2),
              })
            }
          />
          <input
            className="input"
            inputMode="numeric"
            placeholder="Them"
            value={data.theirScore}
            onChange={(e) =>
              onChange({
                ...data,
                theirScore: e.target.value.replace(/[^\d]/g, "").slice(0, 2),
              })
            }
          />
        </div>
      </div>
      <div>
        <div className="section-label">
          Opponent{" "}
          <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>
            (optional)
          </span>
        </div>
        <input
          className="input"
          placeholder="Arsenal"
          value={data.opponent}
          onChange={(e) => onChange({ ...data, opponent: e.target.value })}
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
    </div>
  );
}
