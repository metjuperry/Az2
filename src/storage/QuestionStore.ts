import type { QuestionEntry, QuestionMap } from '../game/types'

/** Default Czech questions so the game is playable before any editing. */
const DEFAULT_QUESTIONS: QuestionMap = {
  1: { question: 'Hlavní město České republiky?', answer: 'Praha' },
  2: { question: 'Kolik má člověk prstů na jedné ruce?', answer: 'Pět' },
  3: { question: 'Autor díla R.U.R., který zavedl slovo robot?', answer: 'Karel Čapek' },
  4: { question: 'Nejvyšší hora České republiky?', answer: 'Sněžka' },
  5: { question: 'Jaké barvy je česká vlajka kromě bílé a červené?', answer: 'Modrá' },
  6: { question: 'Řeka protékající Prahou?', answer: 'Vltava' },
  7: { question: 'Kolik je hráčů ve fotbalovém týmu na hřišti?', answer: 'Jedenáct' },
  8: { question: 'Planeta nejblíže Slunci?', answer: 'Merkur' },
  9: { question: 'Chemická značka zlata?', answer: 'Au' },
  10: { question: 'Měna používaná v České republice?', answer: 'Koruna' },
  11: { question: 'Největší oceán na Zemi?', answer: 'Tichý oceán' },
  12: { question: 'Kdo napsal Babičku?', answer: 'Božena Němcová' },
  13: { question: 'Kolik měsíců má rok?', answer: 'Dvanáct' },
  14: { question: 'Hlavní město Slovenska?', answer: 'Bratislava' },
  15: { question: 'Jak se jmenuje nejdelší řeka světa?', answer: 'Nil' },
}

const STORAGE_KEY = 'azkviz.questions'

/**
 * Persists the authored questions in `localStorage`. Falls back to a built-in
 * default set, and tolerates a missing/blocked `localStorage` (e.g. SSR or
 * privacy mode) by keeping an in-memory copy.
 */
export class QuestionStore {
  private cache: QuestionMap

  constructor() {
    this.cache = this.read()
  }

  private read(): QuestionMap {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return { ...DEFAULT_QUESTIONS }
      const parsed = JSON.parse(raw) as QuestionMap
      // Merge over defaults so newly added default tiles still appear.
      return { ...DEFAULT_QUESTIONS, ...parsed }
    } catch {
      return { ...DEFAULT_QUESTIONS }
    }
  }

  /** Current question map (a copy, safe to read). */
  load(): QuestionMap {
    return { ...this.cache }
  }

  get(id: number): QuestionEntry | undefined {
    return this.cache[id]
  }

  /** Replace the whole map and persist. */
  save(map: QuestionMap): void {
    this.cache = { ...map }
    this.persist()
  }

  /** Update a single tile and persist. */
  set(id: number, entry: QuestionEntry): void {
    this.cache = { ...this.cache, [id]: entry }
    this.persist()
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cache))
    } catch {
      // Ignore write failures (storage disabled/full); cache still works.
    }
  }
}
