import type { Competition, MilestoneData } from "@types";
import { CompetitionPicker } from "./CompetitionPicker";
import { PosterPhoto } from "./PosterPhoto";

interface Props {
  data: MilestoneData;
  onChange: (d: MilestoneData) => void;
  competitions: Competition[];
  onCompetitionsChange: (c: Competition[]) => void;
}

export function MilestonePanel({
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
        <div className="section-label">Player</div>
        <input
          className="input"
          placeholder="Mohamed Salah"
          value={data.playerName}
          onChange={(e) => onChange({ ...data, playerName: e.target.value })}
        />
      </div>
      <div>
        <div className="section-label">Number</div>
        <input
          className="input"
          placeholder="50"
          value={data.value}
          onChange={(e) =>
            onChange({ ...data, value: e.target.value.slice(0, 6) })
          }
        />
      </div>
      <div>
        <div className="section-label">What it is</div>
        <input
          className="input"
          placeholder="Premier League goals"
          value={data.label}
          onChange={(e) => onChange({ ...data, label: e.target.value })}
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
