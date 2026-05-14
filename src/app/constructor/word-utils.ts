import { ShuffleDifficulty } from './custom-game.model';

/** Делит слово на буквы в верхнем регистре. */
export function splitWord(word: string): string[] {
  return word.trim().toUpperCase().split('');
}

/** Меняет местами две случайные различные позиции массива. */
function swapTwo(arr: string[]): void {
  if (arr.length < 2) return;
  const i = Math.floor(Math.random() * arr.length);
  let j = Math.floor(Math.random() * arr.length);
  while (j === i) j = Math.floor(Math.random() * arr.length);
  [arr[i], arr[j]] = [arr[j], arr[i]];
}

/**
 * Перемешивает буквы по сложности:
 * easy — одна перестановка (2 позиции), medium — три, hard — полное.
 */
export function shuffleByDifficulty(letters: string[], difficulty: ShuffleDifficulty): string[] {
  const out = [...letters];
  if (out.length < 2) return out;

  if (difficulty === 'hard') {
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  const swaps = difficulty === 'easy' ? 1 : 3;
  for (let s = 0; s < swaps; s++) swapTwo(out);
  return out;
}

export interface RelativeQuestion {
  text: string;
  correct: string;
  /** Правильный ответ + один отвлекающий, в порядке генерации. */
  options: string[];
}

/**
 * Строит вопрос «какой звук до/после [target]». Возвращает null, если
 * у целевой буквы нет соседа в нужную сторону.
 */
export function buildRelativeQuestion(
  letters: string[],
  target: string,
  direction: 'before' | 'after',
): RelativeQuestion | null {
  const idx = letters.indexOf(target.toUpperCase());
  if (idx < 0) return null;
  const neighborIdx = direction === 'after' ? idx + 1 : idx - 1;
  if (neighborIdx < 0 || neighborIdx >= letters.length) return null;

  const correct = letters[neighborIdx];
  const pool = letters.filter((_, i) => i !== neighborIdx && letters[i] !== correct);
  const distractor = pool.length
    ? pool[Math.floor(Math.random() * pool.length)]
    : correct === 'А' ? 'О' : 'А';

  const word = direction === 'after' ? 'после' : 'до';
  return {
    text: `Какой звук стоит ${word} звука [${target.toUpperCase()}]?`,
    correct,
    options: [correct, distractor],
  };
}
