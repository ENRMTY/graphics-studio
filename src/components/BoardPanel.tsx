import type { BoardData, BoardMove, BoardRow, Competition, Team } from "@types";
import { CompetitionPicker } from "./CompetitionPicker";
import { PosterPhoto } from "./PosterPhoto";

interface Props {
  data: BoardData;
  onChange: (d: BoardData) => void;
  competitions: Competition[];
  onCompetitionsChange: (c: Competition[]) => void;
  teams: Team[];
}

const MOVES: BoardMove[] = ["up", "same", "down"];

export function BoardPanel({
  data,
  onChange,
  competitions,
  onCompetitionsChange,
  teams,
}: Props) {
  const league = data.kind !== "scorers";
  const key = league ? "rows" : "scorerRows";
  const rows = data[key] ?? [];

  const setRows = (next: BoardRow[]) => onChange({ ...data, [key]: next });

  const patch = (id: string, partial: Partial<BoardRow>) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, ...partial } : row)));
  };

  const addRow = () => {
    const pos = String(rows.length + 1);
    setRows([
      ...rows,
      {
        id: `row-${Date.now()}`,
        move: "same",
        pos,
        name: "",
        logo: null,
        played: "",
        gd: "",
        points: "",
        goals: "",
        highlight: false,
      },
    ]);
  };

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
        <div className="section-label">Table</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className={`btn btn-sm ${league ? "btn-primary" : "btn-ghost"}`}
            onClick={() => onChange({ ...data, kind: "league" })}
          >
            League
          </button>
          <button
            className={`btn btn-sm ${!league ? "btn-primary" : "btn-ghost"}`}
            onClick={() => onChange({ ...data, kind: "scorers" })}
          >
            Top scorers
          </button>
        </div>
      </div>
      <div>
        <div className="section-label">
          Title{" "}
          <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>
            (optional)
          </span>
        </div>
        <input
          className="input"
          placeholder={league ? "Premier League" : "Top scorers"}
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
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
      <div>
        <div
          className="section-label"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <span>Rows</span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={addRow}
            style={{ fontSize: 11 }}
          >
            Add row
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((row, index) => (
            <div
              key={row.id}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 8,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {MOVES.map((move) => (
                  <button
                    key={move}
                    className={`btn btn-sm ${row.move === move ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => patch(row.id, { move })}
                    style={{ minWidth: 36 }}
                    title={move}
                  >
                    {move === "up" ? "▲" : move === "down" ? "▼" : "–"}
                  </button>
                ))}
                <input
                  className="input"
                  value={row.pos}
                  placeholder={String(index + 1)}
                  onChange={(e) =>
                    patch(row.id, { pos: e.target.value.slice(0, 3) })
                  }
                  style={{ width: 52, textAlign: "center" }}
                />
                <button
                  className={`btn btn-sm ${row.highlight ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => patch(row.id, { highlight: !row.highlight })}
                >
                  Mark
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() =>
                    setRows(rows.filter((item) => item.id !== row.id))
                  }
                >
                  Remove
                </button>
              </div>
              <input
                className="input"
                placeholder={league ? "Team" : "Player"}
                value={row.name}
                onChange={(e) => patch(row.id, { name: e.target.value })}
              />
              {league && (
                <select
                  className="input"
                  value=""
                  onChange={(e) => {
                    const team = teams.find(
                      (item) => item.id === e.target.value,
                    );
                    if (!team) return;
                    patch(row.id, { name: team.name, logo: team.logo });
                  }}
                >
                  <option value="">Use a saved club</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              )}
              {league ? (
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    className="input"
                    placeholder="P"
                    value={row.played}
                    onChange={(e) =>
                      patch(row.id, { played: e.target.value.slice(0, 3) })
                    }
                  />
                  <input
                    className="input"
                    placeholder="GD"
                    value={row.gd}
                    onChange={(e) =>
                      patch(row.id, { gd: e.target.value.slice(0, 5) })
                    }
                  />
                  <input
                    className="input"
                    placeholder="Pts"
                    value={row.points}
                    onChange={(e) =>
                      patch(row.id, { points: e.target.value.slice(0, 3) })
                    }
                  />
                </div>
              ) : (
                <input
                  className="input"
                  placeholder="Goals"
                  value={row.goals}
                  onChange={(e) =>
                    patch(row.id, {
                      goals: e.target.value.replace(/[^\d]/g, "").slice(0, 3),
                    })
                  }
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
