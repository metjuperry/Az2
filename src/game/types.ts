// Shared domain types for the AZ kvíz game.

/** The two competing players. */
export type Player = 'A' | 'B'

/**
 * Who owns a given tile.
 * - `'A'` / `'B'`: claimed by that player.
 * - `'black'`: nobody answered correctly; tile is permanently blocked.
 * - `null`: still free.
 */
export type Owner = Player | 'black' | null

/**
 * Where the game currently is in the answer flow.
 * - `idle`: waiting for the current player to pick a tile.
 * - `answering`: the current player is answering their chosen tile.
 * - `stealing`: the current player missed; the opponent may steal.
 * - `gameover`: someone has connected all three sides.
 */
export type Phase = 'idle' | 'answering' | 'stealing' | 'gameover'

/** A single tile of the pyramid. */
export interface Tile {
  /** Sequential id, 1–15. Also used as the visible label. */
  readonly id: number
  /** Visible label (string form of the id). */
  readonly label: string
  /** Zero-based row index (0 = apex, 4 = bottom). */
  readonly row: number
  /** Zero-based column index within the row. */
  readonly col: number
}

/** An authored question/answer pair for one tile. */
export interface QuestionEntry {
  question: string
  answer: string
}

/** Map of tile id → its authored question/answer. */
export type QuestionMap = Record<number, QuestionEntry>

/** The three sides of the triangular board, by tile id. */
export interface Sides {
  readonly left: readonly number[]
  readonly right: readonly number[]
  readonly bottom: readonly number[]
}
