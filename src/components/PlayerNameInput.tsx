import {
  useEffect,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import type { SavedPlayer } from "../utils/storage";

/** "a" matches "á". Combining marks are stripped before compare. */
export function foldName(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function surnameMatch(full: string, query: string): boolean {
  const q = foldName(query.trim());
  if (!q) return false;
  const parts = foldName(full).split(/\s+/).filter(Boolean);
  for (let i = 1; i < parts.length; i++) {
    if (parts.slice(i).join(" ").startsWith(q)) return true;
  }
  return false;
}

function ghostFor(name: string, typed: string): string {
  if (foldName(name).startsWith(foldName(typed))) return ghostRest(name, typed);
  const parts = name.trim().split(/\s+/);
  const q = foldName(typed);
  for (let i = 1; i < parts.length; i++) {
    const suffix = parts.slice(i).join(" ");
    if (foldName(suffix).startsWith(q)) return ghostRest(suffix, typed);
  }
  return "";
}

function ghostRest(name: string, typed: string): string {
  const target = foldName(typed);
  let acc = "";
  const chars = Array.from(name);
  let i = 0;
  while (i < chars.length && acc.length < target.length) {
    const piece = foldName(chars[i]);
    i += 1;
    if (!piece) continue;
    acc += piece;
  }
  return chars.slice(i).join("");
}

export function PlayerNameInput({
  value,
  onChange,
  savedPlayers,
  placeholder = "Player name",
  field = false,
}: {
  value: string;
  onChange: (name: string, suggestion?: SavedPlayer) => void;
  savedPlayers: SavedPlayer[];
  placeholder?: string;
  /** Match a normal form input. Lineup rows stay compact. */
  field?: boolean;
}) {
  const [ghost, setGhost] = useState("");
  const [activeSuggestion, setActiveSuggestion] = useState<SavedPlayer | null>(
    null,
  );
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!value.trim()) {
      setGhost("");
      setActiveSuggestion(null);
      return;
    }
    const folded = foldName(value);
    const prefix = savedPlayers.find((p) =>
      foldName(p.name).startsWith(folded),
    );
    const match =
      prefix ?? savedPlayers.find((p) => surnameMatch(p.name, value));
    const rest = match ? ghostFor(match.name, value) : "";
    if (match && rest) {
      setGhost(rest);
      setActiveSuggestion(match);
    } else if (match && match.name !== value) {
      setGhost("");
      setActiveSuggestion(match);
    } else {
      setGhost("");
      setActiveSuggestion(null);
    }
  }, [value, savedPlayers]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Tab" || e.key === "Enter") && activeSuggestion) {
      e.preventDefault();
      onChange(activeSuggestion.name, activeSuggestion);
      setGhost("");
      setActiveSuggestion(null);
    }
  };

  const pad = field ? "9px 12px" : "4px 8px";
  const fontSize = field ? 13 : 12;

  return (
    <div
      style={{
        position: "relative",
        flex: 1,
        minWidth: 0,
        ...(field
          ? {
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderColor: focused ? "var(--red)" : "var(--border)",
              borderRadius: "var(--radius)",
            }
          : {}),
      }}
    >
      {ghost && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            padding: pad,
            fontSize,
            fontFamily: "var(--font-body)",
            pointerEvents: "none",
            color: "transparent",
            whiteSpace: "pre",
            overflow: "hidden",
          }}
        >
          <span style={{ visibility: "hidden" }}>{value}</span>
          <span style={{ color: "rgba(255,255,255,0.28)" }}>{ghost}</span>
        </div>
      )}
      <input
        className={field ? undefined : "input"}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        style={{
          padding: pad,
          fontSize,
          width: "100%",
          background: "transparent",
          border: field ? "none" : undefined,
          color: "var(--text)",
          fontFamily: "var(--font-body)",
          outline: "none",
          position: "relative",
          zIndex: 1,
        }}
      />
    </div>
  );
}
