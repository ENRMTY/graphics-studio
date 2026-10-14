import React, { useState } from "react";
import type { ViewMode } from "@types";
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
  { id: "lineup", label: "Lineup", Icon: Icons.Lineup, section: "create" },
  { id: "stats", label: "Player Stats", Icon: Icons.Stats, section: "create" },
  { id: "quote", label: "Quote", Icon: Icons.Quote, section: "create" },
  { id: "news", label: "Breaking", Icon: Icons.News, section: "create" },
  {
    id: "transfer",
    label: "Transfer",
    Icon: Icons.Transfer,
    section: "create",
  },
  { id: "teams", label: "Teams", Icon: Icons.Teams, section: "library" },
  { id: "players", label: "Players", Icon: Icons.User, section: "library" },
  { id: "comps", label: "Competitions", Icon: Icons.Comps, section: "library" },
];

export function Sidebar({
  view,
  onViewChange,
  teamCount,
  onSignInClick,
}: Props) {
  const { user, logout } = useAuth();
  // mobile only: the sidebar becomes a slide-in drawer (no effect on desktop)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = () => setDrawerOpen(false);
  const handleNav = (id: ViewMode) => {
    onViewChange(id);
    closeDrawer();
  };
  const currentLabel = NAV_ITEMS.find((n) => n.id === view)?.label ?? "";
  const createItems = NAV_ITEMS.filter((n) => n.section === "create");
  const libraryItems = NAV_ITEMS.filter((n) => n.section === "library");

  return (
    <>
      {/* mobile top bar - hidden on desktop via CSS */}
      <header className="mobile-bar">
        <img src={logoIcon} alt="LFC Studio" className="mobile-bar-logo" />
        <div className="mobile-bar-title">{currentLabel}</div>
        <button
          className="mobile-menu-btn"
          aria-label="Open menu"
          onClick={() => setDrawerOpen(true)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            width={20}
            height={20}
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </header>
      <div
        className={`mobile-backdrop ${drawerOpen ? "open" : ""}`}
        onClick={closeDrawer}
      />
      <aside className={`sidebar ${drawerOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <img src={logoIcon} alt="LFC Studio" className="sidebar-logo" />
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Create</div>
          {createItems.map(({ id, label, Icon }) => (
            <div
              key={id}
              className={`nav-item ${view === id ? "active" : ""}`}
              onClick={() => handleNav(id as ViewMode)}
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
              onClick={() => handleNav(id as ViewMode)}
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
              onClick={() => {
                closeDrawer();
                onSignInClick();
              }}
            >
              <Icons.User style={{ width: 14, height: 14 }} />
              Sign In
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
