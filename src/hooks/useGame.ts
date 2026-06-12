import { useCallback, useMemo, useState } from 'react'
import { Game, type GameSnapshot } from '../game/Game'

export interface UseGame {
  game: Game
  state: GameSnapshot
  pickTile: (id: number) => void
  submitResult: (correct: boolean) => void
  reset: () => void
}

/**
 * Wraps a single `Game` instance in React state. The `Game` is mutable, so we
 * keep an immutable `snapshot` in state and bump it after every action to
 * trigger a re-render.
 */
export function useGame(): UseGame {
  const game = useMemo(() => new Game(), [])
  const [state, setState] = useState<GameSnapshot>(() => game.snapshot())

  const sync = useCallback(() => setState(game.snapshot()), [game])

  const pickTile = useCallback(
    (id: number) => {
      game.pickTile(id)
      sync()
    },
    [game, sync],
  )

  const submitResult = useCallback(
    (correct: boolean) => {
      game.submitResult(correct)
      sync()
    },
    [game, sync],
  )

  const reset = useCallback(() => {
    game.reset()
    sync()
  }, [game, sync])

  return { game, state, pickTile, submitResult, reset }
}
