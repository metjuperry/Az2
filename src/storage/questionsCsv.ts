import type { QuestionMap } from '../game/types'

const BOM = '﻿'
const HEADER = ['pole', 'otázka', 'odpověď']

const quote = (value: string): string =>
  /[",;\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value

/** Serialises the questions as UTF-8 CSV (BOM so Excel reads the diacritics). */
export function questionsToCsv(map: QuestionMap, tileCount: number): string {
  const lines = [HEADER.join(',')]
  for (let id = 1; id <= tileCount; id++) {
    const entry = map[id]
    lines.push([String(id), quote(entry?.question ?? ''), quote(entry?.answer ?? '')].join(','))
  }
  return BOM + lines.join('\r\n') + '\r\n'
}

/** Splits CSV text into rows of fields, honouring quoted fields. */
function parseRows(text: string, delimiter: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === delimiter) {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

/** Czech Excel saves CSV with `;`, so pick whichever the header line uses. */
function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ''
  const semicolons = (firstLine.match(/;/g) ?? []).length
  const commas = (firstLine.match(/,/g) ?? []).length
  return semicolons > commas ? ';' : ','
}

export interface CsvImport {
  map: QuestionMap
  warnings: string[]
}

/**
 * Parses an exported/hand-written CSV. Rows are `pole,otázka,odpověď`; the
 * header row is optional. Throws an Error with a user-readable message when
 * nothing usable is found.
 */
export function parseQuestionsCsv(text: string, tileCount: number): CsvImport {
  const clean = text.startsWith(BOM) ? text.slice(1) : text
  const rows = parseRows(clean, detectDelimiter(clean)).filter((r) => r.some((f) => f.trim()))
  const map: QuestionMap = {}
  const warnings: string[] = []

  for (const [index, row] of rows.entries()) {
    const id = Number(row[0]?.trim())
    if (!Number.isInteger(id)) {
      // The header (or any leading non-numeric row) is silently skipped.
      if (index > 0) warnings.push(`Řádek ${index + 1} přeskočen: neplatné číslo pole.`)
      continue
    }
    if (id < 1 || id > tileCount) {
      warnings.push(`Řádek ${index + 1} přeskočen: pole ${id} neexistuje (1–${tileCount}).`)
      continue
    }
    if (map[id]) warnings.push(`Pole ${id} je v souboru víckrát, platí poslední řádek.`)
    map[id] = { question: (row[1] ?? '').trim(), answer: (row[2] ?? '').trim() }
  }

  if (Object.keys(map).length === 0) {
    throw new Error('V souboru nebyly nalezeny žádné otázky. Očekávané sloupce: pole, otázka, odpověď.')
  }
  return { map, warnings }
}
