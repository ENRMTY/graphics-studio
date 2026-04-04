import React from "react";
import type { ViewMode } from "../types";
import { Icons } from "./Icons";
import logoIcon from "../assets/icon.png";
import { useAuth } from "../context/AuthContext";

interface Props {
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  teamCount: number;
  onSignInClick: () => void;
}

interface NavItem {
  id: ViewMode;
  label: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  section: "create" | "library";
}

const NAV_ITEMS: NavItem[] = [
  { id: "ft", label: "Full Time", Icon: Icons.FT, section: "create" },
  { id: "ht", label: "Half Time", Icon: Icons.HT, section: "create" },
  { id: "md", label: "Match Day", Icon: Icons.MD, section: "create" },
  { id: "stats", label: "Player Stats", Icon: Icons.Stats, section: "create" },
  { id: "quote", label: "Quote", Icon: Icons.Quote, section: "create" },
  { id: "teams", label: "Teams", Icon: Icons.Teams, section: "library" },
  { id: "comps", label: "Competitions", Icon: Icons.Comps, section: "library" },
];

export function Sidebar({
  view,
  onViewChange,
  teamCount,
  onSignInClick,
}: Props) {
  const { user, logout } = useAuth();
  const createItems = NAV_ITEMS.filter((n) => n.section === "create");
  const libraryItems = NAV_ITEMS.filter((n) => n.section === "library");

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src={logoIcon} alt="LFC Studio" className="sidebar-logo" />
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Create</div>
        {createItems.map(({ id, label, Icon }) => (
          <div
            key={id}
            className={`nav-item ${view === id ? "active" : ""}`}
            onClick={() => onViewChange(id as ViewMode)}
          >
            <Icon style={{ width: 16, height: 16 }} />
            {label}
          </div>
        ))}

        <div className="nav-divider" />

        <div className="nav-section-label">Library</div>
        {libraryItems.map(({ id, label, Icon }) => (
          <div
            key={id}
            className={`nav-item ${view === id ? "active" : ""}`}
            onClick={() => onViewChange(id as ViewMode)}
          >
            <Icon style={{ width: 16, height: 16 }} />
            {label}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div
          className="team-count-wrapper"
          style={{
            borderBottom: "1px solid var(--border)",
            paddingBottom: "0.2rem",
            marginBottom: "0.5rem",
          }}
        >
          <div className="team-count-badge">{teamCount} teams saved</div>
        </div>
        {user ? (
          <div className="sidebar-user">
            <div className="sidebar-user-info">
              <div className="sidebar-user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="sidebar-user-name">{user.name}</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={logout}>
              Log out
            </button>
          </div>
        ) : (
          <button
            className="btn btn-ghost sidebar-signin-btn"
            onClick={onSignInClick}
          >
            <Icons.User style={{ width: 14, height: 14 }} />
            Sign In
          </button>
        )}
      </div>
    </aside>
  );
}
