import React, { useRef } from "react";
import type { FullTimeData, Team, Competition, EventType } from "../types";
import { TeamPicker } from "./TeamPicker";
import { CompetitionPicker } from "./CompetitionPicker";
import { EventRow } from "./EventRow";
import { Icons } from "./Icons";
import { useFileUpload } from "../hooks/useFileUpload";

interface Props {
  data: FullTimeData;
  onChange: (d: FullTimeData) => void;
  teams: Team[];
  competitions: Competition[];
  onTeamSave: (t: Team) => void;
  onCompetitionsChange: (c: Competition[]) => void;
}

const EVENT_TYPES: { type: EventType; label: string; cls: string }[] = [
  { type: "goal", label: "Goal", cls: "goal" },
  { type: "penalty", label: "Penalty", cls: "pen" },
  { type: "red", label: "Red Card", cls: "red" },
  { type: "og", label: "OG", cls: "og" },
];

export function FullTimePanel({
  data,
  onChange,
  teams,
  competitions,
  onTeamSave,
  onCompetitionsChange,
}: Props) {
  const bgUpload = useFileUpload((url) => onChange({ ...data, bgImage: url }));

  const addEvent = (type: EventType) => {
    onChange({
      ...data,
      events: [
        ...data.events,
        {
          id: Date.now().toString(),
          type,
          player: "",
          minute: "",
          side: "home",
        },
      ],
    });
  };

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
            <p>1080×1080 recommended</p>
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

      {/* Score */}
      <div>
        <div className="section-label">Scoreline</div>
        <div className="score-row">
          <input
            className="score-digit"
            type="number"
            min={0}
            max={99}
            value={data.homeScore}
            onChange={(e) =>
              onChange({ ...data, homeScore: parseInt(e.target.value) || 0 })
            }
          />
          <div className="score-dash">–</div>
          <input
            className="score-digit"
            type="number"
            min={0}
            max={99}
            value={data.awayScore}
            onChange={(e) =>
              onChange({ ...data, awayScore: parseInt(e.target.value) || 0 })
            }
          />
        </div>
      </div>

      {/* Events */}
      <div>
        <div className="section-label">Match Events</div>
        {data.events.length === 0 && (
          <div className="empty-state" style={{ padding: 14 }}>
            <p>No events added yet</p>
          </div>
        )}
        <div className="event-list">
          {data.events.map((ev) => (
            <EventRow
              key={ev.id}
              event={ev}
              onChange={(updated) =>
                onChange({
                  ...data,
                  events: data.events.map((e) =>
                    e.id === ev.id ? updated : e,
                  ),
                })
              }
              onDelete={() =>
                onChange({
                  ...data,
                  events: data.events.filter((e) => e.id !== ev.id),
                })
              }
            />
          ))}
        </div>
        <div className="add-event-row">
          {EVENT_TYPES.map(({ type, label, cls }) => (
            <button
              key={type}
              className={`add-event-btn ${cls}`}
              onClick={() => addEvent(type)}
            >
              <Icons.Plus style={{ width: 11, height: 11 }} /> {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
