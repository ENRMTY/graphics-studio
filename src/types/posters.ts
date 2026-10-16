interface PhotoFields {
  bgImage: string | null;
  bgImageFile?: File;
}

interface CompFields {
  competition: string;
  competitionIcon: string | null;
  competitionColor: string;
}

export interface GoalMomentData extends PhotoFields, CompFields {
  _id?: string;
  type: "goal";
  playerName: string;
  minute: string;
  ourScore: string;
  theirScore: string;
  usName: string;
  usLogo: string | null;
  opponent: string;
  opponentLogo: string | null;
}

export interface MilestoneData extends PhotoFields, CompFields {
  _id?: string;
  type: "milestone";
  playerName: string;
  value: string;
  label: string;
}

export interface TableSpotData extends PhotoFields, CompFields {
  _id?: string;
  type: "table";
  position: string;
  points: string;
  gd: string;
}

export interface NextUpData extends PhotoFields, CompFields {
  _id?: string;
  type: "next";
  usName: string;
  usLogo: string | null;
  opponent: string;
  opponentLogo: string | null;
  kickoff: string;
  timezone: string;
  matchDate: string;
}
