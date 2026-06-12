import { useState } from 'react'
import type { Board } from '../game/Board'
import type { QuestionMap } from '../game/types'
import type { QuestionStore } from '../storage/QuestionStore'

interface EditModeProps {
  board: Board
  store: QuestionStore
}

export function EditMode({ board, store }: EditModeProps) {
  const [map, setMap] = useState<QuestionMap>(() => store.load())

  const update = (id: number, field: 'question' | 'answer', value: string) => {
    const current = map[id] ?? { question: '', answer: '' }
    const entry = { ...current, [field]: value }
    const next = { ...map, [id]: entry }
    setMap(next)
    store.set(id, entry)
  }

  return (
    <div className="edit">
      <p className="edit__intro">
        Uprav otázky a správné odpovědi pro jednotlivá pole. Změny se ukládají
        automaticky do tohoto prohlížeče.
      </p>

      <div className="edit__list">
        {board.tiles.map((tile) => {
          const entry = map[tile.id]
          const incomplete = !entry?.question?.trim() || !entry?.answer?.trim()
          return (
            <div key={tile.id} className={`edit__row ${incomplete ? 'edit__row--incomplete' : ''}`}>
              <div className="edit__id">{tile.label}</div>
              <div className="edit__fields">
                <label className="edit__field">
                  <span>Otázka</span>
                  <input
                    type="text"
                    value={entry?.question ?? ''}
                    placeholder="Zadej otázku…"
                    onChange={(e) => update(tile.id, 'question', e.target.value)}
                  />
                </label>
                <label className="edit__field">
                  <span>Odpověď</span>
                  <input
                    type="text"
                    value={entry?.answer ?? ''}
                    placeholder="Zadej správnou odpověď…"
                    onChange={(e) => update(tile.id, 'answer', e.target.value)}
                  />
                </label>
              </div>
              {incomplete && <span className="edit__flag" title="Chybí otázka nebo odpověď">!</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
