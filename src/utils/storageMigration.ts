const TEAMS_KEY = "lfc_teams_v3";
const COMPETITIONS_KEY = "lfc_competitions_v1";
const PLAYERS_KEY = "lfc_players_v1";
const LINEUP_SNAPSHOT_KEY = "lfc_lineup_snapshot_v1";
const DOT_COLORS_KEY = "lfc_dot_colors_v1";
const STORAGE_VERSION_KEY = "lfc_storage_version";
const CURRENT_VERSION = "v1.4";

function runStorageMigration() {
  const currentVersion = localStorage.getItem(STORAGE_VERSION_KEY);
  if (currentVersion !== CURRENT_VERSION) {
    localStorage.removeItem(TEAMS_KEY);
    localStorage.removeItem(COMPETITIONS_KEY);
    localStorage.removeItem(PLAYERS_KEY);
    localStorage.removeItem(LINEUP_SNAPSHOT_KEY);
    localStorage.removeItem(DOT_COLORS_KEY);
    localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
  }
}

runStorageMigration();

export default runStorageMigration;
