import { Board } from './Board'
import type { Owner, Phase, Player } from './types'

/** Immutable snapshot of the game, handed to the React layer for rendering. */
export interface GameSnapshot {
  readonly owners: ReadonlyMap<number, Owner>
  readonly current: Player
  readonly phase: Phase
  readonly activeTileId: number | null
  readonly winner: Player | null
}

/**
 * The AZ kvíz state machine. Owns all game state and the rules for picking
 * tiles, answering, stealing and winning. Has no knowledge of React.
 */
export class Game {
  readonly board: Board
  private owners: Map<number, Owner>
  private current: Player
  private phase: Phase
  private activeTileId: number | null
  private winner: Player | null

  constructor(board: Board = new Board()) {
    this.board = board
    this.owners = new Map()
    this.current = 'A'
    this.phase = 'idle'
    this.activeTileId = null
    this.winner = null
  }

  /** Reset to a fresh game (player A starts). */
  reset(): void {
    this.owners = new Map()
    this.current = 'A'
    this.phase = 'idle'
    this.activeTileId = null
    this.winner = null
  }

  ownerOf(id: number): Owner {
    return this.owners.get(id) ?? null
  }

  isGameOver(): boolean {
    return this.phase === 'gameover'
  }

  /** A tile can be picked if the game is idle and it is not owned by a player. */
  canPick(id: number): boolean {
    if (this.phase !== 'idle') return false
    const owner = this.ownerOf(id)
    return owner === null || owner === 'black'
  }

  /** The player who may answer right now (current player, or opponent while stealing). */
  answeringPlayer(): Player {
    return this.phase === 'stealing' ? Game.opponent(this.current) : this.current
  }

  /**
   * Pick a tile to open its question. Only valid while idle.
   * Moves the game into the `answering` phase.
   */
  pickTile(id: number): void {
    if (!this.canPick(id)) return
    this.activeTileId = id
    this.phase = 'answering'
  }

  /**
   * Resolve the open question.
   * - While `answering`: correct → current player claims the tile; wrong → move
   *   to `stealing` so the opponent can attempt it.
   * - While `stealing`: correct → opponent claims the tile; wrong → tile goes
   *   black. Either way the turn then passes to the other player.
   */
  submitResult(correct: boolean): void {
    if (this.activeTileId === null) return

    if (this.phase === 'answering') {
      if (correct) {
        this.claim(this.current, this.activeTileId)
      } else {
        // Hand the same question to the opponent to steal.
        this.phase = 'stealing'
      }
      return
    }

    if (this.phase === 'stealing') {
      if (correct) {
        this.claim(Game.opponent(this.current), this.activeTileId)
      } else {
        this.owners.set(this.activeTileId, 'black')
        this.endTurn()
      }
    }
  }

  /** Assign a tile to a player, check for a win, then pass the turn. */
  private claim(player: Player, id: number): void {
    this.owners.set(id, player)

    if (this.board.connectsAllSides(this.ownedBy(player))) {
      this.winner = player
      this.phase = 'gameover'
      this.activeTileId = null
      return
    }

    this.endTurn()
  }

  /** Close the open question and pass the turn to the other player. */
  private endTurn(): void {
    this.activeTileId = null
    this.phase = 'idle'
    this.current = Game.opponent(this.current)
  }

  private ownedBy(player: Player): Set<number> {
    const ids = new Set<number>()
    for (const [id, owner] of this.owners) {
      if (owner === player) ids.add(id)
    }
    return ids
  }

  static opponent(player: Player): Player {
    return player === 'A' ? 'B' : 'A'
  }

  /** A read-only snapshot for rendering. */
  snapshot(): GameSnapshot {
    return {
      owners: new Map(this.owners),
      current: this.current,
      phase: this.phase,
      activeTileId: this.activeTileId,
      winner: this.winner,
    }
  }
}
