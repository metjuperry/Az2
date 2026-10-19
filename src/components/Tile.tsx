import { PLAYERS } from '../game/players'
import type { Owner, Tile as TileModel } from '../game/types'

interface TileProps {
  tile: TileModel
  owner: Owner
  active: boolean
  disabled: boolean
  onPick: (id: number) => void
}

function describe(label: string, owner: Owner, active: boolean): string {
  if (owner === 'A' || owner === 'B') return `Pole ${label}, získal ${PLAYERS[owner].name}`
  if (owner === 'black') return `Pole ${label}, nikdo neodpověděl správně`
  if (active) return `Pole ${label}, otázka je otevřená`
  return `Pole ${label}`
}

export function Tile({ tile, owner, active, disabled, onPick }: TileProps) {
  const className = [
    'tile',
    owner === null ? 'tile--free' : `tile--${owner}`,
    active ? 'tile--active' : '',
    disabled && owner === null && !active ? 'tile--locked' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      className={className}
      disabled={disabled}
      onClick={() => onPick(tile.id)}
      aria-label={describe(tile.label, owner, active)}
    >
      <span className="tile__face" aria-hidden="true">
        {tile.label}
      </span>
    </button>
  )
}
