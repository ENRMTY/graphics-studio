export interface NewsData {
  _id?: string;
  type: "news";
  bgImage: string | null;
  bgImageFile?: File;
  headline: string;
  caption: string;
  competition: string;
  competitionIcon: string | null;
  competitionColor: string;
}
