import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import type { LineupData, LineupPlayer, Competition, Team } from "@types";
import { CompetitionPicker } from "./CompetitionPicker";
import { TeamPicker } from "./TeamPicker";
import { Icons } from "./Icons";
import { useFileUpload } from "../hooks/useFileUpload";
import { buildDefaultLineup } from "@defaults";
import {
  loadSavedPlayers,
  type SavedPlayer,
  loadDotColors,
  saveDotColors,
} from "../utils/storage";

interface Props {
  data: LineupData;
  onChange: (d: LineupData) => void;
  competitions: Competition[];
  onCompetitionsChange: (c: Competition[]) => void;
  teams: Team[];
  onTeamSave: (team: Team) => void;
}

const FORMATIONS = ["4-3-3", "4-4-2", "4-2-3-1", "3-4-3", "3-5-2", "5-4-1"];

// auto-complete input for player names with ghost text and suggestions from saved players
function PlayerNameInput({
  value,
  onChange,
  savedPlayers,
  placeholder = "Player name",
}: {
  value: string;
  onChange: (name: string, suggestion?: SavedPlayer) => void;
  savedPlayers: SavedPlayer[];
  placeholder?: string;
}) {
  const [ghost, setGhost] = useState("");
  const [activeSuggestion, setActiveSuggestion] = useState<SavedPlayer | null>(
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // recompute ghost whenever value changes
  useEffect(() => {
    if (!value.trim()) {
      setGhost("");
      setActiveSuggestion(null);
      return;
    }
    const lower = value.toLowerCase();
    const match = savedPlayers.find((p) =>
      p.name.toLowerCase().startsWith(lower),
    );
    if (match && match.name.toLowerCase() !== lower) {
      setGhost(match.name.slice(value.length));
      setActiveSuggestion(match);
    } else {
      setGhost("");
      setActiveSuggestion(null);
    }
  }, [value, savedPlayers]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Tab" || e.key === "Enter") && activeSuggestion && ghost) {
      e.preventDefault();
      onChange(activeSuggestion.name, activeSuggestion);
      setGhost("");
      setActiveSuggestion(null);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div style={{ position: "relative", flex: 1 }}>
      {/* ghost layer — shows completion in faded colour */}
      {ghost && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            padding: "4px 8px",
            fontSize: 12,
            fontFamily: "inherit",
            pointerEvents: "none",
            color: "transparent", // hide the typed part
            whiteSpace: "pre",
            overflow: "hidden",
          }}
        >
          <span style={{ visibility: "hidden" }}>{value}</span>
          <span style={{ color: "rgba(255,255,255,0.28)" }}>{ghost}</span>
        </div>
      )}
      <input
        ref={inputRef}
        className="input"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        style={{
          padding: "4px 8px",
          fontSize: 12,
          width: "100%",
          background: "transparent",
          position: "relative",
          zIndex: 1,
        }}
      />
    </div>
  );
}

function PlayerRow({
  player,
  onUpdate,
  onRemove,
  showPosition = true,
  savedPlayers,
}: {
  player: LineupPlayer;
  onUpdate: (p: LineupPlayer) => void;
  onRemove?: () => void;
  showPosition?: boolean;
  savedPlayers: SavedPlayer[];
}) {
  const handleNameChange = (name: string, suggestion?: SavedPlayer) => {
    if (suggestion) {
      // autocomplete accepted
      onUpdate({
        ...player,
        name,
        number:
          player.number === null && suggestion.number !== null
            ? suggestion.number
            : player.number,
      });
    } else {
      onUpdate({ ...player, name });
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: showPosition
          ? "36px 1fr 48px 28px auto"
          : "1fr 48px 28px auto",
        gap: 5,
        alignItems: "center",
        marginBottom: 5,
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
            padding: "4px 5px",
            fontSize: 10,
            textAlign: "center",
            fontFamily: "var(--font-mono)",
          }}
        />
      )}

      <PlayerNameInput
        value={player.name}
        onChange={handleNameChange}
        savedPlayers={savedPlayers}
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
        style={{ padding: "4px 5px", fontSize: 12, textAlign: "center" }}
      />

      {/* Captain toggle */}
      <button
        title={player.isCaptain ? "Remove captain" : "Set as captain"}
        onClick={() => onUpdate({ ...player, isCaptain: !player.isCaptain })}
        style={{
          width: 24,
          height: 24,
          borderRadius: 4,
          border: player.isCaptain
            ? "1.5px solid #FFD700"
            : "1.5px solid rgba(255,255,255,0.15)",
          background: player.isCaptain ? "rgba(255,215,0,0.15)" : "transparent",
          color: player.isCaptain ? "#FFD700" : "rgba(255,255,255,0.3)",
          fontSize: 11,
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.15s",
        }}
      >
        C
      </button>

      {onRemove ? (
        <button
          className="btn btn-icon danger"
          onClick={onRemove}
          style={{ flexShrink: 0 }}
        >
          <Icons.Trash style={{ width: 10, height: 10 }} />
        </button>
      ) : (
        <span style={{ width: 28 }} />
      )}
    </div>
  );
}

