import { useRef, useState } from 'react'
import type { Board } from '../game/Board'
import type { QuestionMap } from '../game/types'
import type { QuestionStore } from '../storage/QuestionStore'
import { prefersReducedMotion } from '../lib/motion'
import { parseQuestionsCsv, questionsToCsv } from '../storage/questionsCsv'

interface EditModeProps {
  board: Board
  store: QuestionStore
}

const isComplete = (entry: { question?: string; answer?: string } | undefined): boolean =>
  Boolean(entry?.question?.trim() && entry?.answer?.trim())

export function EditMode({ board, store }: EditModeProps) {
  const [map, setMap] = useState<QuestionMap>(() => store.load())

  const update = (id: number, field: 'question' | 'answer', value: string) => {
    const current = map[id] ?? { question: '', answer: '' }
    const entry = { ...current, [field]: value }
    const next = { ...map, [id]: entry }
    setMap(next)
    store.set(id, entry)
  }

  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const total = board.tiles.length

  const exportCsv = () => {
    const blob = new Blob([questionsToCsv(map, total)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'az-kviz-otazky.csv'
    link.click()
    URL.revokeObjectURL(url)
    setStatus({ kind: 'ok', text: 'Otázky byly exportovány do az-kviz-otazky.csv.' })
  }

  const importCsv = async (file: File) => {
    try {
      const { map: imported, warnings } = parseQuestionsCsv(await file.text(), total)
      const count = Object.keys(imported).length
      if (!window.confirm(`Importem se nahradí všechny současné otázky (${count} z ${total} polí v souboru). Pokračovat?`)) {
        return
      }
      store.save(imported)
      setMap(store.load())
      setStatus({
        kind: 'ok',
        text: `Importováno ${count} polí.${warnings.length ? ` ${warnings.join(' ')}` : ''}`,
      })
    } catch (error) {
      setStatus({ kind: 'error', text: error instanceof Error ? error.message : 'Soubor se nepodařilo načíst.' })
    }
  }
  const done = board.tiles.filter((tile) => isComplete(map[tile.id])).length

  const jumpTo = (id: number) => {
    const input = document.getElementById(`q-${id}`)
    if (!input) return
    input.scrollIntoView({
      block: 'center',
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
    input.focus({ preventScroll: true })
  }

  return (
    <div className="edit">
      <div className="edit__head">
        <p className="edit__intro">
          Uprav otázky a správné odpovědi pro jednotlivá pole. Změny se ukládají automaticky do
          tohoto prohlížeče.
        </p>
        <div className="progress" role="status">
          <p className="progress__text">
            {done} z {total} polí je hotových
          </p>
          <div className="progress__track" aria-hidden="true">
            <div
              className={`progress__fill ${done === total ? 'progress__fill--done' : ''}`}
              style={{ '--pct': `${(done / total) * 100}%` } as React.CSSProperties}
            />
          </div>
        </div>
      </div>

      <div className="edit__file">
        <button type="button" className="btn btn--ghost" onClick={exportCsv}>
          Exportovat (CSV)
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => fileInput.current?.click()}>
          Importovat (CSV)
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".csv,text/csv"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (file) void importCsv(file)
          }}
        />
        {status && (
          <p className={`edit__status edit__status--${status.kind}`} role="status">
            {status.text}
          </p>
        )}
      </div>

      <div className="edit__layout">
        <aside className="edit__map">
          <div className="mini" role="group" aria-label="Přejít na pole">
            {board.rows().map((row, rowIndex) => (
              <div className="mini__row" key={rowIndex}>
                {row.map((tile) => {
                  const complete = isComplete(map[tile.id])
                  return (
                    <button
                      key={tile.id}
                      type="button"
                      className={`mini__tile ${complete ? '' : 'mini__tile--todo'}`}
                      onClick={() => jumpTo(tile.id)}
                      aria-label={`Pole ${tile.label}${complete ? '' : ', chybí zadání'}`}
                    >
                      {tile.label}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
          <ul className="legend">
            <li>
              <span className="legend__swatch" aria-hidden="true" />
              Hotovo
            </li>
            <li>
              <span className="legend__swatch legend__swatch--todo" aria-hidden="true" />
              Chybí zadání
            </li>
          </ul>
        </aside>

        <div className="edit__list">
          <div className="edit__cols" aria-hidden="true">
            <span>Otázka</span>
            <span>Odpověď</span>
          </div>

          {board.tiles.map((tile) => {
            const entry = map[tile.id]
            const complete = isComplete(entry)
            return (
              <div key={tile.id} className={`edit__row ${complete ? '' : 'edit__row--incomplete'}`}>
                <div className="edit__id" title={complete ? undefined : 'Chybí otázka nebo odpověď'}>
                  {tile.label}
                </div>
                <input
                  id={`q-${tile.id}`}
                  className="edit__input"
                  type="text"
                  value={entry?.question ?? ''}
                  placeholder="Zadej otázku…"
                  aria-label={`Otázka k poli ${tile.label}`}
                  onChange={(e) => update(tile.id, 'question', e.target.value)}
                />
                <input
                  className="edit__input"
                  type="text"
                  value={entry?.answer ?? ''}
                  placeholder="Zadej správnou odpověď…"
                  aria-label={`Odpověď k poli ${tile.label}`}
                  onChange={(e) => update(tile.id, 'answer', e.target.value)}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
