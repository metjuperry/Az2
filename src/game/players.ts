import type { Player } from './types'

export interface PlayerInfo {
  readonly name: string
  readonly color: string
}

/** Display metadata for each player. */
export const PLAYERS: Record<Player, PlayerInfo> = {
  A: { name: 'Hráč 1', color: '#e63946' }, // red
  B: { name: 'Hráč 2', color: '#1d6fe0' }, // blue
}
