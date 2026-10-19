import type { GameSnapshot } from '../game/Game'
import { PLAYERS } from '../game/players'
import type { Player } from '../game/types'

interface ScoreboardProps {
  state: GameSnapshot
  onReset: () => void
}

function countOwned(state: GameSnapshot, player: Player): number {
  let n = 0
  for (const owner of state.owners.values()) if (owner === player) n++
  return n
}

export function Scoreboard({ state, onReset }: ScoreboardProps) {
  const players: Player[] = ['A', 'B']
  const gameOver = state.phase === 'gameover'

  return (
    <div className="scoreboard">
      <div className="scoreboard__players">
        {players.map((p) => {
          const info = PLAYERS[p]
          const count = countOwned(state, p)
          const isTurn = !gameOver && state.current === p
          return (
            <div key={p} className={`scorecard scorecard--${p} ${isTurn ? 'scorecard--turn' : ''}`}>
              <div className="scorecard__top">
                <span className="scorecard__swatch" aria-hidden="true" />
                <span className="scorecard__name">{info.name}</span>
                {isTurn && <span className="scorecard__turn">Na tahu</span>}
              </div>
              <span className="scorecard__count" aria-label={`Získaná pole: ${count}`}>
                {count}
              </span>
            </div>
          )
        })}
      </div>

      {gameOver && state.winner && (
        <div
          className={`scoreboard__winner scoreboard__winner--${state.winner}`}
          role="status"
        >
          {PLAYERS[state.winner].name} vyhrává!
        </div>
      )}

      <button
        type="button"
        className={`btn ${gameOver ? 'btn--primary' : 'btn--ghost'}`}
        onClick={onReset}
      >
        Nová hra
      </button>
    </div>
  )
}
