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
          width: 72,
          height: 72,
          borderRadius: "50%",
          padding: 0,
          overflow: "hidden",
          border: "2px solid rgba(200,16,46,0.85)",
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
          <span style={{ color: "#C8102E", fontSize: 28 }}>+</span>
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
    <div className="team-manager">
      <div className="team-manager-header">
        <div>
          <h2>Players</h2>
          <p className="help-text">
            Headshots saved here are used when that player is added to a lineup.
            Uploads still work if the server is offline.
          </p>
        </div>
      </div>
      {players.length === 0 && (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          No saved players yet. Add names on a lineup and they will show up
          here.
        </p>
      )}
      <div className="team-grid">
        {players.map((p) => (
          <div className="team-card" key={p.name}>
            <PhotoButton player={p} onSaved={replace} />
            <div className="team-card-name">{p.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {[p.number !== null ? `#${p.number}` : null, p.position]
                .filter(Boolean)
                .join(" · ") || "No number yet"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
