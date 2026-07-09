import { TRACK_IDS } from './trackIds.js';

// daysAgo = 0 means today, 1 means yesterday, and so on.
// The same date always gives the same song, for everyone.
export function getTrackId(daysAgo = 0) {
  const day = new Date();
  day.setDate(day.getDate() - daysAgo);

  const dayOfYear = Math.floor(
    (day - new Date(day.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
  );

  // The extra "+ length" keeps the index positive (JS % can go negative).
  const index = ((dayOfYear % TRACK_IDS.length) + TRACK_IDS.length) % TRACK_IDS.length;
  return TRACK_IDS[index];
}