// main panel
export function LineupPanel({
  data,
  onChange,
  competitions,
  onCompetitionsChange,
  teams,
  onTeamSave,
}: Props) {
  const [savedPlayers, setSavedPlayers] = useState<SavedPlayer[]>([]);
  const [dotColors, setDotColors] = useState<string[]>([]);
  const [newColor, setNewColor] = useState("#C8102E");

  // load saved players on mount
  useEffect(() => {
    setSavedPlayers(loadSavedPlayers());
    setDotColors(loadDotColors());
  }, []);

  const addDotColor = () => {
    const hex = newColor.trim().toUpperCase();
    if (!hex.match(/^#[0-9A-F]{6}$/i)) return;
    if (dotColors.includes(hex)) return;
    const updated = [...dotColors, hex];
    setDotColors(updated);
    saveDotColors(updated);
  };

  const removeDotColor = (color: string) => {
    const updated = dotColors.filter((c) => c !== color);
    setDotColors(updated);
    saveDotColors(updated);
    if (data.dotColor === color) {
      onChange({ ...data, dotColor: undefined });
    }
  };

  const selectDotColor = (color: string) => {
    onChange({
      ...data,
      dotColor: data.dotColor === color ? undefined : color,
    });
  };

  const bgUpload = useFileUpload((url, file) =>
    onChange({ ...data, bgImage: url, bgImageFile: file }),
  );

  const updatePlayer = useCallback(
    (idx: number, p: LineupPlayer) => {
      const next = [...data.players];
      // if this player is being set as captain, clear captain from others
      if (p.isCaptain) {
        for (let i = 0; i < next.length; i++)
          next[i] = { ...next[i], isCaptain: false };
      }
      next[idx] = p;
      onChange({ ...data, players: next });
    },
    [data, onChange],
  );

  const updateSub = useCallback(
    (idx: number, p: LineupPlayer) => {
      const next = [...data.subs];
      // if sub is set as captain, clear from starters too
      if (p.isCaptain) {
        const newPlayers = data.players.map((pl) => ({
          ...pl,
          isCaptain: false,
        }));
        const newSubs = [...data.subs];
        for (let i = 0; i < newSubs.length; i++)
          newSubs[i] = { ...newSubs[i], isCaptain: false };
        newSubs[idx] = p;
        onChange({ ...data, players: newPlayers, subs: newSubs });
        return;
      }
      next[idx] = p;
      onChange({ ...data, subs: next });
    },
    [data, onChange],
  );

  const addSub = () => {
    onChange({
      ...data,
      subs: [
        ...data.subs,
        {
          id: `sub-${Date.now()}`,
          name: "",
          number: null,
          position: "",
          x: 0,
          y: 0,
          isCaptain: false,
        } as LineupPlayer,
      ],
    });
  };

  const removeSub = (idx: number) => {
    onChange({ ...data, subs: data.subs.filter((_, i) => i !== idx) });
  };

  const applyFormation = (f: string) => {
    // preserve names/numbers when switching formation if counts match, else blank
    const newPositions = buildDefaultLineup(f);
    const merged = newPositions.map((slot, i) => ({
      ...slot,
      name: data.players[i]?.name ?? "",
      number: data.players[i]?.number ?? null,
      isCaptain: data.players[i]?.isCaptain ?? false,
    }));
    onChange({ ...data, formation: f, players: merged });
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

      {/* dot color palette */}
      <div>
        <div className="section-label">Player Dot Colour</div>
        <p className="help-text" style={{ marginBottom: 8 }}>
          Pick a shirt colour for today's kit. Overrides competition colour.
        </p>

        {/* saved swatches */}
        {dotColors.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 10,
            }}
          >
            {dotColors.map((color) => (
              <div key={color} style={{ position: "relative" }}>
                <button
                  title={`Select ${color}`}
                  onClick={() => selectDotColor(color)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: color,
                    border:
                      data.dotColor === color
                        ? "3px solid #fff"
                        : "2px solid rgba(255,255,255,0.15)",
                    cursor: "pointer",
                    boxShadow:
                      data.dotColor === color ? `0 0 0 2px ${color}` : "none",
                    transition: "all 0.15s",
                  }}
                />
                <button
                  title={`Remove ${color}`}
                  onClick={() => removeDotColor(color)}
                  style={{
                    position: "absolute",
                    top: -5,
                    right: -5,
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    color: "#fff",
                    fontSize: 9,
                    lineHeight: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            {data.dotColor && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => onChange({ ...data, dotColor: undefined })}
                style={{ fontSize: 11, alignSelf: "center" }}
                title="Use competition colour instead"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Add new colour */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            style={{
              width: 36,
              height: 32,
              padding: 2,
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 6,
              background: "transparent",
              cursor: "pointer",
            }}
          />
          <input
            className="input"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            placeholder="#C8102E"
            style={{ fontSize: 12, fontFamily: "var(--font-mono)", flex: 1 }}
            maxLength={7}
          />
          <button
            className="btn btn-ghost btn-sm"
            onClick={addDotColor}
            style={{ fontSize: 11, whiteSpace: "nowrap" }}
          >
            <Icons.Plus style={{ width: 11, height: 11 }} /> Save
          </button>
        </div>

        {data.dotColor && (
          <p
            className="help-text"
            style={{ marginTop: 6, color: "var(--accent)" }}
          >
            Using custom colour: {data.dotColor}
          </p>
        )}
      </div>

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
          Switching formation keeps names where possible. Press Tab or Enter to
          accept autocomplete suggestions.
        </p>
      </div>

      {/* Starting XI */}
      <div>
        <div className="section-label">Starting XI</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "36px 1fr 48px 28px 28px",
            gap: 5,
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
          <span
            style={{
              fontSize: 10,
              color: "var(--text-muted)",
              textAlign: "center",
            }}
            title="Captain"
          >
            C
          </span>
          <span />
        </div>
        {data.players.map((p, i) => (
          <PlayerRow
            key={p.id}
            player={p}
            onUpdate={(updated) => updatePlayer(i, updated)}
            showPosition
            savedPlayers={savedPlayers}
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
            gridTemplateColumns: "1fr 48px 28px auto",
            gap: 5,
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
          <span
            style={{
              fontSize: 10,
              color: "var(--text-muted)",
              textAlign: "center",
            }}
            title="Captain"
          >
            C
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
            savedPlayers={savedPlayers}
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
