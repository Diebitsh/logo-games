import { splitWord, shuffleByDifficulty, buildRelativeQuestion } from './word-utils';

describe('splitWord', () => {
  it('делит слово по буквам в верхнем регистре', () => {
    expect(splitWord('собака')).toEqual(['С', 'О', 'Б', 'А', 'К', 'А']);
  });
  it('игнорирует пробелы по краям', () => {
    expect(splitWord('  кот ')).toEqual(['К', 'О', 'Т']);
  });
});

describe('shuffleByDifficulty', () => {
  it('easy меняет местами ровно две позиции', () => {
    const src = ['К', 'О', 'Т'];
    const out = shuffleByDifficulty(src, 'easy');
    expect(out.length).toBe(3);
    const diff = out.filter((c, i) => c !== src[i]).length;
    expect(diff).toBe(2);
  });
  it('hard перемешивает все позиции (для слова из 4+ разных букв результат отличается)', () => {
    const src = ['М', 'А', 'Р', 'К', 'А'];
    let changed = false;
    for (let i = 0; i < 20 && !changed; i++) {
      const out = shuffleByDifficulty(src, 'hard');
      if (out.join('') !== src.join('')) changed = true;
    }
    expect(changed).toBe(true);
  });
  it('не теряет и не добавляет буквы', () => {
    const src = ['С', 'Л', 'О', 'Н'];
    const out = shuffleByDifficulty(src, 'medium');
    expect([...out].sort()).toEqual([...src].sort());
  });
});

describe('buildRelativeQuestion', () => {
  it('строит вопрос про звук после заданного', () => {
    const q = buildRelativeQuestion(['С', 'О', 'Б', 'А', 'К', 'А'], 'Б', 'after');
    expect(q.text).toBe('Какой звук стоит после звука [Б]?');
    expect(q.correct).toBe('А');
    expect(q.options).toContain('А');
    expect(q.options.length).toBe(2);
  });
  it('строит вопрос про звук до заданного', () => {
    const q = buildRelativeQuestion(['С', 'О', 'Б', 'А', 'К', 'А'], 'Б', 'before');
    expect(q.text).toBe('Какой звук стоит до звука [Б]?');
    expect(q.correct).toBe('О');
  });
  it('возвращает null, если у звука нет соседа в нужную сторону', () => {
    expect(buildRelativeQuestion(['К', 'О', 'Т'], 'К', 'before')).toBeNull();
    expect(buildRelativeQuestion(['К', 'О', 'Т'], 'Т', 'after')).toBeNull();
  });
});
