import { useSyncExternalStore } from "react";

/**
 * single source of truth for "use the mobile layout".
 * must stay in sync with the @media query at the top of styles/mobile.css.
 * covers phones/small tablets in portrait AND phones in landscape.
 */
export const MOBILE_QUERY =
  "(max-width: 768px), (max-height: 500px) and (pointer: coarse)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
