import { useEffect, useRef, useState } from 'react'
import { answersMatch, buildHint } from '../game/hint'
import { PLAYERS } from '../game/players'
import type { Player, QuestionEntry } from '../game/types'
import { isNarrowScreen, prefersReducedMotion } from '../lib/motion'

interface QuestionPanelProps {
  tileId: number
  entry: QuestionEntry | undefined
  stealing: boolean
  answeringPlayer: Player
  onResult: (correct: boolean) => void
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10.5 8.2 15 16 5.5" />
    </svg>
  )
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
      <path d="M5 5l10 10M15 5 5 15" />
    </svg>
  )
}

/** First letters stay visible; every `_` becomes an empty slot to fill. */
function Hint({ answer }: { answer: string }) {
  const hint = buildHint(answer)
  const words = hint.split(/\s+/).filter(Boolean)

  return (
    <span className="hint" role="img" aria-label={`Nápověda: ${hint}`}>
      {words.map((word, w) => (
        <span className="hint__word" key={w} aria-hidden="true">
          {Array.from(word).map((char, c) =>
            char === '_' ? (
              <span className="hint__slot" key={c} />
            ) : (
              <span className="hint__char" key={c}>
                {char}
              </span>
            ),
          )}
        </span>
      ))}
    </span>
  )
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
  const panelRef = useRef<HTMLElement>(null)

  // Reset the input whenever the open tile or the steal turn changes.
  useEffect(() => {
    setGuess('')
    setFeedback('none')
    setRevealed(false)
  }, [tileId, stealing])

  // On a phone the panel sits below the pyramid, so bring it into view.
  useEffect(() => {
    if (!isNarrowScreen()) return
    panelRef.current?.scrollIntoView({
      block: 'nearest',
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
  }, [tileId, stealing])

  const player = PLAYERS[answeringPlayer]

  if (!entry) {
    return (
      <section className={`panel panel--${answeringPlayer}`} ref={panelRef}>
        <p className="panel__missing">
          Pole {tileId} nemá zadanou otázku. Přepni do režimu Úprava a doplň ji.
        </p>
        <div className="panel__buttons">
          <button type="button" className="btn" onClick={() => onResult(false)}>
            Přeskočit (špatně)
          </button>
        </div>
      </section>
    )
  }

  const checkTyped = () => {
    if (answersMatch(guess, entry.answer)) {
      onResult(true)
    } else {
      setFeedback('wrong')
    }
  }

  return (
    <section className={`panel panel--${answeringPlayer}`} ref={panelRef} aria-live="polite">
      <header className="panel__header">
        <span className="panel__tile">
          <span className="sr-only">Pole </span>
          {tileId}
        </span>
        <p className="panel__who">
          <strong>{player.name}</strong>
          <span>{stealing ? 'zkouší krádež' : 'odpovídá'}</span>
        </p>
        {stealing && <span className="panel__tag">Šance na krádež!</span>}
      </header>

      <h2 className="panel__question">{entry.question}</h2>

      <p className="panel__hint">
        <span>Nápověda</span>
        <Hint answer={entry.answer} />
      </p>

      <div className="panel__answerRow">
        <input
          className="panel__input"
          type="text"
          placeholder="Napiš odpověď…"
          aria-label="Tvoje odpověď"
          value={guess}
          autoFocus
          autoComplete="off"
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
        <p className="panel__feedback" role="status">
          Napsaná odpověď nesedí. Zkus to znovu, nebo rozhodne moderátor.
        </p>
      )}

      <div className="panel__mod">
        <button type="button" className="panel__reveal" onClick={() => setRevealed((v) => !v)}>
          {revealed ? 'Skrýt odpověď' : 'Zobrazit odpověď (moderátor)'}
        </button>
        {revealed && <p className="panel__answer">Správná odpověď: {entry.answer}</p>}

        <div className="panel__buttons">
          <button type="button" className="btn btn--correct" onClick={() => onResult(true)}>
            <CheckIcon />
            Správně
          </button>
          <button type="button" className="btn" onClick={() => onResult(false)}>
            <CrossIcon />
            Špatně
          </button>
        </div>
      </div>
    </section>
  )
}
