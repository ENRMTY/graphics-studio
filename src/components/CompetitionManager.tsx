import React, { useState } from "react";
import type { Competition } from "../types";
import { Icons } from "./Icons";
import { useFileUpload } from "../hooks/useFileUpload";

interface Props {
  competitions: Competition[];
  onUpdate: (comps: Competition[]) => void;
}

const PRESET_COLORS = [
  "#C8102E",
  "#3d195b",
  "#001489",
  "#00A550",
  "#F57F17",
  "#0070B8",
  "#D4AF37",
  "#555558",
];

export function CompetitionManager({ competitions, onUpdate }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState<string | null>(null);
  const [newColor, setNewColor] = useState("#C8102E");

  const iconUpload = useFileUpload((url) => setNewIcon(url));

  const openAdd = () => {
    setEditId(null);
    setNewName("");
    setNewIcon(null);
    setNewColor("#C8102E");
    setAddOpen(true);
  };

  const openEdit = (c: Competition) => {
    setEditId(c.id);
    setNewName(c.name);
    setNewIcon(c.icon);
    setNewColor(c.color);
    setAddOpen(true);
  };

  const handleSave = () => {
    const name = newName.trim();
    if (!name) return;
    if (editId) {
      onUpdate(
        competitions.map((c) =>
          c.id === editId ? { ...c, name, icon: newIcon, color: newColor } : c,
        ),
      );
    } else {
      onUpdate([
        ...competitions,
        { id: Date.now().toString(), name, icon: newIcon, color: newColor },
      ]);
    }
    setAddOpen(false);
    setEditId(null);
    setNewName("");
    setNewIcon(null);
    setNewColor("#C8102E");
  };

  return (
    <div className="team-manager">
      <div className="team-manager-header">
        <div>
          <h2>Competition Library</h2>
          <p className="help-text" style={{ marginTop: 2 }}>
            {competitions.length} competitions
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Icons.Plus style={{ width: 13, height: 13 }} /> Add
        </button>
      </div>

      <div className="comp-manager-grid">
        {competitions.map((c) => (
          <div className="comp-manager-card" key={c.id}>
            <div
              className="comp-manager-accent"
              style={{ background: c.color }}
            />
            <div className="comp-manager-icon">
              {c.icon ? (
                <img src={c.icon} alt={c.name} />
              ) : (
                <Icons.Comps
                  style={{ width: 22, height: 22, color: c.color }}
                />
              )}
            </div>
            <div className="comp-manager-name">{c.name}</div>
            <div className="comp-manager-color">
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: c.color,
                  display: "inline-block",
                  marginRight: 5,
                }}
              />
              {c.color}
            </div>
            <div className="team-card-actions">
              <button className="btn btn-icon" onClick={() => openEdit(c)}>
                <Icons.Edit style={{ width: 11, height: 11 }} />
              </button>
              <button
                className="btn btn-icon danger"
                onClick={() =>
                  onUpdate(competitions.filter((x) => x.id !== c.id))
                }
              >
                <Icons.Trash style={{ width: 11, height: 11 }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {addOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setAddOpen(false)}
        >
          <div className="modal">
            <h3>{editId ? "Edit Competition" : "Add Competition"}</h3>

            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                className="input"
                placeholder="e.g. Club World Cup"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Icon (optional)</label>
              <input {...iconUpload.inputProps} />
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {newIcon && (
                  <img
                    src={newIcon}
                    alt=""
                    style={{
                      width: 40,
                      height: 40,
                      objectFit: "contain",
                      background: "var(--surface3)",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      padding: 4,
                    }}
                  />
                )}
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={iconUpload.open}
                >
                  <Icons.Upload style={{ width: 12, height: 12 }} />
                  {newIcon ? "Replace" : "Upload Icon"}
                </button>
                {newIcon && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setNewIcon(null)}
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="help-text" style={{ marginTop: 6 }}>
                PNG with transparency works best. Will appear on the graphic
                next to the competition name.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Accent Colour</label>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                {PRESET_COLORS.map((col) => (
                  <button
                    key={col}
                    onClick={() => setNewColor(col)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: col,
                      border:
                        newColor === col
                          ? "3px solid white"
                          : "2px solid transparent",
                      cursor: "pointer",
                      outline: "none",
                      boxShadow: newColor === col ? `0 0 0 2px ${col}` : "none",
                      transition: "all 0.15s",
                    }}
                  />
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      background: "none",
                    }}
                    title="Custom colour"
                  />
                  <span className="help-text">{newColor}</span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setAddOpen(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editId ? "Save Changes" : "Add Competition"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
