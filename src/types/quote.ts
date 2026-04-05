export interface QuoteData {
  _id?: string;
  type: "quote";
  bgImage: string | null;
  bgImageFile?: File;
  playerName: string;
  playerRole: string;
  playerImage: string | null;
  playerImageFile?: File;
  quoteText: string;
  competition: string;
  competitionIcon: string | null;
  competitionColor: string;
  accentColor: string;
}
