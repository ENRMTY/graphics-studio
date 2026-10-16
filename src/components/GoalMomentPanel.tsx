import type { Competition, GoalMomentData, Team } from "@types";
import { CompetitionPicker } from "./CompetitionPicker";
import { TeamPicker } from "./TeamPicker";
import { PosterPhoto } from "./PosterPhoto";

interface Props {
  data: GoalMomentData;
  onChange: (d: GoalMomentData) => void;
  competitions: Competition[];
  onCompetitionsChange: (c: Competition[]) => void;
  teams: Team[];
  onTeamSave: (team: Team) => void;
}

export function GoalMomentPanel({
  data,
  onChange,
  competitions,
  onCompetitionsChange,
  teams,
  onTeamSave,
}: Props) {
  const usTeam: Team | null = data.usName
    ? { id: "us", name: data.usName, logo: data.usLogo }
    : null;
  const opponentTeam: Team | null = data.opponent
    ? { id: "opponent", name: data.opponent, logo: data.opponentLogo }
    : null;

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
      <TeamPicker
        label="Us"
        value={usTeam}
        teams={teams}
        onChange={(team) =>
          onChange({ ...data, usName: team.name, usLogo: team.logo })
        }
        onNewTeamSave={onTeamSave}
      />
      <TeamPicker
        label="Opponent"
        value={opponentTeam}
        teams={teams}
        onChange={(team) =>
          onChange({ ...data, opponent: team.name, opponentLogo: team.logo })
        }
        onNewTeamSave={onTeamSave}
      />
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
