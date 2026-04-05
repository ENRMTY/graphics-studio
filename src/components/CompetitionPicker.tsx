import React, { useState, useRef } from "react";
import type { Competition } from "@types";
import { Icons } from "./Icons";

interface Props {
  competitions: Competition[];
  selected: string;
  selectedIcon: string | null;
  selectedColor: string;
  onSelect: (name: string, icon: string | null, color: string) => void;
  onCompetitionsChange: (comps: Competition[]) => void;
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

export function CompetitionPicker({
  competitions,
  selected,
  selectedIcon,
  selectedColor,
  onSelect,
  onCompetitionsChange,
}: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState<string | null>(null);
  const [newColor, setNewColor] = useState("#C8102E");
  const [editId, setEditId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setNewIcon(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) {
      return;
    }
    if (editId) {
      onCompetitionsChange(
        competitions.map((c) =>
          c.id === editId ? { ...c, name, icon: newIcon, color: newColor } : c,
        ),
      );
      if (selected === competitions.find((c) => c.id === editId)?.name) {
        onSelect(name, newIcon, newColor);
      }
    } else {
      const nc: Competition = {
        id: Date.now().toString(),
        name,
        icon: newIcon,
        color: newColor,
      };
      onCompetitionsChange([...competitions, nc]);
    }
    setAddOpen(false);
    setEditId(null);
    setNewName("");
    setNewIcon(null);
    setNewColor("#C8102E");
  };

  const startEdit = (c: Competition) => {
    setEditId(c.id);
    setNewName(c.name);
    setNewIcon(c.icon);
    setNewColor(c.color);
    setAddOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onCompetitionsChange(competitions.filter((c) => c.id !== id));
  };

  return (
    <div>
      <div className="section-label">Competition</div>
      <div className="competition-grid">
        {competitions.map((c) => (
          <div
            key={c.id}
            className={`comp-chip ${selected === c.name ? "active" : ""}`}
            style={
              selected === c.name
                ? {
                    borderColor: c.color,
                    background: c.color + "22",
                    color: c.color,
                  }
                : {}
            }
            onClick={() =>
              onSelect(
                selected === c.name ? "" : c.name,
                selected === c.name ? null : c.icon,
                selected === c.name ? "" : c.color,
              )
            }
          >
            {c.icon && (
              <img
                src={c.icon}
                alt=""
                style={{
                  width: 14,
                  height: 14,
                  objectFit: "contain",
                  flexShrink: 0,
                }}
              />
            )}
            <span className="comp-chip-name">{c.name}</span>
            <span
              className="comp-chip-edit"
              onClick={(e) => {
                e.stopPropagation();
                startEdit(c);
              }}
              title="Edit"
            >
              <Icons.Edit style={{ width: 10, height: 10 }} />
            </span>
            <span
              className="comp-chip-delete"
              onClick={(e) => handleDelete(c.id, e)}
              title="Delete"
            >
              <Icons.X style={{ width: 10, height: 10 }} />
            </span>
          </div>
        ))}
        <button
          className="comp-add-btn"
          onClick={() => {
            setAddOpen(true);
            setEditId(null);
            setNewName("");
            setNewIcon(null);
            setNewColor("#C8102E");
          }}
        >
          <Icons.Plus style={{ width: 12, height: 12 }} /> Add
        </button>
      </div>

      {/* Custom competition name override */}
      <input
        className="input mt-2"
        placeholder="Or type custom competition name…"
        value={selected}
        onChange={(e) => onSelect(e.target.value, selectedIcon, selectedColor)}
        style={{ fontSize: 12 }}
      />

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
                placeholder="e.g. Super Cup"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Icon (optional)</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleIconUpload}
              />
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {newIcon && (
                  <img
                    src={newIcon}
                    alt=""
                    style={{
                      width: 36,
                      height: 36,
                      objectFit: "contain",
                      background: "var(--surface3)",
                      borderRadius: 6,
                      border: "1px solid var(--border)",
                      padding: 3,
                    }}
                  />
                )}
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => fileRef.current?.click()}
                >
                  <Icons.Upload style={{ width: 12, height: 12 }} />
                  {newIcon ? "Replace Icon" : "Upload Icon"}
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
            </div>

            <div className="form-group">
              <label className="form-label">Accent Colour</label>
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                {PRESET_COLORS.map((col) => (
                  <button
                    key={col}
                    onClick={() => setNewColor(col)}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: col,
                      border:
                        newColor === col
                          ? "2px solid white"
                          : "2px solid transparent",
                      cursor: "pointer",
                      outline: "none",
                      boxShadow: newColor === col ? `0 0 0 2px ${col}` : "none",
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    border: "none",
                    cursor: "pointer",
                    background: "none",
                    padding: 0,
                  }}
                  title="Custom colour"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setAddOpen(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAdd}>
                {editId ? "Save Changes" : "Add Competition"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
