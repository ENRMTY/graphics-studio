import type { LineupData, LineupPlayer, Competition } from "@types";
import { CompetitionPicker } from "./CompetitionPicker";
import { TeamPicker } from "./TeamPicker";
import { Icons } from "./Icons";
import { useFileUpload } from "../hooks/useFileUpload";
import { buildDefaultLineup } from "@defaults";

interface Props {
  data: LineupData;
  onChange: (d: LineupData) => void;
  competitions: Competition[];
  onCompetitionsChange: (c: Competition[]) => void;
}

const FORMATIONS = ["4-3-3", "4-4-2", "4-2-3-1", "3-4-3", "3-5-2", "5-4-1"];

function PlayerRow({
  player,
  onUpdate,
  onRemove,
  showPosition = true,
}: {
  player: LineupPlayer;
  onUpdate: (p: LineupPlayer) => void;
  onRemove?: () => void;
  showPosition?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: showPosition
          ? "36px 1fr 52px auto"
          : "1fr 52px auto",
        gap: 6,
        alignItems: "center",
        marginBottom: 6,
      }}
    >
      {showPosition && (
        <input
          className="input"
          value={player.position}
          onChange={(e) =>
            onUpdate({
              ...player,
              position: e.target.value.toUpperCase().slice(0, 4),
            })
          }
          placeholder="POS"
          style={{
            padding: "4px 6px",
            fontSize: 11,
            textAlign: "center",
            fontFamily: "var(--font-mono)",
          }}
        />
      )}
      <input
        className="input"
        value={player.name}
        onChange={(e) => onUpdate({ ...player, name: e.target.value })}
        placeholder="Player name"
        style={{ padding: "4px 8px", fontSize: 12 }}
      />
      <input
        className="input"
        type="number"
        min={1}
        max={99}
        value={player.number ?? ""}
        onChange={(e) =>
          onUpdate({
            ...player,
            number: e.target.value ? parseInt(e.target.value) : null,
          })
        }
        placeholder="#"
        style={{ padding: "4px 6px", fontSize: 12, textAlign: "center" }}
      />
      {onRemove && (
        <button
          className="btn btn-icon danger"
          onClick={onRemove}
          style={{ flexShrink: 0 }}
        >
          <Icons.Trash style={{ width: 10, height: 10 }} />
        </button>
      )}
    </div>
  );
}

export function LineupPanel({
  data,
  onChange,
  competitions,
  onCompetitionsChange,
}: Props) {
  const bgUpload = useFileUpload((url, file) =>
    onChange({ ...data, bgImage: url, bgImageFile: file }),
  );

  const updatePlayer = (idx: number, p: LineupPlayer) => {
    const next = [...data.players];
    next[idx] = p;
    onChange({ ...data, players: next });
  };

  const updateSub = (idx: number, p: LineupPlayer) => {
    const next = [...data.subs];
    next[idx] = p;
    onChange({ ...data, subs: next });
  };

  const addSub = () => {
    const next = [
      ...data.subs,
      {
        id: `sub-${Date.now()}`,
        name: "",
        number: null,
        position: "",
        x: 0,
        y: 0,
      } as LineupPlayer,
    ];
    onChange({ ...data, subs: next });
  };

  const removeSub = (idx: number) => {
    onChange({ ...data, subs: data.subs.filter((_, i) => i !== idx) });
  };

  const applyFormation = (f: string) => {
    onChange({ ...data, formation: f, players: buildDefaultLineup(f) });
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
        label="Liverpool (Home)"
        value={data.homeTeam}
        onChange={(t) => onChange({ ...data, homeTeam: t })}
        teams={[]}
        onNewTeamSave={() => {}}
      />
      <TeamPicker
        label="Opponent (Away)"
        value={data.awayTeam}
        onChange={(t) => onChange({ ...data, awayTeam: t })}
        teams={[]}
        onNewTeamSave={() => {}}
      />

      {/* Manager */}
      <div>
        <div className="section-label">Manager</div>
        <input
          className="input"
          placeholder="e.g. Arne Slot"
          value={data.manager}
          onChange={(e) => onChange({ ...data, manager: e.target.value })}
        />
      </div>

      {/* Formation */}
      <div>
        <div className="section-label">Formation</div>
        <div className="tab-row" style={{ flexWrap: "wrap", gap: 6 }}>
          {FORMATIONS.map((f) => (
            <button
              key={f}
              className={`tab ${data.formation === f ? "active" : ""}`}
              onClick={() => applyFormation(f)}
              style={{ fontSize: 12, padding: "4px 10px" }}
            >
              {f}
            </button>
          ))}
        </div>
        <p className="help-text" style={{ marginTop: 6 }}>
          Switching formation resets player positions to defaults —
          names/numbers stay.
        </p>
      </div>

      {/* Starting XI */}
      <div>
        <div className="section-label">Starting XI</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "36px 1fr 52px",
            gap: 6,
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: "var(--text-muted)",
              textAlign: "center",
            }}
          >
            POS
          </span>
          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Name</span>
          <span
            style={{
              fontSize: 10,
              color: "var(--text-muted)",
              textAlign: "center",
            }}
          >
            #
          </span>
        </div>
        {data.players.map((p, i) => (
          <PlayerRow
            key={p.id}
            player={p}
            onUpdate={(updated) => updatePlayer(i, updated)}
            showPosition
          />
        ))}
      </div>

      {/* Subs */}
      <div>
        <div
          className="section-label"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Substitutes</span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={addSub}
            style={{ fontSize: 11 }}
          >
            <Icons.Plus style={{ width: 11, height: 11 }} /> Add sub
          </button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 52px auto",
            gap: 6,
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Name</span>
          <span
            style={{
              fontSize: 10,
              color: "var(--text-muted)",
              textAlign: "center",
            }}
          >
            #
          </span>
          <span />
        </div>
        {data.subs.map((p, i) => (
          <PlayerRow
            key={p.id}
            player={p}
            onUpdate={(updated) => updateSub(i, updated)}
            onRemove={() => removeSub(i)}
            showPosition={false}
          />
        ))}
        {data.subs.length === 0 && (
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            No subs added yet.
          </p>
        )}
      </div>
    </div>
  );
}
