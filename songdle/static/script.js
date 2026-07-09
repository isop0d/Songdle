// Main game logic for Songdle.

import { getTrackId } from './lib/dailySong.js'
import { getTrack } from './lib/deezer.js'
import { searchTracks } from './lib/deezer.js'

// How many seconds of the song are unlocked at each guess.
const DURATIONS = [1, 2, 4, 7, 11, 16]

let track = null   // the song of the day (loaded below)
let guesses = []   // every guess the player has made so far
let guesslen = 1
let selectedTrack = null // the track selected from search results
let dayOffset = 0 // how many days ago the player is playing (0 = today, 1 = yesterday, etc.)



// Elements from index.html we need to talk to 
const audio = document.getElementById('audio-player')
const playBtn = document.getElementById('play-btn')
const submitBtn = document.getElementById('submit-btn')
const skipBtn = document.getElementById('skip-btn')
const songInput = document.getElementById('song-input')
const prevDayBtn = document.getElementById('prev-day-btn')
const nextDayBtn = document.getElementById('next-day-btn')
const dayLabel = document.getElementById('day-label')

// Update the day label to reflect the current day offset
function updateDayLabel() {
    if (dayOffset === 0) {
        dayLabel.textContent = 'Today';
        return;
    }
    if (dayOffset === 1) {
        dayLabel.textContent = 'Yesterday';
        return;
    }

    // Start from a fresh "today" every time. setDate() permanently changes
    // the date object, so a shared one would drift further back on every click.
    const day = new Date();
    day.setDate(day.getDate() - dayOffset);
    dayLabel.textContent = day.getDate() + '/' + (day.getMonth() + 1) + '/' + day.getFullYear();
}

function resetGame() {
    guesses = []
    guesslen = 1
    selectedTrack = null
    songInput.value = ''
    updateDayLabel() // Update the day label to reflect the current day offset

    // Reset the progress bar segments back to the stylesheet's colors
    // ('' means "remove my inline style, use the CSS")
    const progressBarSegments = document.querySelectorAll('.progress-bar-segment');
    progressBarSegments.forEach(segment => {
        segment.style.backgroundColor = '';
    });

    // Put the guess rows back to "1." ... "6." and clear their colors
    for (let i = 1; i <= DURATIONS.length; i++) {
        const row = document.getElementById(`guess-${i}`);
        row.textContent = `${i}.`;
        row.classList.remove('correct', 'incorrect', 'skipped');
    }

    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = '';
}

// Load the song of the day 
async function loadTodaysSong() {
  const trackId = getTrackId(dayOffset)
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
            selectedTrack = result;
            searchResults.innerHTML = '';
        });
    }


    
})

async function gameOver(won) {
    if (won) {
        alert('Congratulations! You guessed the song correctly!');
    } else {
        alert(`Game over! The correct song was: ${track.title} by ${track.artist.name}`);
    }

    // Submit the result to the server

    const response = await fetch('/api/result', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            attempts: guesses.length,
            play_date: new Date().toISOString(),
            won: won
        })
    });

    if (response.status == 200) {
        console.log('Result submitted successfully.');
    }
    else if ((response.status === 400)) {
        alert('You are not logged in. Please log in to submit your result.');
    }
    else if ((response.status === 401)) {
        alert('You have already submitted your result for today. Please come back tomorrow to play again.');
    }
}

// Handle the submit button click
submitBtn.addEventListener('click', () => {

    const guess = selectedTrack;


    if (!guess) return;

    // Decide right/wrong FIRST, then color the row to match.
    const isCorrect = guess.id === track.id;

    if (guesses.length < DURATIONS.length) {
        guesses.push(guess);
        songInput.value = '';
        const row = document.getElementById(`guess-${guesslen}`);
        row.textContent = guess.title;
        row.classList.add(isCorrect ? 'correct' : 'incorrect');
        const progressBarSegments = document.querySelectorAll('.progress-bar-segment');
        progressBarSegments[guesslen - 1].style.backgroundColor = isCorrect ? 'green' : 'red';
        guesslen++;
    }
    if (isCorrect) {
        // Handle correct guess
        console.log('Correct guess!');
        gameOver(true);

    }
    else if (guesses.length >= DURATIONS.length) {
        // Handle game over
        console.log('Game over!');
        gameOver(false);
    }

})

// Handle the skip button click
skipBtn.addEventListener('click', () => {
    if (guesses.length < DURATIONS.length) {
        guesses.push('skipped');
        const row = document.getElementById(`guess-${guesslen}`);
        row.textContent = 'skipped';
        row.classList.add('skipped');
        const progressBarSegments = document.querySelectorAll('.progress-bar-segment');
        progressBarSegments[guesslen - 1].style.backgroundColor = 'yellow';
        guesslen++;
    }
    if (guesses.length >= DURATIONS.length) {
        // Handle game over
        console.log('Game over!');
        gameOver(false);
    }
})

prevDayBtn.addEventListener('click', () => {
    dayOffset++;
    resetGame();
    loadTodaysSong();
    nextDayBtn.style.display = 'inline'; // Show the next day button
});

nextDayBtn.addEventListener('click', () => {
    if (dayOffset > 0) {
        dayOffset--;
        resetGame();
        loadTodaysSong();
        if (dayOffset === 0) {
            nextDayBtn.style.display = 'none'; // Hide the next day button if we're back to today
        }
    }
});



