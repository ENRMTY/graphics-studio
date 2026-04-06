export interface Team {
  id: string;
  name: string;
  logo: string | null; // base64 data URL or remote URL
  logoFile?: File; // padded PNG file, held in memory until saved to backend
}
