import React, { useEffect, useRef } from "react";
import Konva from "konva";
import type {
  FullTimeData,
  MatchdayData,
  StatsData,
  QuoteData,
} from "../types";
import {
  renderFullTime,
  renderMatchday,
  renderStats,
  renderQuote,
} from "../utils/canvasRenderer";

type CanvasData = FullTimeData | MatchdayData | StatsData | QuoteData;
interface Props {
  data: CanvasData;
  stageRef: React.MutableRefObject<Konva.Stage | null>;
}

const FULL_SIZE = 1080;
const DISPLAY_SIZE = 520;
const SCALE = DISPLAY_SIZE / FULL_SIZE;

export function Canvas({ data, stageRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  // init stage on mount, destroy on unmount
  useEffect(() => {
    if (!containerRef.current || mountedRef.current) {
      return;
    }
    mountedRef.current = true;

    const stage = new Konva.Stage({
      container: containerRef.current,
      width: DISPLAY_SIZE,
      height: DISPLAY_SIZE,
      scaleX: SCALE,
      scaleY: SCALE,
    });
    stageRef.current = stage;

    triggerRender(stage, data);

    return () => {
      stage.destroy();
      stageRef.current = null;
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // re-render on data change
  useEffect(() => {
    if (stageRef.current) {
      triggerRender(stageRef.current, data);
    }
  }, [data, stageRef]);

  return (
    <div
      ref={containerRef}
      style={{ width: DISPLAY_SIZE, height: DISPLAY_SIZE, display: "block" }}
    />
  );
}

function triggerRender(stage: Konva.Stage, data: CanvasData) {
  if (data.type === "matchday") {
    renderMatchday(stage, data, FULL_SIZE);
  } else if (data.type === "stats") {
    renderStats(stage, data, FULL_SIZE);
  } else if (data.type === "quote") {
    renderQuote(stage, data, FULL_SIZE);
  } else {
    renderFullTime(stage, data, FULL_SIZE);
  }
}
