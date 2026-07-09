import {TRACK_IDS} from './trackIds.js';

export function getTodaysTrackId() {
  // Pick a track ID based on the current date.
  const today = new Date();
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
  );
  const index = dayOfYear % TRACK_IDS.length;
  return TRACK_IDS[index];
}