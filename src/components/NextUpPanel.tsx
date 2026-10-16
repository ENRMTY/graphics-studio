import type { Competition, NextUpData, Team } from "@types";
import { CompetitionPicker } from "./CompetitionPicker";
import { TeamPicker } from "./TeamPicker";
import { PosterPhoto } from "./PosterPhoto";

interface Props {
  data: NextUpData;
  onChange: (d: NextUpData) => void;
  competitions: Competition[];
  onCompetitionsChange: (c: Competition[]) => void;
  teams: Team[];
  onTeamSave: (team: Team) => void;
}

export function NextUpPanel({
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
      <div>
        <div className="section-label">Kickoff</div>
        <input
          className="input"
          placeholder="20:00"
          value={data.kickoff}
          onChange={(e) => onChange({ ...data, kickoff: e.target.value })}
        />
      </div>
      <div>
        <div className="section-label">
          Date{" "}
          <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>
            (optional)
          </span>
        </div>
        <input
          className="input"
          placeholder="Saturday 18 Oct"
          value={data.matchDate}
          onChange={(e) => onChange({ ...data, matchDate: e.target.value })}
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
