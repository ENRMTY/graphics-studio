import React, { useEffect, useRef } from 'react';
import Konva from 'konva';
import type { FullTimeData, MatchdayData } from '../types';
import { renderFullTime, renderMatchday } from '../utils/canvasRenderer';

interface Props {
  data: FullTimeData | MatchdayData;
  stageRef: React.MutableRefObject<Konva.Stage | null>;
}

const FULL_SIZE = 1080;
const DISPLAY_SIZE = 520;
const SCALE = DISPLAY_SIZE / FULL_SIZE;

export function Canvas({ data, stageRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  // Init stage once
  useEffect(() => {
    if (!containerRef.current || mountedRef.current) return;
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

  // Re-render on data change
  useEffect(() => {
    if (stageRef.current) {
      triggerRender(stageRef.current, data);
    }
  }, [data, stageRef]);

  return (
    <div
      ref={containerRef}
      style={{ width: DISPLAY_SIZE, height: DISPLAY_SIZE, display: 'block' }}
    />
  );
}

function triggerRender(stage: Konva.Stage, data: FullTimeData | MatchdayData) {
  if (data.type === 'fulltime') {
    renderFullTime(stage, data, FULL_SIZE);
  } else {
    renderMatchday(stage, data, FULL_SIZE);
  }
}
