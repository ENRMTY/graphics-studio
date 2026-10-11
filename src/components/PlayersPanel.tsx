import { useEffect, useState } from "react";
import { playersService } from "../services/playersService";
import { loadSavedPlayers, type SavedPlayer } from "../utils/storage";
import { useFileUpload } from "../hooks/useFileUpload";

function PhotoButton({
  player,
  onSaved,
}: {
  player: SavedPlayer;
  onSaved: (p: SavedPlayer) => void;
}) {
  const { open, inputProps } = useFileUpload((_url, file) => {
    playersService
      .uploadPhoto(player.name, file, {
        number: player.number,
        position: player.position,
      })
      .then(onSaved);
  });

  return (
    <>
      <button
        onClick={open}
        title="Upload headshot"
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          padding: 0,
          overflow: "hidden",
          border: "1.5px solid rgba(200,16,46,0.85)",
          background: "#141414",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        {player.photoUrl ? (
          <img
            src={player.photoUrl}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ color: "#C8102E", fontSize: 16 }}>+</span>
        )}
      </button>
      <input {...inputProps} />
    </>
  );
}

export function PlayersPanel() {
  const [players, setPlayers] = useState<SavedPlayer[]>([]);

  useEffect(() => {
    setPlayers(loadSavedPlayers());
    playersService
      .getAll()
      .then(setPlayers)
      .catch(() => {
        setPlayers(loadSavedPlayers());
      });
  }, []);

  const replace = (saved: SavedPlayer) => {
    setPlayers((prev) => {
      const rest = prev.filter(
        (p) => p.name.toLowerCase() !== saved.name.toLowerCase(),
      );
      return [saved, ...rest];
    });
  };

  return (
    <div>
      <div className="section-label">Players</div>
      <p className="help-text" style={{ marginBottom: 12 }}>
        Headshots saved here are used automatically when that player is added to
        a lineup. Uploads still work if the server is offline.
      </p>
      {players.length === 0 && (
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
          No saved players yet. Add names on a lineup and they will show up
          here.
        </p>
      )}
      {players.map((p) => (
        <div
          key={p.name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 8,
          }}
        >
          <PhotoButton player={p} onSaved={replace} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13 }}>{p.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {[p.number !== null ? `#${p.number}` : null, p.position]
                .filter(Boolean)
                .join(" · ") || "No number yet"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
