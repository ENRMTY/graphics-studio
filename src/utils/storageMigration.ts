const TEAMS_KEY = "lfc_teams_v3";
const COMPETITIONS_KEY = "lfc_competitions_v1";
const STORAGE_VERSION_KEY = "lfc_storage_version";
const CURRENT_VERSION = "v1.2"; // increment to force clear

// runs automatically when this file is imported
function runStorageMigration() {
  const currentVersion = localStorage.getItem(STORAGE_VERSION_KEY);

  if (currentVersion !== CURRENT_VERSION) {
    console.log(
      `Clearing old storage (version changed: ${currentVersion || "none"} → ${CURRENT_VERSION})`,
    );

    localStorage.removeItem(TEAMS_KEY);
    localStorage.removeItem(COMPETITIONS_KEY);

    localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);

    console.log(
      "Old teams & competitions localStorage cleared successfully",
    );
  }
}

runStorageMigration();

export default runStorageMigration;
