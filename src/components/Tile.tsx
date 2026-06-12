import { PLAYERS } from '../game/players'
import type { Owner, Tile as TileModel } from '../game/types'

interface TileProps {
  tile: TileModel
  owner: Owner
  active: boolean
  disabled: boolean
  onPick: (id: number) => void
}

function ownerStyle(owner: Owner): React.CSSProperties {
  if (owner === 'A' || owner === 'B') {
    return { background: PLAYERS[owner].color, color: '#fff', borderColor: PLAYERS[owner].color }
  }
  if (owner === 'black') {
    return { background: '#1a1a1a', color: '#777', borderColor: '#1a1a1a' }
  }
  return {}
}

export function Tile({ tile, owner, active, disabled, onPick }: TileProps) {
  const className = ['tile', active ? 'tile--active' : '', owner === null ? 'tile--free' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      className={className}
      style={ownerStyle(owner)}
      disabled={disabled}
      onClick={() => onPick(tile.id)}
      aria-label={`Pole ${tile.label}`}
    >
      {tile.label}
    </button>
  )
}
