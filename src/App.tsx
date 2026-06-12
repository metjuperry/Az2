import { useMemo, useState } from 'react'
import { Board } from './game/Board'
import { QuestionStore } from './storage/QuestionStore'
import { EditMode } from './components/EditMode'
import { PlayMode } from './components/PlayMode'
import './styles.css'

type Mode = 'play' | 'edit'

export default function App() {
  const [mode, setMode] = useState<Mode>('play')
  const board = useMemo(() => new Board(), [])
  const store = useMemo(() => new QuestionStore(), [])

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">AZ kvíz</h1>
        <nav className="app__modes">
          <button
            type="button"
            className={`mode ${mode === 'play' ? 'mode--active' : ''}`}
            onClick={() => setMode('play')}
          >
            Hra
          </button>
          <button
            type="button"
            className={`mode ${mode === 'edit' ? 'mode--active' : ''}`}
            onClick={() => setMode('edit')}
          >
            Úprava
          </button>
        </nav>
      </header>

      <main className="app__main">
        {mode === 'play' ? (
          <PlayMode store={store} />
        ) : (
          <EditMode board={board} store={store} />
        )}
      </main>
    </div>
  )
}
