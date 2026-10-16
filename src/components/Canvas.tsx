import React, { useEffect, useRef, useState } from "react";
import Konva from "konva";
import type {
  FullTimeData,
  MatchdayData,
  StatsData,
  QuoteData,
  NewsData,
  LineupData,
  TransferData,
  GoalsData,
  GoalMomentData,
  MilestoneData,
  TableSpotData,
  NextUpData,
} from "@types";
import {
  renderFullTime,
  renderMatchday,
  renderStats,
  renderQuote,
  renderNews,
  renderLineup,
  renderTransfer,
  renderGoals,
  renderGoalMoment,
  renderMilestone,
  renderTableSpot,
  renderNextUp,
} from "@graphics";
import { useIsMobile } from "../hooks/useIsMobile";
import { ensureCanvasFonts } from "../utils/canvasFonts";

type CanvasData =
  | FullTimeData
  | MatchdayData
  | StatsData
  | QuoteData
  | NewsData
  | LineupData
  | TransferData
  | GoalsData
  | GoalMomentData
  | MilestoneData
  | TableSpotData
  | NextUpData;

export type CanvasSize = "1080x1080" | "1080x1920";

interface Props {
  data: CanvasData;
  stageRef: React.MutableRefObject<Konva.Stage | null>;
  canvasSize: CanvasSize;
  /** mobile: preview is hidden, skip redraws until it is shown again */
  paused?: boolean;
}

const FULL_W = 1080;
const DISPLAY_H = 520;

function getFullDimensions(canvasSize: CanvasSize) {
  return canvasSize === "1080x1920"
    ? { fullW: 1080, fullH: 1920 }
    : { fullW: 1080, fullH: 1080 };
}

interface Box {
  w: number;
  h: number;
}

function getDisplayDimensions(canvasSize: CanvasSize, fit?: Box | null) {
  const { fullW, fullH } = getFullDimensions(canvasSize);
  // mobile: scale the preview to fit the available area (desktop unchanged)
  if (fit) {
    const scale = Math.min(fit.w / fullW, fit.h / fullH);
    return {
      displayW: Math.floor(fullW * scale),
      displayH: Math.floor(fullH * scale),
      scale,
    };
  }
  const scale = DISPLAY_H / fullH;
  return { displayW: Math.round(fullW * scale), displayH: DISPLAY_H, scale };
}

/** Measures the preview area on mobile so the canvas can fit inside it. */
function useFitBox(
  containerRef: React.RefObject<HTMLDivElement>,
  enabled: boolean,
): Box | null {
  const [box, setBox] = useState<Box | null>(null);

  useEffect(() => {
    if (!enabled) {
      setBox(null);
      return;
    }
    const el = containerRef.current?.closest(
      ".canvas-wrapper",
    ) as HTMLElement | null;
    if (!el) {
      return;
    }
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      // hidden tab reports 0x0 - keep the last good measurement
      if (width > 0 && height > 0) {
        setBox((prev) =>
          prev && prev.w === Math.floor(width) && prev.h === Math.floor(height)
            ? prev
            : { w: Math.floor(width), h: Math.floor(height) },
        );
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [enabled, containerRef]);

  return box;
}

export function Canvas({ data, stageRef, canvasSize, paused }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);
  const dataRef = useRef(data);
  dataRef.current = data;
  const sizeRef = useRef(canvasSize);
  sizeRef.current = canvasSize;
  const isMobile = useIsMobile();
  const fit = useFitBox(containerRef, isMobile);
  const fitRef = useRef(fit);
  fitRef.current = fit;

  // init stage once
  useEffect(() => {
    if (!containerRef.current || mountedRef.current) {
      return;
    }

    mountedRef.current = true;
    const { displayW, displayH, scale } = getDisplayDimensions(
      sizeRef.current,
      fitRef.current,
    );
    const stage = new Konva.Stage({
      container: containerRef.current,
      width: displayW,
      height: displayH,
      scaleX: scale,
      scaleY: scale,
    });
    stageRef.current = stage;
    triggerRender(stage, data, sizeRef.current);
    // canvas text needs the web fonts - redraw once they are available
    let cancelled = false;
    ensureCanvasFonts().then(() => {
      if (!cancelled && stageRef.current === stage) {
        triggerRender(stage, dataRef.current, sizeRef.current);
      }
    });
    return () => {
      cancelled = true;
      stage.destroy();
      stageRef.current = null;
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // re-render when data or size changes.
  // While `paused` (mobile Edit tab - preview not on screen) redraws are
  // skipped; the latest data is drawn as soon as the preview is shown again.
  const renderedRef = useRef<{ data: CanvasData; size: CanvasSize } | null>(
    null,
  );
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || paused) {
      return;
    }

    const { displayW, displayH, scale } = getDisplayDimensions(
      canvasSize,
      fitRef.current,
    );
    stage.width(displayW);
    stage.height(displayH);
    stage.scaleX(scale);
    stage.scaleY(scale);
    const last = renderedRef.current;
    if (last && last.data === data && last.size === canvasSize) {
      stage.batchDraw(); // nothing changed, just resized
    } else {
      renderedRef.current = { data, size: canvasSize };
      triggerRender(stage, data, canvasSize);
    }
  }, [data, canvasSize, stageRef, paused]);

  const {
    displayW,
    displayH,
    scale: displayScale,
  } = getDisplayDimensions(canvasSize, fit);

  // mobile: preview area changed (rotation, tab switch) - resize without re-rendering
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !fit) {
      return;
    }
    if (stage.width() === displayW && stage.height() === displayH) {
      return;
    }
    stage.width(displayW);
    stage.height(displayH);
    stage.scaleX(displayScale);
    stage.scaleY(displayScale);
    stage.batchDraw();
  }, [fit, displayW, displayH, displayScale, stageRef]);

  return (
    <div
      ref={containerRef}
      style={{ width: displayW, height: displayH, display: "block" }}
    />
  );
}

export async function triggerRender(
  stage: Konva.Stage,
  data: CanvasData,
  canvasSize: CanvasSize,
) {
  const { fullW, fullH } = getFullDimensions(canvasSize);
  if (data.type === "matchday") {
    renderMatchday(stage, data, fullW, fullH);
  } else if (data.type === "stats") {
    renderStats(stage, data, fullW, fullH);
  } else if (data.type === "quote") {
    renderQuote(stage, data, fullW, fullH);
  } else if (data.type === "news") {
    await renderNews(stage, data, fullW, fullH);
  } else if (data.type === "lineup") {
    await renderLineup(stage, data, fullW, fullH);
  } else if (data.type === "transfer") {
    renderTransfer(stage, data, fullW, fullH);
  } else if (data.type === "goals") {
    await renderGoals(stage, data, fullW, fullH);
  } else if (data.type === "goal") {
    await renderGoalMoment(stage, data, fullW, fullH);
  } else if (data.type === "milestone") {
    await renderMilestone(stage, data, fullW, fullH);
  } else if (data.type === "table") {
    await renderTableSpot(stage, data, fullW, fullH);
  } else if (data.type === "next") {
    await renderNextUp(stage, data, fullW, fullH);
  } else {
    renderFullTime(stage, data, fullW, fullH);
  }
}

export { getFullDimensions };
