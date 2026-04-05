import React, { useEffect, useRef } from "react";
import Konva from "konva";
import type {
  FullTimeData,
  MatchdayData,
  StatsData,
  QuoteData,
  LineupData,
} from "../types";
import {
  renderFullTime,
  renderMatchday,
  renderStats,
  renderQuote,
  renderLineup,
} from "../graphics";

type CanvasData =
  | FullTimeData
  | MatchdayData
  | StatsData
  | QuoteData
  | LineupData;

export type CanvasSize = "1080x1080" | "1080x1920";

interface Props {
  data: CanvasData;
  stageRef: React.MutableRefObject<Konva.Stage | null>;
  canvasSize: CanvasSize;
}

const FULL_W = 1080;
const DISPLAY_H = 520;

function getFullDimensions(canvasSize: CanvasSize) {
  return canvasSize === "1080x1920"
    ? { fullW: 1080, fullH: 1920 }
    : { fullW: 1080, fullH: 1080 };
}

function getDisplayDimensions(canvasSize: CanvasSize) {
  const { fullW, fullH } = getFullDimensions(canvasSize);
  const scale = DISPLAY_H / fullH;
  return { displayW: Math.round(fullW * scale), displayH: DISPLAY_H, scale };
}

export function Canvas({ data, stageRef, canvasSize }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);
  const sizeRef = useRef(canvasSize);
  sizeRef.current = canvasSize;

  // init stage once
  useEffect(() => {
    if (!containerRef.current || mountedRef.current) {
      return;
    }

    mountedRef.current = true;
    const { displayW, displayH, scale } = getDisplayDimensions(sizeRef.current);
    const stage = new Konva.Stage({
      container: containerRef.current,
      width: displayW,
      height: displayH,
      scaleX: scale,
      scaleY: scale,
    });
    stageRef.current = stage;
    triggerRender(stage, data, sizeRef.current);
    return () => {
      stage.destroy();
      stageRef.current = null;
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // re-render when data or size changes
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    const { displayW, displayH, scale } = getDisplayDimensions(canvasSize);
    stage.width(displayW);
    stage.height(displayH);
    stage.scaleX(scale);
    stage.scaleY(scale);
    triggerRender(stage, data, canvasSize);
  }, [data, canvasSize, stageRef]);

  const { displayW, displayH } = getDisplayDimensions(canvasSize);

  return (
    <div
      ref={containerRef}
      style={{ width: displayW, height: displayH, display: "block" }}
    />
  );
}

function triggerRender(
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
  } else if (data.type === "lineup") {
    renderLineup(stage, data, fullW, fullH);
  } else {
    renderFullTime(stage, data, fullW, fullH);
  }
}

export { getFullDimensions };
