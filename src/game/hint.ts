/**
 * Build a first-letter hint for an answer: keep the first character of every
 * word, replace the rest with `_`. Punctuation/whitespace is preserved.
 *
 * `"Karel Čapek"` → `"K____ Č____"`
 */
export function buildHint(answer: string): string {
  let result = ''
  let atWordStart = true

  for (const char of answer) {
    if (/\s/.test(char)) {
      result += char
      atWordStart = true
    } else if (/[\p{L}\p{N}]/u.test(char)) {
      result += atWordStart ? char : '_'
      atWordStart = false
    } else {
      // Punctuation (hyphen, apostrophe, …): keep it, and the next letter
      // counts as a new word start.
      result += char
      atWordStart = true
    }
  }

  return result
}

/**
 * Normalize a string for forgiving comparison: lowercase, strip diacritics,
 * collapse whitespace, trim.
 */
export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '') // strip combining diacritical marks
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/** True if `guess` matches `answer` ignoring case, diacritics and extra space. */
export function answersMatch(guess: string, answer: string): boolean {
  const a = normalize(guess)
  return a.length > 0 && a === normalize(answer)
}
