import type { Sides, Tile } from './types'

/**
 * Geometry of the AZ kvíz pyramid: a triangle of 5 rows (1+2+3+4+5 = 15 tiles),
 * numbered sequentially 1–15 top to bottom, left to right.
 *
 * Pure geometry only — no game state lives here.
 */
export class Board {
  static readonly ROWS = 5

  /** Tile ids that make up each side of the triangle. */
  static readonly SIDES: Sides = {
    left: [1, 2, 4, 7, 11],
    right: [1, 3, 6, 10, 15],
    bottom: [11, 12, 13, 14, 15],
  }

  readonly tiles: readonly Tile[]

  private readonly byId: Map<number, Tile>
  /** Lookup from "row,col" → tile id. */
  private readonly byCoord: Map<string, number>

  constructor() {
    const tiles: Tile[] = []
    const byId = new Map<number, Tile>()
    const byCoord = new Map<string, number>()

    let id = 1
    for (let row = 0; row < Board.ROWS; row++) {
      for (let col = 0; col <= row; col++) {
        const tile: Tile = { id, label: String(id), row, col }
        tiles.push(tile)
        byId.set(id, tile)
        byCoord.set(Board.key(row, col), id)
        id++
      }
    }

    this.tiles = tiles
    this.byId = byId
    this.byCoord = byCoord
  }

  private static key(row: number, col: number): string {
    return `${row},${col}`
  }

  get(id: number): Tile {
    const tile = this.byId.get(id)
    if (!tile) throw new Error(`No tile with id ${id}`)
    return tile
  }

  /** Tiles grouped by row, for rendering the triangle. */
  rows(): Tile[][] {
    const rows: Tile[][] = Array.from({ length: Board.ROWS }, () => [])
    for (const tile of this.tiles) rows[tile.row].push(tile)
    return rows
  }

  /** Ids of tiles adjacent to `id` in the triangular grid. */
  neighbors(id: number): number[] {
    const { row, col } = this.get(id)
    const candidates: Array<[number, number]> = [
      [row, col - 1],
      [row, col + 1],
      [row - 1, col - 1],
      [row - 1, col],
      [row + 1, col],
      [row + 1, col + 1],
    ]

    const result: number[] = []
    for (const [r, c] of candidates) {
      const neighbor = this.byCoord.get(Board.key(r, c))
      if (neighbor !== undefined) result.push(neighbor)
    }
    return result
  }

  /**
   * True if the owned tiles form a single connected component (triangular
   * adjacency) that touches all three sides of the triangle.
   */
  connectsAllSides(ownedIds: Set<number>): boolean {
    if (ownedIds.size === 0) return false

    const seen = new Set<number>()

    for (const start of ownedIds) {
      if (seen.has(start)) continue

      // Flood-fill this connected component, tracking which sides it touches.
      let touchesLeft = false
      let touchesRight = false
      let touchesBottom = false
      const queue: number[] = [start]
      seen.add(start)

      while (queue.length > 0) {
        const id = queue.pop()!
        if (Board.SIDES.left.includes(id)) touchesLeft = true
        if (Board.SIDES.right.includes(id)) touchesRight = true
        if (Board.SIDES.bottom.includes(id)) touchesBottom = true

        for (const next of this.neighbors(id)) {
          if (ownedIds.has(next) && !seen.has(next)) {
            seen.add(next)
            queue.push(next)
          }
        }
      }

      if (touchesLeft && touchesRight && touchesBottom) return true
    }

    return false
  }
}
