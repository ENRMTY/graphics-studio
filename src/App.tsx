import React, { useState, useRef, useCallback } from "react";
import Konva from "konva";
import type {
  ViewMode,
  FullTimeData,
  MatchdayData,
  Team,
  Competition,
} from "./types";
import {
  loadTeams,
  saveTeams,
  loadCompetitions,
  saveCompetitions,
} from "./utils/storage";
import { Sidebar } from "./components/Sidebar";
import { FullTimePanel } from "./components/FullTimePanel";
import { MatchdayPanel } from "./components/MatchdayPanel";
import { TeamManager } from "./components/TeamManager";
import { CompetitionManager } from "./components/CompetitionManager";
import { Canvas } from "./components/Canvas";
import { Icons } from "./components/Icons";

const DEFAULT_FT: FullTimeData = {
  type: "fulltime",
  bgImage: null,
  competition: "",
  competitionIcon: null,
  competitionColor: "",
  homeTeam: null,
  awayTeam: null,
  homeScore: 0,
  awayScore: 0,
  events: [],
};

const DEFAULT_MD: MatchdayData = {
  type: "matchday",
  bgImage: null,
  competition: "",
  competitionIcon: null,
  competitionColor: "",
  homeTeam: null,
  awayTeam: null,
  matchDate: "",
  kickoffTime: "",
  venue: "",
};

export default function App() {
  const [view, setView] = useState<ViewMode>("ft");
  const [teams, setTeams] = useState<Team[]>(loadTeams);
  const [competitions, setCompetitions] =
    useState<Competition[]>(loadCompetitions);
  const [ftData, setFtData] = useState<FullTimeData>(DEFAULT_FT);
  const [mdData, setMdData] = useState<MatchdayData>(DEFAULT_MD);
  const [exporting, setExporting] = useState(false);

  const ftStageRef = useRef<Konva.Stage | null>(null);
  const mdStageRef = useRef<Konva.Stage | null>(null);

  const handleTeamsUpdate = useCallback((updated: Team[]) => {
    setTeams(updated);
    saveTeams(updated);
  }, []);

  const handleTeamSave = useCallback((team: Team) => {
    setTeams((prev) => {
      if (prev.some((t) => t.id === team.id)) return prev;
      const updated = [...prev, team];
      saveTeams(updated);
      return updated;
    });
  }, []);

  const handleCompetitionsUpdate = useCallback((updated: Competition[]) => {
    setCompetitions(updated);
    saveCompetitions(updated);
  }, []);

  const activeStageRef = view === "ft" ? ftStageRef : mdStageRef;

  const handleExport = async () => {
    const stage = activeStageRef.current;
    if (!stage || exporting) return;
    setExporting(true);
    try {
      // Scale up to full 1080×1080 for export
      const FULL = 1080;
      const prev = {
        w: stage.width(),
        h: stage.height(),
        sx: stage.scaleX(),
        sy: stage.scaleY(),
      };
      stage.size({ width: FULL, height: FULL });
      stage.scale({ x: 1, y: 1 });
      stage.draw();

      const dataURL = stage.toDataURL({ pixelRatio: 1, mimeType: "image/png" });

      // Restore
      stage.size({ width: prev.w, height: prev.h });
      stage.scale({ x: prev.sx, y: prev.sy });
      stage.draw();

      const link = document.createElement("a");
      link.download = `lfc-${view === "ft" ? "fulltime" : "matchday"}-${Date.now()}.png`;
      link.href = dataURL;
      link.click();
    } finally {
      setExporting(false);
    }
  };

  const isCanvas = view === "ft" || view === "md";
  const activeData = view === "ft" ? ftData : mdData;

  return (
    <div className="app">
      <Sidebar view={view} onViewChange={setView} teamCount={teams.length} />

      <div className="main">
        {/* ── Library views ── */}
        {view === "teams" && (
          <TeamManager teams={teams} onUpdate={handleTeamsUpdate} />
        )}
        {view === "comps" && (
          <CompetitionManager
            competitions={competitions}
            onUpdate={handleCompetitionsUpdate}
          />
        )}

        {/* ── Creator views ── */}
        {isCanvas && (
          <>
            {/* Left panel */}
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2>{view === "ft" ? "Full Time Result" : "Match Day"}</h2>
                  <p>
                    {view === "ft"
                      ? "Configure scoreline & events"
                      : "Configure upcoming match"}
                  </p>
                </div>
              </div>

              {view === "ft" ? (
                <FullTimePanel
                  data={ftData}
                  onChange={setFtData}
                  teams={teams}
                  competitions={competitions}
                  onTeamSave={handleTeamSave}
                  onCompetitionsChange={handleCompetitionsUpdate}
                />
              ) : (
                <MatchdayPanel
                  data={mdData}
                  onChange={setMdData}
                  teams={teams}
                  competitions={competitions}
                  onTeamSave={handleTeamSave}
                  onCompetitionsChange={handleCompetitionsUpdate}
                />
              )}
            </div>

            {/* Canvas area */}
            <div className="canvas-area">
              <div className="canvas-toolbar">
                <div className="canvas-toolbar-left">
                  <div className="status-dot" />
                  <span className="status-label">
                    Live Preview · 1080 × 1080
                  </span>
                </div>
                <div className="canvas-toolbar-right">
                  <button
                    className={`btn btn-export ${exporting ? "exporting" : ""}`}
                    onClick={handleExport}
                    disabled={exporting}
                  >
                    <Icons.Export style={{ width: 14, height: 14 }} />
                    {exporting ? "Exporting…" : "Export PNG"}
                  </button>
                </div>
              </div>

              <div className="canvas-wrapper">
                <div className="canvas-frame">
                  {/* Both canvases stay mounted so state is preserved when switching tabs */}
                  <div style={{ display: view === "ft" ? "block" : "none" }}>
                    <Canvas data={ftData} stageRef={ftStageRef} />
                  </div>
                  <div style={{ display: view === "md" ? "block" : "none" }}>
                    <Canvas data={mdData} stageRef={mdStageRef} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
