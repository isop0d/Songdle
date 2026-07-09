// Main game logic for Songdle.

import { getTodaysTrackId } from './lib/dailySong.js'
import { getTrack } from './lib/deezer.js'
import { searchTracks } from './lib/deezer.js'

// How many seconds of the song are unlocked at each guess.
const DURATIONS = [1, 2, 4, 7, 11, 16]

let track = null   // the song of the day (loaded below)
let guesses = []   // every guess the player has made so far
let guesslen = 1

// Elements from index.html we need to talk to 
const audio = document.getElementById('audio-player')
const playBtn = document.getElementById('play-btn')
const submitBtn = document.getElementById('submit-btn')
const skipBtn = document.getElementById('skip-btn')
const songInput = document.getElementById('song-input')

// Load the song of the day 
async function loadTodaysSong() {
  const trackId = getTodaysTrackId()
  track = await getTrack(trackId)

  console.log('Track of the day:', track)

  // Point the hidden <audio> element at the 30-second preview clip.
  audio.src = track.preview
}

// This runs once as soon as the page loads.
loadTodaysSong()

async function playSnippet() {
    const seconds = DURATIONS[guesses.length];
    audio.currentTime = 0;
    audio.play();
    setTimeout(() => {
        audio.pause();
    }, seconds * 1000);
}

// Handle the play button click
playBtn.addEventListener('click', playSnippet);

// Handle the input event on the song input field for search suggestions
songInput.addEventListener('input', async () => {
    const query = songInput.value.trim();
    if (!query) return;

    const results = await searchTracks(query);

    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = '';

    for (const result of results.slice(0, 5)) { // Show top 5 results
        const resultDiv = document.createElement('div');
        resultDiv.textContent = `${result.title} by ${result.artist.name}`;
        searchResults.appendChild(resultDiv);

        resultDiv.addEventListener('click', () => {
            songInput.value = `${result.title} by ${result.artist.name}`;
            searchResults.innerHTML = '';
        });
    }


    

})

// Handle the submit button click
submitBtn.addEventListener('click', () => {

    const guess = songInput.value.trim();

    if (!guess) return;

    if (guesses.length < DURATIONS.length) {
        guesses.push(guess);
        songInput.value = '';
        document.getElementById(`guess-${guesslen}`).textContent = guess;
        document.getElementById(`progress-bar-segment-${guesslen}`).style.backgroundColor = 'green';
        guesslen++;
    }
    if (guess == track.title) {
        // Handle correct guess
        console.log('Correct guess!');

    }

})

// Handle the skip button click
skipBtn.addEventListener('click', () => {
    if (guesses.length < DURATIONS.length) {
        guesses.push('skipped');
        document.getElementById(`guess-${guesslen}`).textContent = 'skipped';
        document.getElementById(`progress-bar-segment-${guesslen}`).style.backgroundColor = 'yellow';
        guesslen++;
    }
})



