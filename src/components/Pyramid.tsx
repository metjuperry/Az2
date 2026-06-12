import type { Board } from '../game/Board'
import type { GameSnapshot } from '../game/Game'
import { Tile } from './Tile'

interface PyramidProps {
  board: Board
  state: GameSnapshot
  onPick: (id: number) => void
}

export function Pyramid({ board, state, onPick }: PyramidProps) {
  const questionOpen = state.phase === 'answering' || state.phase === 'stealing'

  return (
    <div className="pyramid" role="grid" aria-label="AZ kvíz pyramida">
      {board.rows().map((row, rowIndex) => (
        <div className="pyramid__row" role="row" key={rowIndex}>
          {row.map((tile) => {
            const owner = state.owners.get(tile.id) ?? null
            const ownedByPlayer = owner === 'A' || owner === 'B'
            // While a question is open, nothing is clickable. Otherwise only
            // tiles not owned by a player can be picked (black is re-selectable).
            const disabled = questionOpen || state.phase === 'gameover' || ownedByPlayer
            return (
              <Tile
                key={tile.id}
                tile={tile}
                owner={owner}
                active={state.activeTileId === tile.id}
                disabled={disabled}
                onPick={onPick}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
