import { useState } from 'react'

function App() {
  const [guess, setGuess] = useState('')

  return (
    <>
      <h1>Songdle</h1>
      <input
        type="text"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        placeholder="Guess the song..."
      />
      <button onClick={() => console.log(guess)}>Submit</button>
    </>
  )
}

export default App
