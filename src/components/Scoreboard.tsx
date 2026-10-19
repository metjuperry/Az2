import { Board } from '../game/Board'
import type { GameSnapshot } from '../game/Game'
import { PLAYERS } from '../game/players'
import type { Player } from '../game/types'
import { SideTriangle, type TouchedSides } from './SideTriangle'

interface ScoreboardProps {
  state: GameSnapshot
  onReset: () => void
}

function ownedIds(state: GameSnapshot, player: Player): Set<number> {
  const ids = new Set<number>()
  for (const [id, owner] of state.owners) if (owner === player) ids.add(id)
  return ids
}

function touchedSides(owned: Set<number>): TouchedSides {
  const touches = (side: readonly number[]) => side.some((id) => owned.has(id))
  return {
    left: touches(Board.SIDES.left),
    right: touches(Board.SIDES.right),
    bottom: touches(Board.SIDES.bottom),
  }
}

function sidesLabel(name: string, touched: TouchedSides): string {
  const names: string[] = []
  if (touched.left) names.push('levá')
  if (touched.right) names.push('pravá')
  if (touched.bottom) names.push('spodní')
  return `${name}: dotčené strany – ${names.length > 0 ? names.join(', ') : 'žádná'}`
}

export function Scoreboard({ state, onReset }: ScoreboardProps) {
  const players: Player[] = ['A', 'B']
  const gameOver = state.phase === 'gameover'

  return (
    <div className="scoreboard">
      <div className="scoreboard__players">
        {players.map((p) => {
          const info = PLAYERS[p]
          const owned = ownedIds(state, p)
          const touched = touchedSides(owned)
          const isTurn = !gameOver && state.current === p
          return (
            <div key={p} className={`scorecard scorecard--${p} ${isTurn ? 'scorecard--turn' : ''}`}>
              <div className="scorecard__top">
                <span className="scorecard__swatch" aria-hidden="true" />
                <span className="scorecard__name">{info.name}</span>
                {isTurn && <span className="scorecard__turn">Na tahu</span>}
              </div>
              <div className="scorecard__bottom">
                <span className="scorecard__count" aria-label={`Získaná pole: ${owned.size}`}>
                  {owned.size}
                </span>
                <SideTriangle touched={touched} label={sidesLabel(info.name, touched)} />
              </div>
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
