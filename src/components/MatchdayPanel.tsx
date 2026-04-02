import React from "react";
import type { MatchdayData, Team, Competition } from "../types";
import { TeamPicker } from "./TeamPicker";
import { CompetitionPicker } from "./CompetitionPicker";
import { Icons } from "./Icons";
import { useFileUpload } from "../hooks/useFileUpload";

interface Props {
  data: MatchdayData;
  onChange: (d: MatchdayData) => void;
  teams: Team[];
  competitions: Competition[];
  onTeamSave: (t: Team) => void;
  onCompetitionsChange: (c: Competition[]) => void;
}

export function MatchdayPanel({
  data,
  onChange,
  teams,
  competitions,
  onTeamSave,
  onCompetitionsChange,
}: Props) {
  const bgUpload = useFileUpload((url, file) =>
    onChange({ ...data, bgImage: url, bgImageFile: file }),
  );

  return (
    <div className="panel-body">
      {/* Background */}
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
            <p>Stadium / atmospheric shot</p>
          </div>
        )}
      </div>

      {/* Competition */}
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

      {/* Teams */}
      <TeamPicker
        label="Home Team"
        value={data.homeTeam}
        onChange={(t) => onChange({ ...data, homeTeam: t })}
        teams={teams}
        onNewTeamSave={onTeamSave}
      />
      <TeamPicker
        label="Away Team"
        value={data.awayTeam}
        onChange={(t) => onChange({ ...data, awayTeam: t })}
        teams={teams}
        onNewTeamSave={onTeamSave}
      />

              {/* Logo style */}
              <div>
          <div className="section-label">Team Logo Style</div>
          <div className="tab-row">
            <button
              type="button"
              className={`tab ${data.logoStyle === "circled" || !data.logoStyle ? "active" : ""}`}
              onClick={() => onChange({ ...data, logoStyle: "circled" })}
            >
              Circled + background
            </button>
            <button
              type="button"
              className={`tab ${data.logoStyle === "plain" ? "active" : ""}`}
              onClick={() => onChange({ ...data, logoStyle: "plain" })}
            >
              Plain logo
            </button>
          </div>
        </div>

      {/* Match info */}
      <div>
        <div className="section-label">Match Info</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>
            <div className="form-label" style={{ marginBottom: 4 }}>
              Date
            </div>
            <input
              className="input"
              type="date"
              value={data.matchDate}
              onChange={(e) => onChange({ ...data, matchDate: e.target.value })}
            />
          </div>
          <div>
            <div className="form-label" style={{ marginBottom: 4 }}>
              Kick-off Time
            </div>
            <input
              className="input"
              placeholder="e.g. 17:30"
              value={data.kickoffTime}
              onChange={(e) =>
                onChange({ ...data, kickoffTime: e.target.value })
              }
            />
          </div>
          <div>
            <div className="form-label" style={{ marginBottom: 4 }}>
              Venue
            </div>
            <input
              className="input"
              placeholder="e.g. Anfield"
              value={data.venue}
              onChange={(e) => onChange({ ...data, venue: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
