import type { Competition, TableSpotData } from "@types";
import { CompetitionPicker } from "./CompetitionPicker";
import { PosterPhoto } from "./PosterPhoto";

interface Props {
  data: TableSpotData;
  onChange: (d: TableSpotData) => void;
  competitions: Competition[];
  onCompetitionsChange: (c: Competition[]) => void;
}

export function TableSpotPanel({
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
        <div className="section-label">Position</div>
        <input
          className="input"
          inputMode="numeric"
          placeholder="1"
          value={data.position}
          onChange={(e) =>
            onChange({
              ...data,
              position: e.target.value.replace(/[^\d]/g, "").slice(0, 2),
            })
          }
        />
      </div>
      <div>
        <div className="section-label">Points</div>
        <input
          className="input"
          inputMode="numeric"
          placeholder="45"
          value={data.points}
          onChange={(e) =>
            onChange({
              ...data,
              points: e.target.value.replace(/[^\d]/g, "").slice(0, 3),
            })
          }
        />
      </div>
      <div>
        <div className="section-label">Goal difference</div>
        <input
          className="input"
          placeholder="+18"
          value={data.gd}
          onChange={(e) =>
            onChange({ ...data, gd: e.target.value.slice(0, 5) })
          }
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
