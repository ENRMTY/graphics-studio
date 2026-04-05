import { EventSide, EventType } from "./common";

export interface MatchEvent {
  id: string;
  type: EventType;
  player: string;
  minute: string;
  side: EventSide;
}
