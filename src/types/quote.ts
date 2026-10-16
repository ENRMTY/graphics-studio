export interface QuoteData {
  _id?: string;
  type: "quote";
  layout?: "top" | "bottom" | "classic" | "overlay";
  quoteSize?: "small" | "big";
  bgImage: string | null;
  bgImageFile?: File;
  playerName: string;
  playerRole: string;
  playerImage: string | null;
  playerImageFile?: File;
  quoteText: string;
  matchContext?: string;
  competition: string;
  competitionIcon: string | null;
  competitionColor: string;
  accentColor: string;
}
