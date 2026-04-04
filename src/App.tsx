// external
import { useState, useRef, useCallback, useEffect } from "react";
import Konva from "konva";

// types
import type {
  ViewMode,
  FullTimeData,
  MatchdayData,
  StatsData,
  QuoteData,
  LineupData,
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
  apiGraphicToStats,
  apiGraphicToQuote,
} from "./services/graphicsService";

// components
import { Sidebar } from "./components/Sidebar";
import { FullTimePanel } from "./components/FullTimePanel";
import { MatchdayPanel } from "./components/MatchdayPanel";
import { StatsPanel } from "./components/StatsPanel";
import { QuotePanel } from "./components/QuotePanel";
import { LineupPanel } from "./components/LineupPanel";
import { TeamManager } from "./components/TeamManager";
import { CompetitionManager } from "./components/CompetitionManager";
import { Canvas, getFullDimensions } from "./components/Canvas";
import type { CanvasSize } from "./components/Canvas";
import { Icons } from "./components/Icons";
import { AuthModal } from "./components/AuthModal";

// constants
import {
  DEFAULT_FT,
  DEFAULT_HT,
  DEFAULT_MD,
  DEFAULT_STATS,
  DEFAULT_QUOTE,
  DEFAULT_LINEUP,
} from "./constants/defaults";

// utils
import { saveCompetitions, saveTeams } from "./utils/storage";
import "./utils/storageMigration";

