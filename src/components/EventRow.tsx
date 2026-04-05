import React from "react";
import type { MatchEvent, EventSide } from "@types";
import { Icons } from "./Icons";

interface Props {
  event: MatchEvent;
  onChange: (ev: MatchEvent) => void;
  onDelete: () => void;
}

const BADGE: Record<MatchEvent["type"], { label: string; cls: string }> = {
  goal: { label: "⚽ Goal", cls: "badge-goal" },
  penalty: { label: "⚽ Pen", cls: "badge-pen" },
  red: { label: "🟥 Red", cls: "badge-red" },
  og: { label: "⚽ OG", cls: "badge-og" },
};

export function EventRow({ event, onChange, onDelete }: Props) {
  const { label, cls } = BADGE[event.type];

  return (
    <div className="event-block">
      <div className="event-row">
        <span className={`event-type-badge ${cls}`}>{label}</span>
        <input
          className="input event-input"
          placeholder="Player name"
          value={event.player}
          onChange={(e) => onChange({ ...event, player: e.target.value })}
        />
        <input
          className="input event-min-input"
          placeholder="00'"
          value={event.minute}
          onChange={(e) => onChange({ ...event, minute: e.target.value })}
        />
        <button className="btn btn-icon danger" onClick={onDelete}>
          <Icons.X style={{ width: 12, height: 12 }} />
        </button>
      </div>
      <div className="event-side-row">
        <span className="help-text">Side:</span>
        {(["home", "away"] as EventSide[]).map((s) => (
          <span
            key={s}
            className={`side-chip ${event.side === s ? "active" : ""}`}
            onClick={() => onChange({ ...event, side: s })}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </span>
        ))}
      </div>
    </div>
  );
}
