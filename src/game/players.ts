import type { Player } from './types'

export interface PlayerInfo {
  readonly name: string
  readonly color: string
}

/**
 * Display metadata for each player. The colours mirror the `--red` and
 * `--blue` tokens in styles.css, which is what the UI actually paints with.
 */
export const PLAYERS: Record<Player, PlayerInfo> = {
  A: { name: 'Hráč 1', color: '#e23d52' }, // red
  B: { name: 'Hráč 2', color: '#2a63e6' }, // blue
}
