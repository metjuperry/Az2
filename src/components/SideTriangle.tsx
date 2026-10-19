export interface TouchedSides {
  left: boolean
  right: boolean
  bottom: boolean
}

interface SideTriangleProps {
  touched: TouchedSides
  label: string
}

const EDGES = [
  { key: 'left', d: 'M22 5 L5 35' },
  { key: 'right', d: 'M22 5 L39 35' },
  { key: 'bottom', d: 'M5 35 L39 35' },
] as const

/**
 * A tiny pyramid outline whose three edges light up as a player gets a tile
 * onto that side of the board. Winning means joining all three in one chain.
 */
export function SideTriangle({ touched, label }: SideTriangleProps) {
  // Draw lit edges last so their round caps sit on top at the corners.
  const ordered = [...EDGES].sort((a, b) => Number(touched[a.key]) - Number(touched[b.key]))

  return (
    <svg className="sides" viewBox="0 0 44 40" role="img" aria-label={label}>
      {ordered.map((edge) => (
        <path
          key={edge.key}
          d={edge.d}
          className={`sides__edge ${touched[edge.key] ? 'sides__edge--on' : ''}`}
        />
      ))}
    </svg>
  )
}
