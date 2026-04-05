import { useState } from "react";
import type { Team } from "@types";
import { Icons } from "./Icons";
import { useFileUpload } from "../hooks/useFileUpload";
import { teamsService } from "../services/teamsService";

interface Props {
  teams: Team[];
  onUpdate: (teams: Team[]) => void;
}

export function TeamManager({ teams, onUpdate }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLogo, setNewLogo] = useState<string | null>(null);
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logoUpload = useFileUpload((url, file) => {
    setNewLogo(url);
    setNewLogoFile(file);
  });

  const filtered = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditId(null);
    setNewName("");
    setNewLogo(null);
    setNewLogoFile(null);
    setError(null);
    setAddOpen(true);
  };

  const openEdit = (t: Team) => {
    setEditId(t.id);
    setNewName(t.name);
    setNewLogo(t.logo);
    setNewLogoFile(null);
    setError(null);
    setAddOpen(true);
  };

  const handleSave = async () => {
    const name = newName.trim();
    if (!name) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editId) {
        const updated = await teamsService.update(
          editId,
          name,
          newLogoFile ?? undefined,
        );
        onUpdate(teams.map((t) => (t.id === editId ? updated : t)));
      } else {
        const created = await teamsService.create(
          name,
          newLogoFile ?? undefined,
        );
        onUpdate([...teams, created]);
      }
      setAddOpen(false);
      setNewName("");
      setNewLogo(null);
      setNewLogoFile(null);
      setEditId(null);
    } catch (err: any) {
      setError(err?.message ?? "Failed to save team");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await teamsService.delete(id);
      onUpdate(teams.filter((t) => t.id !== id));
    } catch (err: any) {
      console.error("Delete team failed:", err);
    }
  };

  return (
    <div className="team-manager">
      <div className="team-manager-header">
        <div>
          <h2>Team Library</h2>
          <p className="help-text" style={{ marginTop: 2 }}>
            {teams.length} teams saved
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Icons.Plus style={{ width: 13, height: 13 }} /> Add Team
        </button>
      </div>

      <div className="input-row" style={{ marginBottom: 16 }}>
        <Icons.Search
          style={{
            width: 14,
            height: 14,
            color: "var(--text-muted)",
            flexShrink: 0,
          }}
        />
        <input
          className="input"
          placeholder="Search teams…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <Icons.Ball
            style={{
              width: 32,
              height: 32,
              margin: "0 auto 8px",
              display: "block",
              opacity: 0.3,
            }}
          />
          <p>
            {teams.length === 0
              ? "No teams yet. Add your first team."
              : "No teams match your search."}
          </p>
        </div>
      )}

      <div className="team-grid">
        {filtered.map((t) => (
          <div className="team-card" key={t.id}>
            <div className="team-card-logo">
              {t.logo ? (
                <img src={t.logo} alt={t.name} />
              ) : (
                <Icons.Ball
                  style={{ width: 24, height: 24, color: "var(--text-muted)" }}
                />
              )}
            </div>
            <div className="team-card-name">{t.name}</div>
            <div className="team-card-actions">
              <button className="btn btn-icon" onClick={() => openEdit(t)}>
                <Icons.Edit style={{ width: 11, height: 11 }} />
              </button>
              <button
                className="btn btn-icon danger"
                onClick={() => handleDelete(t.id)}
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
            <h3>{editId ? "Edit Team" : "Add New Team"}</h3>
            <div className="form-group">
              <label className="form-label">Team Name</label>
              <input
                className="input"
                placeholder="e.g. Manchester City"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Logo</label>
              <input {...logoUpload.inputProps} />
              {newLogo ? (
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <img
                    src={newLogo}
                    alt=""
                    style={{
                      width: 48,
                      height: 48,
                      objectFit: "contain",
                      borderRadius: "50%",
                      background: "var(--surface3)",
                      border: "1px solid var(--border)",
                    }}
                  />
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={logoUpload.open}
                  >
                    Replace
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setNewLogo(null);
                      setNewLogoFile(null);
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="upload-zone" onClick={logoUpload.open}>
                  <Icons.Upload style={{ width: 18, height: 18 }} />
                  <span>Upload logo</span>
                  <p>PNG with transparency recommended</p>
                </div>
              )}
            </div>
            {error && (
              <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 8 }}>
                {error}
              </p>
            )}
            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setAddOpen(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving…" : editId ? "Save Changes" : "Add Team"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
