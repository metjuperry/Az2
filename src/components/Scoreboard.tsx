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

  return (
    <div className="scoreboard">
      <div className="scoreboard__players">
        {players.map((p) => {
          const info = PLAYERS[p]
          const isTurn = state.phase !== 'gameover' && state.current === p
          return (
            <div
              key={p}
              className={`scorecard ${isTurn ? 'scorecard--turn' : ''}`}
              style={{ borderColor: info.color }}
            >
              <span className="scorecard__swatch" style={{ background: info.color }} />
              <span className="scorecard__name">{info.name}</span>
              <span className="scorecard__count">{countOwned(state, p)}</span>
              {isTurn && <span className="scorecard__badge">na tahu</span>}
            </div>
          )
        })}
      </div>

      {state.phase === 'gameover' && state.winner && (
        <div className="scoreboard__winner" style={{ background: PLAYERS[state.winner].color }}>
          🏆 {PLAYERS[state.winner].name} vyhrává!
        </div>
      )}

      {state.phase === 'stealing' && <div className="scoreboard__steal">Šance na krádež!</div>}

      <button type="button" className="btn btn--ghost" onClick={onReset}>
        Nová hra
      </button>
    </div>
  )
}
