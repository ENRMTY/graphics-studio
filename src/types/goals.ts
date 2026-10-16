export interface GoalsData {
  _id?: string;
  type: "goals";
  bgImage: string | null;
  bgImageFile?: File;
  /** How many goal times to show. 3 to 6. */
  count: 3 | 4 | 5 | 6;
  /** Minute strings, without the apostrophe. Extra slots are kept when the count drops. */
  minutes: string[];
  competition: string;
  competitionIcon: string | null;
  competitionColor: string;
  team: { id: string; name: string; logo: string | null } | null;
}
