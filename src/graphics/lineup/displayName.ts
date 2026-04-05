/**
 * returns the display surname for a player name
 *
 * handles compound surnames with lowercase prefixes (van, de, mac, al, etc.)
 * e.g. "Virgil van Dijk"   → "van Dijk"
 *      "Kevin de Bruyne"   → "de Bruyne"
 *      "Alexis Mac Allister" → "Mac Allister"
 *      "Mohamed Salah"     → "Salah"
 *      "Salah"             → "Salah"
 */

// particles that are part of the surname, not a first/middle name separator
const SURNAME_PARTICLES = new Set([
  "van",
  "van't",
  "van den",
  "van der",
  "van de",
  "de",
  "del",
  "della",
  "degli",
  "dei",
  "den",
  "da",
  "do",
  "dos",
  "das",
  "di",
  "du",
  "le",
  "la",
  "les",
  "al",
  "el",
  "mac",
  "mc",
  "bin",
  "binti",
  "ap",
  "o'",
  "o",
  "ter",
  "ten",
  "von",
  "zu",
]);

export function displayName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);

  // single word — just use it
  if (parts.length <= 1) {
    return fullName;
  }

  // walk from the second token onwards; find where the surname starts
  // the surname starts at the first token that is either:
  //   (a) a lowercase particle, OR
  //   (b) the last token (always surname)
  // everything from that index onwards is the display name
  for (let i = 1; i < parts.length; i++) {
    const lower = parts[i].toLowerCase();
    if (SURNAME_PARTICLES.has(lower) || i === parts.length - 1) {
      return parts.slice(i).join(" ");
    }
  }

  return parts[parts.length - 1];
}
