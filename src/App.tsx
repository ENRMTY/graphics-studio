// external
import { useState, useRef, useCallback, useEffect } from "react";
import Konva from "konva";

// types
import type {
  ViewMode,
  FullTimeData,
  MatchdayData,
  Team,
  Competition,
} from "./types";

// services
import { teamsService } from "./services/teamsService";
import { competitionsService } from "./services/competitionsService";
import {
  graphicsService,
  apiGraphicToFT,
  apiGraphicToMD,
} from "./services/graphicsService";

// components
import { Sidebar } from "./components/Sidebar";
import { FullTimePanel } from "./components/FullTimePanel";
import { MatchdayPanel } from "./components/MatchdayPanel";
import { TeamManager } from "./components/TeamManager";
import { CompetitionManager } from "./components/CompetitionManager";
import { Canvas } from "./components/Canvas";
import { Icons } from "./components/Icons";

// utils
import { saveCompetitions } from "./utils/storage";
import { saveTeams } from "./utils/storage";
import "./utils/storageMigration";

// constants
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

const DEFAULT_HT: FullTimeData = {
  type: "halftime",
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
  const [teams, setTeams] = useState<Team[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [ftData, setFtData] = useState<FullTimeData>(DEFAULT_FT);
  const [htData, setHtData] = useState<FullTimeData>(DEFAULT_HT);
  const [mdData, setMdData] = useState<MatchdayData>(DEFAULT_MD);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [exporting, setExporting] = useState(false);

  const ftStageRef = useRef<Konva.Stage | null>(null);
  const htStageRef = useRef<Konva.Stage | null>(null);
  const mdStageRef = useRef<Konva.Stage | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ftRef = useRef(ftData);
  const htRef = useRef(htData);
  const mdRef = useRef(mdData);
  ftRef.current = ftData;
  htRef.current = htData;
  mdRef.current = mdData;

  // initial load
  useEffect(() => {
    async function bootstrap() {
      try {
        const [teamsData, compsData, drafts] = await Promise.all([
          teamsService.getAll(),
          competitionsService.getAll(),
          graphicsService.getLatestDrafts(),
        ]);
        setTeams(teamsData);
        setCompetitions(compsData);
        if (drafts.fulltime)
          setFtData(apiGraphicToFT(drafts.fulltime) as FullTimeData);
        if (drafts.halftime)
          setHtData(apiGraphicToFT(drafts.halftime) as FullTimeData);
        if (drafts.matchday)
          setMdData(apiGraphicToMD(drafts.matchday) as MatchdayData);
      } catch (err) {
        console.error("Bootstrap error:", err);
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  // auto-save debounced 1.5 s
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaveStatus("saving");
    autoSaveTimer.current = setTimeout(async () => {
      const ft = ftRef.current;
      const ht = htRef.current;
      const md = mdRef.current;
      try {
        const ftResult = await graphicsService.saveFTDraft(ft, ft._id);
        if (ft.bgImageFile) {
          await graphicsService.uploadFTBackground(ftResult.id, ft.bgImageFile);
          setFtData((p) => ({
            ...p,
            _id: ftResult.id,
            bgImageFile: undefined,
          }));
        } else {
          setFtData((p) => ({ ...p, _id: ftResult.id }));
        }

        const htResult = await graphicsService.saveFTDraft(ht, ht._id);
        if (ht.bgImageFile) {
          await graphicsService.uploadFTBackground(htResult.id, ht.bgImageFile);
          setHtData((p) => ({
            ...p,
            _id: htResult.id,
            bgImageFile: undefined,
          }));
        } else {
          setHtData((p) => ({ ...p, _id: htResult.id }));
        }

        const mdResult = await graphicsService.saveMDDraft(md, md._id);
        if (md.bgImageFile) {
          await graphicsService.uploadMDBackground(mdResult.id, md.bgImageFile);
          setMdData((p) => ({
            ...p,
            _id: mdResult.id,
            bgImageFile: undefined,
          }));
        } else {
          setMdData((p) => ({ ...p, _id: mdResult.id }));
        }

        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (err) {
        console.error("Auto-save failed:", err);
        setSaveStatus("error");
      }
    }, 1500);
  }, []);

  const handleFtChange = useCallback(
    (data: FullTimeData) => {
      setFtData(data);
      scheduleAutoSave();
    },
    [scheduleAutoSave],
  );

  const handleHtChange = useCallback(
    (data: FullTimeData) => {
      setHtData(data);
      scheduleAutoSave();
    },
    [scheduleAutoSave],
  );

  const handleMdChange = useCallback(
    (data: MatchdayData) => {
      setMdData(data);
      scheduleAutoSave();
    },
    [scheduleAutoSave],
  );

  // teams
  const handleTeamSave = useCallback(async (team: Team) => {
    try {
      const created = await teamsService.create(team.name);
      setTeams((prev) => [...prev, created]);
    } catch (err) {
      console.error("Team save failed:", err);
    }
  }, []);

  const handleTeamsUpdate = useCallback((updated: Team[]) => {
    setTeams(updated);
    saveTeams(updated);
  }, []);

  // competitions
  const handleCompetitionsUpdate = useCallback((updated: Competition[]) => {
    setCompetitions(updated);
    saveCompetitions(updated);
  }, []);

  // export
  const handleExport = async () => {
    const stage =
      view === "ft"
        ? ftStageRef.current
        : view === "ht"
          ? htStageRef.current
          : mdStageRef.current;
    if (!stage || exporting) {
      return;
    }
    setExporting(true);
    try {
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
      stage.size({ width: prev.w, height: prev.h });
      stage.scale({ x: prev.sx, y: prev.sy });
      stage.draw();
      const link = document.createElement("a");
      const label =
        view === "ft" ? "fulltime" : view === "ht" ? "halftime" : "matchday";
      link.download = `lfc-${label}-${Date.now()}.png`;
      link.href = dataURL;
      link.click();
      // mark draft as published
      const id =
        view === "ft" ? ftData._id : view === "ht" ? htData._id : mdData._id;
      if (id) await graphicsService.publishFT(id);
    } finally {
      setExporting(false);
    }
  };

  const isCanvas = view === "ft" || view === "ht" || view === "md";

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div className="spinner" />
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Connecting to server…
        </span>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar view={view} onViewChange={setView} teamCount={teams.length} />
      <div className="main">
        {view === "teams" && (
          <TeamManager teams={teams} onUpdate={handleTeamsUpdate} />
        )}
        {view === "comps" && (
          <CompetitionManager
            competitions={competitions}
            onUpdate={handleCompetitionsUpdate}
          />
        )}

        {isCanvas && (
          <>
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2>
                    {view === "ft"
                      ? "Full Time Result"
                      : view === "ht"
                        ? "Half Time"
                        : "Match Day"}
                  </h2>
                  <p>
                    {view === "md"
                      ? "Configure upcoming match"
                      : "Configure scoreline & events"}
                  </p>
                </div>
              </div>
              {view === "md" ? (
                <MatchdayPanel
                  data={mdData}
                  onChange={handleMdChange}
                  teams={teams}
                  competitions={competitions}
                  onTeamSave={handleTeamSave}
                  onCompetitionsChange={handleCompetitionsUpdate}
                />
              ) : (
                <FullTimePanel
                  data={view === "ft" ? ftData : htData}
                  onChange={view === "ft" ? handleFtChange : handleHtChange}
                  teams={teams}
                  competitions={competitions}
                  onTeamSave={handleTeamSave}
                  onCompetitionsChange={handleCompetitionsUpdate}
                />
              )}
            </div>

            <div className="canvas-area">
              <div className="canvas-toolbar">
                <div className="canvas-toolbar-left">
                  <div className="status-dot" />
                  <span className="status-label">
                    Live Preview · 1080 × 1080
                  </span>
                  {saveStatus === "saving" && (
                    <span className="save-badge saving">Saving…</span>
                  )}
                  {saveStatus === "saved" && (
                    <span className="save-badge saved">✓ Saved</span>
                  )}
                  {saveStatus === "error" && (
                    <span className="save-badge error">Save failed</span>
                  )}
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
                  <div style={{ display: view === "ft" ? "block" : "none" }}>
                    <Canvas data={ftData} stageRef={ftStageRef} />
                  </div>
                  <div style={{ display: view === "ht" ? "block" : "none" }}>
                    <Canvas data={htData} stageRef={htStageRef} />
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
