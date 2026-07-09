// Search for songs by name. Returns a list of tracks.
// Each track has a "preview" field: a URL to a 30 second MP3 clip.
export async function searchTracks(query) {
  const response = await fetch('/api/deezer/search?q=' + encodeURIComponent(query))
  const data = await response.json()

  // data.data is the array of results. Keep only songs that have a preview clip.
  return data.data.filter((track) => track.preview)
}


// Get one specific track by its Deezer ID.
// We use this to load the "song of the day".
export async function getTrack(id) {
  const response = await fetch('/api/deezer/track/' + id)
  const data = await response.json()
  return data
}
