import type { QuestionStore } from '../storage/QuestionStore'
import { useGame } from '../hooks/useGame'
import { Pyramid } from './Pyramid'
import { QuestionPanel } from './QuestionPanel'
import { Scoreboard } from './Scoreboard'

interface PlayModeProps {
  store: QuestionStore
}

export function PlayMode({ store }: PlayModeProps) {
  const { game, state, pickTile, submitResult, reset } = useGame()

  const questionOpen = state.phase === 'answering' || state.phase === 'stealing'

  return (
    <div className="play">
      <div className="play__board">
        <Pyramid board={game.board} state={state} onPick={pickTile} />
        <p className="play__hint-legend">
          Spoj všechny tři strany pyramidy svou barvou a vyhraj.
        </p>
      </div>

      <aside className="play__side">
        <Scoreboard state={state} onReset={reset} />

        {questionOpen && state.activeTileId !== null ? (
          <QuestionPanel
            tileId={state.activeTileId}
            entry={store.get(state.activeTileId)}
            stealing={state.phase === 'stealing'}
            answeringPlayer={game.answeringPlayer()}
            onResult={submitResult}
          />
        ) : (
          state.phase === 'idle' && (
            <p className="play__prompt">Vyber pole na pyramidě a odpověz na otázku.</p>
          )
        )}
      </aside>
    </div>
  )
}
