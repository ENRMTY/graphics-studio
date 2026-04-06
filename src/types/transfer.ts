export type TransferKind = "transfer" | "loan" | "free";
export type TransferStatus = "confirmed" | "rumour";
export type TransferCurrency = "£" | "€" | "$";

export interface TransferData {
  _id?: string;
  type: "transfer";
  bgImage: string | null;
  bgImageFile?: File;
  playerName: string;
  fromTeam: { id: string; name: string; logo: string | null } | null;
  toTeam: { id: string; name: string; logo: string | null } | null;
  transferKind: TransferKind;
  fee: string;
  currency: TransferCurrency;
  status: TransferStatus;
}
