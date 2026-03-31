import React, { useState, useRef } from "react";
import type { Team } from "../types";
import { Icons } from "./Icons";

interface Props {
  label: string;
  value: Team | null;
  onChange: (team: Team) => void;
  teams: Team[];
  onNewTeamSave: (team: Team) => void;
}

export function TeamPicker({
  label,
  value,
  onChange,
  teams,
  onNewTeamSave,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [newLogo, setNewLogo] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setNewLogo(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSaveNew = () => {
    const name = newName.trim();
    if (!name) {
      return;
    }
    const team: Team = { id: Date.now().toString(), name, logo: newLogo };
    onNewTeamSave(team);
    onChange(team);
    setOpen(false);
    setNewName("");
    setNewLogo(null);
    setSearch("");
  };

  const handleSelect = (team: Team) => {
    onChange(team);
    setOpen(false);
    setSearch("");
  };

  return (
    <div>
      <div className="section-label">{label}</div>
      <div className="team-picker">
        <div className="team-picker-inner">
          <div className="team-logo-preview">
            {value?.logo ? (
              <img src={value.logo} alt={value.name} />
            ) : (
              <Icons.Ball
                style={{ width: 20, height: 20, color: "var(--text-muted)" }}
              />
            )}
          </div>
          <div className="team-info">
            <div className="team-name-display">
              {value?.name ?? "No team selected"}
            </div>
            <div className="team-sub">Click to select or add</div>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "Close" : "Select"}
          </button>
        </div>

        {open && (
          <div className="team-search-dropdown">
            <div className="team-search-input-wrap">
              <Icons.Search
                style={{
                  width: 14,
                  height: 14,
                  flexShrink: 0,
                  color: "var(--text-muted)",
                }}
              />
              <input
                className="inline-search"
                placeholder="Search saved teams…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>

            <div className="team-results-list">
              {filtered.length === 0 && (
                <div className="no-results">No saved teams found</div>
              )}
              {filtered.map((t) => (
                <div
                  key={t.id}
                  className="team-result"
                  onClick={() => handleSelect(t)}
                >
                  <div className="team-result-logo">
                    {t.logo ? (
                      <img src={t.logo} alt={t.name} />
                    ) : (
                      <Icons.Ball style={{ width: 14, height: 14 }} />
                    )}
                  </div>
                  {t.name}
                </div>
              ))}
            </div>

            <div className="new-team-section">
              <div className="section-label" style={{ margin: 0 }}>
                Add new team
              </div>
              <input
                className="input input-sm"
                placeholder="Team name…"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveNew()}
              />
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleLogoUpload}
              />
              <div style={{ display: "flex", gap: 6 }}>
                {newLogo && (
                  <img
                    src={newLogo}
                    alt=""
                    style={{
                      width: 30,
                      height: 30,
                      objectFit: "contain",
                      borderRadius: "50%",
                      background: "var(--surface3)",
                      border: "1px solid var(--border)",
                      flexShrink: 0,
                    }}
                  />
                )}
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => fileRef.current?.click()}
                >
                  <Icons.Upload style={{ width: 12, height: 12 }} /> Logo
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                  onClick={handleSaveNew}
                >
                  Save & Use
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
