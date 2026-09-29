import { useEffect, useState } from 'react'
import { answersMatch, buildHint } from '../game/hint'
import { PLAYERS } from '../game/players'
import type { Player, QuestionEntry } from '../game/types'

interface QuestionPanelProps {
  tileId: number
  entry: QuestionEntry | undefined
  stealing: boolean
  answeringPlayer: Player
  onResult: (correct: boolean) => void
}

export function QuestionPanel({
  tileId,
  entry,
  stealing,
  answeringPlayer,
  onResult,
}: QuestionPanelProps) {
  const [guess, setGuess] = useState('')
  const [feedback, setFeedback] = useState<'none' | 'wrong'>('none')
  const [revealed, setRevealed] = useState(false)

  // Reset the input whenever the open tile or the steal turn changes.
  useEffect(() => {
    setGuess('')
    setFeedback('none')
    setRevealed(false)
  }, [tileId, stealing])

  if (!entry) {
    return (
      <div className="panel">
        <p className="panel__missing">
          Pole {tileId} nemá zadanou otázku. Přepni do režimu Úprava a doplň ji.
        </p>
        <div className="panel__buttons">
          <button type="button" className="btn btn--wrong" onClick={() => onResult(false)}>
            Přeskočit (špatně)
          </button>
        </div>
      </div>
    )
  }

  const player = PLAYERS[answeringPlayer]

  const checkTyped = () => {
    if (answersMatch(guess, entry.answer)) {
      onResult(true)
    } else {
      setFeedback('wrong')
    }
  }

  return (
    <div className="panel" style={{ borderColor: player.color }}>
      <div className="panel__header">
        <span className="panel__tile" style={{ background: player.color }}>
          {tileId}
        </span>
        <span>
          {stealing ? 'Pokus o krádež — ' : 'Na tahu — '}
          <strong style={{ color: player.color }}>{player.name}</strong>
        </span>
      </div>

      <p className="panel__question">{entry.question}</p>

      <p className="panel__hint">
        Nápověda: <code>{buildHint(entry.answer)}</code>
      </p>

      <div className="panel__answerRow">
        <input
          className="panel__input"
          type="text"
          placeholder="Napiš odpověď…"
          value={guess}
          autoFocus
          onChange={(e) => {
            setGuess(e.target.value)
            setFeedback('none')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') checkTyped()
          }}
        />
        <button type="button" className="btn" onClick={checkTyped}>
          Zkontrolovat
        </button>
      </div>

      {feedback === 'wrong' && (
        <p className="panel__feedback">
          Napsaná odpověď nesedí. Zkus to znovu, nebo rozhodne moderátor.
        </p>
      )}

      <button type="button" className="panel__reveal" onClick={() => setRevealed((v) => !v)}>
        {revealed ? 'Skrýt odpověď' : 'Zobrazit odpověď (moderátor)'}
      </button>
      {revealed && <p className="panel__answer">Správná odpověď: {entry.answer}</p>}

      <div className="panel__buttons">
        <button type="button" className="btn btn--correct" onClick={() => onResult(true)}>
          ✓ Správně
        </button>
        <button type="button" className="btn btn--wrong" onClick={() => onResult(false)}>
          ✗ Špatně
        </button>
      </div>
    </div>
  )
}
