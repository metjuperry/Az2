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
        <h1 className="brand">
          <span className="brand__mark" aria-hidden="true">
            AZ
          </span>
          <span>
            <span className="sr-only">AZ </span>kvíz
          </span>
        </h1>
        <nav className="modes" aria-label="Režim">
          <button
            type="button"
            className="mode"
            aria-pressed={mode === 'play'}
            onClick={() => setMode('play')}
          >
            Hra
          </button>
          <button
            type="button"
            className="mode"
            aria-pressed={mode === 'edit'}
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