export default function App() {
  // use states
  const [view, setView] = useState<ViewMode>("ft");
  const [teams, setTeams] = useState<Team[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [ftData, setFtData] = useState<FullTimeData>(DEFAULT_FT);
  const [htData, setHtData] = useState<FullTimeData>(DEFAULT_HT);
  const [mdData, setMdData] = useState<MatchdayData>(DEFAULT_MD);
  const [statsData, setStatsData] = useState<StatsData>(DEFAULT_STATS);
  const [quoteData, setQuoteData] = useState<QuoteData>(DEFAULT_QUOTE);
  const [lineupData, setLineupData] = useState<LineupData>(DEFAULT_LINEUP);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [exporting, setExporting] = useState(false);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>("1080x1080");
  const [showAuthModal, setShowAuthModal] = useState(false);

  // use refs
  const ftStageRef = useRef<Konva.Stage | null>(null);
  const htStageRef = useRef<Konva.Stage | null>(null);
  const mdStageRef = useRef<Konva.Stage | null>(null);
  const statsStageRef = useRef<Konva.Stage | null>(null);
  const quoteStageRef = useRef<Konva.Stage | null>(null);
  const lineupStageRef = useRef<Konva.Stage | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // use refs vars
  const ftRef = useRef(ftData);
  const htRef = useRef(htData);
  const mdRef = useRef(mdData);
  const statsRef = useRef(statsData);
  const quoteRef = useRef(quoteData);
  const lineupRef = useRef(lineupData);
  ftRef.current = ftData;
  htRef.current = htData;
  mdRef.current = mdData;
  statsRef.current = statsData;
  quoteRef.current = quoteData;
  lineupRef.current = lineupData;

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
          setFtData(apiGraphicToFT(drafts.fulltime, compsData) as FullTimeData);
        if (drafts.halftime)
          setHtData(apiGraphicToFT(drafts.halftime, compsData) as FullTimeData);
        if (drafts.matchday)
          setMdData(apiGraphicToMD(drafts.matchday, compsData) as MatchdayData);

        if (drafts.stats)
          setStatsData(apiGraphicToStats(drafts.stats) as StatsData);
        if (drafts.quote)
          setQuoteData(apiGraphicToQuote(drafts.quote) as QuoteData);
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
      const stats = statsRef.current;
      const quote = quoteRef.current;
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

        const statsResult = await graphicsService.saveStatsDraft(
          stats,
          (stats as any)._id,
        );
        if (stats.bgImageFile) {
          await graphicsService.uploadStatsBgImage(
            statsResult.id,
            stats.bgImageFile,
          );
          setStatsData((p) => ({
            ...p,
            _id: statsResult.id,
            bgImageFile: undefined,
          }));
        } else {
          setStatsData((p) => ({ ...p, _id: statsResult.id }));
        }
        if (stats.playerImageFile) {
          await graphicsService.uploadStatsPlayerImage(
            statsResult.id,
            stats.playerImageFile,
          );
          setStatsData((p) => ({
            ...p,
            _id: statsResult.id,
            playerImageFile: undefined,
          }));
        }

        const quoteResult = await graphicsService.saveQuoteDraft(
          quote,
          (quote as any)._id,
        );
        if (quote.bgImageFile) {
          await graphicsService.uploadQuoteBgImage(
            quoteResult.id,
            quote.bgImageFile,
          );
          setQuoteData((p) => ({
            ...p,
            _id: quoteResult.id,
            bgImageFile: undefined,
          }));
        } else {
          setQuoteData((p) => ({ ...p, _id: quoteResult.id }));
        }
        if (quote.playerImageFile) {
          await graphicsService.uploadQuotePlayerImage(
            quoteResult.id,
            quote.playerImageFile,
          );
          setQuoteData((p) => ({
            ...p,
            _id: quoteResult.id,
            playerImageFile: undefined,
          }));
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

  const handleStatsChange = useCallback(
    (data: StatsData) => {
      setStatsData(data);
      scheduleAutoSave();
    },
    [scheduleAutoSave],
  );

  const handleQuoteChange = useCallback(
    (data: QuoteData) => {
      setQuoteData(data);
      scheduleAutoSave();
    },
    [scheduleAutoSave],
  );

  // teams
  const handleLineupChange = useCallback((data: LineupData) => {
    setLineupData(data);
  }, []);

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
  }, []);

  // competitions
  const handleCompetitionsUpdate = useCallback((updated: Competition[]) => {
    setCompetitions(updated);
  }, []);

  // export
  const handleExport = async () => {
    const stage =
      view === "ft"
        ? ftStageRef.current
        : view === "ht"
          ? htStageRef.current
          : view === "stats"
            ? statsStageRef.current
            : view === "quote"
              ? quoteStageRef.current
              : mdStageRef.current;
    if (!stage || exporting) return;
    setExporting(true);
    try {
      const { fullW, fullH } = getFullDimensions(canvasSize);
      const prev = {
        w: stage.width(),
        h: stage.height(),
        sx: stage.scaleX(),
        sy: stage.scaleY(),
      };
      stage.size({ width: fullW, height: fullH });
      stage.scale({ x: 1, y: 1 });
      stage.draw();
      const dataURL = stage.toDataURL({ pixelRatio: 1, mimeType: "image/png" });
      stage.size({ width: prev.w, height: prev.h });
      stage.scale({ x: prev.sx, y: prev.sy });
      stage.draw();
      const link = document.createElement("a");
      const label =
        view === "ft"
          ? "fulltime"
          : view === "ht"
            ? "halftime"
            : view === "stats"
              ? "stats"
              : view === "quote"
                ? "quote"
                : view === "lineup"
                  ? "lineup"
                  : "matchday";
      link.download = `lfc-${label}-${canvasSize}-${Date.now()}.png`;
      link.href = dataURL;
      link.click();
      const id =
        view === "ft"
          ? ftData._id
          : view === "ht"
            ? htData._id
            : view === "md"
              ? mdData._id
              : undefined;
      if (id) await graphicsService.publishFT(id);
    } finally {
      setExporting(false);
    }
  };

  const isCanvas =
    view === "ft" ||
    view === "ht" ||
    view === "md" ||
    view === "stats" ||
    view === "quote" ||
    view === "lineup";

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
      <Sidebar
        view={view}
        onViewChange={setView}
        teamCount={teams.length}
        onSignInClick={() => setShowAuthModal(true)}
      />
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
                        : view === "stats"
                          ? "Player Stats"
                          : view === "quote"
                            ? "Quote Card"
                            : view === "lineup"
                              ? "Lineup"
                              : "Match Day"}
                  </h2>
                  <p>
                    {view === "md"
                      ? "Configure upcoming match"
                      : view === "stats"
                        ? "Player stats graphic"
                        : view === "quote"
                          ? "Player quote graphic"
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
              ) : view === "stats" ? (
                <StatsPanel
                  data={statsData}
                  onChange={handleStatsChange}
                  competitions={competitions}
                  onCompetitionsChange={handleCompetitionsUpdate}
                />
              ) : view === "quote" ? (
                <QuotePanel
                  data={quoteData}
                  onChange={handleQuoteChange}
                  competitions={competitions}
                  onCompetitionsChange={handleCompetitionsUpdate}
                />
              ) : view === "lineup" ? (
                <LineupPanel
                  data={lineupData}
                  onChange={handleLineupChange}
                  competitions={competitions}
                  onCompetitionsChange={handleCompetitionsUpdate}
                />
              ) : (
                <FullTimePanel
                  data={view === "ft" ? ftData : htData}
                  onChange={view === "ft" ? handleFtChange : handleHtChange}
                  onTypeChange={(type) =>
                    setView(type === "fulltime" ? "ft" : "ht")
                  }
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
                  <div className="size-picker">
                    {(["1080x1080", "1080x1920"] as CanvasSize[]).map((s) => (
                      <button
                        key={s}
                        className={`size-chip ${canvasSize === s ? "active" : ""}`}
                        onClick={() => setCanvasSize(s)}
                      >
                        {s === "1080x1080" ? "1080 × 1080" : "1080 × 1920"}
                      </button>
                    ))}
                  </div>
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
                    <Canvas
                      data={ftData}
                      stageRef={ftStageRef}
                      canvasSize={canvasSize}
                    />
                  </div>
                  <div style={{ display: view === "ht" ? "block" : "none" }}>
                    <Canvas
                      data={htData}
                      stageRef={htStageRef}
                      canvasSize={canvasSize}
                    />
                  </div>
                  <div style={{ display: view === "md" ? "block" : "none" }}>
                    <Canvas
                      data={mdData}
                      stageRef={mdStageRef}
                      canvasSize={canvasSize}
                    />
                  </div>
                  <div style={{ display: view === "stats" ? "block" : "none" }}>
                    <Canvas
                      data={statsData}
                      stageRef={statsStageRef}
                      canvasSize={canvasSize}
                    />
                  </div>
                  <div style={{ display: view === "quote" ? "block" : "none" }}>
                    <Canvas
                      data={quoteData}
                      stageRef={quoteStageRef}
                      canvasSize={canvasSize}
                    />
                  </div>
                  <div
                    style={{ display: view === "lineup" ? "block" : "none" }}
                  >
                    <Canvas
                      data={lineupData}
                      stageRef={lineupStageRef}
                      canvasSize={canvasSize}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}
