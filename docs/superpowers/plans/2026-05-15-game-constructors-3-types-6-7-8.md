# Конструкторы игр — План 3: типы 6, 7, 8

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Реализовать конструктор и игровой режим для типов 8 (замена/перестановка звука), 7 (место звука по отношению к другим) и 6 (сборка слова из звуков), затем провести сквозную проверку юзабилити.

**Architecture:** Те же базы `BaseConstructor`/`BasePlayerMode`, что и в Плане 2. Тип 7 использует `buildRelativeQuestion` из `word-utils`, тип 6 — `splitWord` и `shuffleByDifficulty`. Тип 6 — единственный с интерактивной механикой (перетаскивание букв в слоты).

**Tech Stack:** Angular 21 (standalone, signals, `@for`/`@if`), TypeScript 5.9, SCSS-токены из `src/styles.scss`.

**Зависит от Планов 1 и 2.** Требует: модель, `word-utils`, `BaseConstructor`/`BasePlayerMode`, общие компоненты и стили, каркасы host/player.

---

### Task 1: Тип 8 — замена/перестановка звука

**Files:**
- Create: `src/app/constructor/types/type8-word-change.constructor.ts`, `.html`
- Create: `src/app/constructor/types/type8-word-change.player.ts`, `.html`
- Modify: `src/app/constructor/constructor-host.component.ts`, `.html`
- Modify: `src/app/constructor/custom-player.component.ts`, `.html`

- [ ] **Step 1: Создать конструктор `type8-word-change.constructor.ts`**

```ts
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseConstructor } from '../shared/base-constructor';
import { AssetDropComponent } from '../shared/asset-drop.component';
import { SoundPickerComponent } from '../shared/sound-picker.component';
import { ConstructorStep } from '../constructor-type';
import {
  CustomGameAsset, SOUND_GROUPS, WordChangeGame, WordChangeLevel,
} from '../custom-game.model';

/** Плоский список всех звуков — для выбора вставляемого звука. */
const ALL_SOUNDS: string[] = SOUND_GROUPS.flatMap((g) => g.sounds.map((s) => s.char));

@Component({
  selector: 'app-type8-word-change-constructor',
  standalone: true,
  imports: [FormsModule, AssetDropComponent, SoundPickerComponent],
  templateUrl: './type8-word-change.constructor.html',
})
export class Type8WordChangeConstructor extends BaseConstructor {
  readonly steps: ConstructorStep[] = [
    { id: 'sound', label: 'Звук' },
    { id: 'levels', label: 'Контент' },
    { id: 'meta', label: 'Сохранение' },
  ];

  readonly allSounds = ALL_SOUNDS;

  sound = signal<string[]>([]);
  levels = signal<WordChangeLevel[]>([{ id: 1, sourceWord: '', insertSound: '' }]);
  name = signal('');
  description = signal('');

  soundChar = computed(() => this.sound()[0] ?? '');

  stepValid(index: number): boolean {
    if (index === 0) return this.sound().length === 1;
    if (index === 1) {
      return this.levels().some(
        (l) => l.sourceWord.trim() && l.insertSound && l.resultImage,
      );
    }
    return this.name().trim().length > 0;
  }

  build(): Omit<WordChangeGame, 'id' | 'createdAt' | 'updatedAt' | 'schema'> {
    return {
      type: 8,
      name: this.name().trim(),
      description: this.description().trim() || undefined,
      sound: this.soundChar(),
      levels: this.levels()
        .filter((l) => l.sourceWord.trim() && l.insertSound && l.resultImage)
        .map((l) => ({ ...l, sourceWord: l.sourceWord.trim() })),
    };
  }

  addLevel(): void {
    this.levels.update((arr) => [
      ...arr,
      { id: this.nextLevelId(arr), sourceWord: '', insertSound: '' },
    ]);
  }
  removeLevel(id: number): void {
    this.levels.update((arr) => arr.filter((l) => l.id !== id));
  }
  setWord(id: number, sourceWord: string): void {
    this.levels.update((arr) =>
      arr.map((l) => (l.id === id ? { ...l, sourceWord } : l)),
    );
  }
  setInsertSound(id: number, insertSound: string): void {
    this.levels.update((arr) =>
      arr.map((l) => (l.id === id ? { ...l, insertSound } : l)),
    );
  }
  setImage(id: number, asset: CustomGameAsset): void {
    this.levels.update((arr) =>
      arr.map((l) => (l.id === id ? { ...l, resultImage: asset } : l)),
    );
  }
}
```

- [ ] **Step 2: Создать шаблон `type8-word-change.constructor.html`**

```html
@if (steps[stepIndex()].id === 'sound') {
  <div class="ctor-step">
    <h2>Выберите звук</h2>
    <p class="muted">С каким звуком будет работа. Мягкие звуки помечены пунктиром.</p>
    <app-sound-picker mode="single" [(selected)]="sound" />
  </div>
}

@if (steps[stepIndex()].id === 'levels') {
  <div class="ctor-step">
    <h2>Загрузите контент</h2>
    <p class="muted">
      Искомое слово, звук, который нужно вставить, и картинка получившегося слова.
    </p>
    <div class="ctor-levels">
      @for (level of levels(); track level.id; let i = $index) {
        <article class="ctor-level">
          <header class="ctor-level__head">
            <span>Задание №{{ i + 1 }}</span>
            @if (levels().length > 1) {
              <button type="button" class="ctor-icon-btn" (click)="removeLevel(level.id)" aria-label="Удалить">
                <i class="fi fi-rr-trash"></i>
              </button>
            }
          </header>
          <label class="ctor-field">
            <span>Искомое слово (которое будем изменять)</span>
            <input type="text" [ngModel]="level.sourceWord"
              (ngModelChange)="setWord(level.id, $event)" placeholder="например, кот" />
          </label>
          <div class="ctor-field">
            <span>Какой звук нужно вставить</span>
            <div class="ctor-toggle-group">
              @for (s of allSounds; track s) {
                <button type="button" class="ctor-toggle" [class.active]="level.insertSound === s"
                  (click)="setInsertSound(level.id, s)">{{ s }}</button>
              }
            </div>
          </div>
          <div class="ctor-answer-col">
            <span class="ctor-pill">Картинка получившегося слова</span>
            <app-asset-drop kind="image" [value]="level.resultImage"
              (changed)="setImage(level.id, $event)" />
          </div>
        </article>
      }
      <button type="button" class="ctor-add-btn" (click)="addLevel()">
        <i class="fi fi-rr-plus"></i> Добавить задание
      </button>
    </div>
  </div>
}

@if (steps[stepIndex()].id === 'meta') {
  <div class="ctor-step">
    <h2>Последний шаг</h2>
    <label class="ctor-field">
      <span>Название игры</span>
      <input type="text" [ngModel]="name()" (ngModelChange)="name.set($event)"
        placeholder="Например, Кот — крот" />
    </label>
    <label class="ctor-field">
      <span>Описание (по желанию)</span>
      <textarea rows="3" [ngModel]="description()" (ngModelChange)="description.set($event)"></textarea>
    </label>
    <div class="ctor-summary">
      <div><strong>Звук</strong><span>{{ soundChar() }}</span></div>
      <div><strong>Заданий</strong><span>{{ build().levels.length }}</span></div>
    </div>
  </div>
}
```

- [ ] **Step 3: Создать плеер `type8-word-change.player.ts`**

```ts
import { Component, OnInit } from '@angular/core';
import { BasePlayerMode } from '../shared/base-player-mode';
import { SOUND_GROUPS, WordChangeLevel } from '../custom-game.model';
import { shuffle } from '../../../common/functions/array.functions';

const ALL_SOUNDS: string[] = SOUND_GROUPS.flatMap((g) => g.sounds.map((s) => s.char));

@Component({
  selector: 'app-type8-word-change-player',
  standalone: true,
  imports: [],
  templateUrl: './type8-word-change.player.html',
})
export class Type8WordChangePlayer extends BasePlayerMode<WordChangeLevel> implements OnInit {
  options: string[] = [];
  feedback = '';

  ngOnInit(): void {
    this.buildOptions();
  }

  protected override onLevelChange(): void {
    this.feedback = '';
    this.buildOptions();
  }

  private buildOptions(): void {
    const correct = this.current.insertSound;
    const distractors = shuffle(ALL_SOUNDS.filter((s) => s !== correct)).slice(0, 2);
    this.options = shuffle([correct, ...distractors]);
  }

  pick(sound: string): void {
    if (sound === this.current.insertSound) {
      this.correct();
    } else {
      this.feedback = 'Не тот звук — посмотри на картинку ещё раз.';
      this.wrong();
    }
  }
}
```

- [ ] **Step 4: Создать шаблон `type8-word-change.player.html`**

```html
<div class="cp-task">
  <p class="cp-prompt">Какой звук добавить в слово «{{ current.sourceWord }}»?</p>
  <img class="cp-choice__img" style="max-width: 240px;" [src]="current.resultImage!.data" alt="">
  <div class="ctor-toggle-group" style="justify-content: center;">
    @for (option of options; track option) {
      <button type="button" class="ctor-toggle" style="font-size: 1.4rem; min-width: 56px;"
        (click)="pick(option)">{{ option }}</button>
    }
  </div>
  <p class="cp-feedback">{{ feedback }}</p>
</div>
```

- [ ] **Step 5: Подключить конструктор в `constructor-host.component.ts`**

Добавить импорт и элемент в `imports`:

```ts
import { Type8WordChangeConstructor } from './types/type8-word-change.constructor';
```

- [ ] **Step 6: Добавить `@case` в `constructor-host.component.html`**

```html
        @case (8) { <app-type8-word-change-constructor /> }
```

- [ ] **Step 7: Подключить плеер в `custom-player.component.ts`**

```ts
import { Type8WordChangePlayer } from './types/type8-word-change.player';
```

- [ ] **Step 8: Добавить `@case` в `custom-player.component.html`**

```html
          @case (8) {
            <app-type8-word-change-player [game]="g"
              (answered)="onAnswered($event)" (finished)="onFinished()" />
          }
```

- [ ] **Step 9: Проверить сборку**

Run: `npm run build`
Expected: BUILD SUCCESS.

- [ ] **Step 10: Коммит**

```bash
git add src/app/constructor/types/type8-word-change.constructor.ts src/app/constructor/types/type8-word-change.constructor.html src/app/constructor/types/type8-word-change.player.ts src/app/constructor/types/type8-word-change.player.html src/app/constructor/constructor-host.component.ts src/app/constructor/constructor-host.component.html src/app/constructor/custom-player.component.ts src/app/constructor/custom-player.component.html
git commit -m "feat: type 8 (word change) constructor and player"
```

---

### Task 2: Тип 7 — место звука по отношению к другим

**Files:**
- Create: `src/app/constructor/types/type7-relative-position.constructor.ts`, `.html`
- Create: `src/app/constructor/types/type7-relative-position.player.ts`, `.html`
- Modify: `src/app/constructor/constructor-host.component.ts`, `.html`
- Modify: `src/app/constructor/custom-player.component.ts`, `.html`

- [ ] **Step 1: Создать конструктор `type7-relative-position.constructor.ts`**

```ts
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseConstructor } from '../shared/base-constructor';
import { AssetDropComponent } from '../shared/asset-drop.component';
import { SoundPickerComponent } from '../shared/sound-picker.component';
import { ConstructorStep } from '../constructor-type';
import { CustomGameAsset, RelativePositionGame, RelativePositionLevel } from '../custom-game.model';
import { splitWord } from '../word-utils';

@Component({
  selector: 'app-type7-relative-position-constructor',
  standalone: true,
  imports: [FormsModule, AssetDropComponent, SoundPickerComponent],
  templateUrl: './type7-relative-position.constructor.html',
})
export class Type7RelativePositionConstructor extends BaseConstructor {
  readonly steps: ConstructorStep[] = [
    { id: 'sound', label: 'Звуки' },
    { id: 'levels', label: 'Контент' },
    { id: 'meta', label: 'Сохранение' },
  ];

  sounds = signal<string[]>([]);
  levels = signal<RelativePositionLevel[]>([{ id: 1, word: '', letters: [] }]);
  name = signal('');
  description = signal('');

  /** Содержит ли слово хотя бы один выбранный звук (с соседом). */
  private hasSelectedSound(level: RelativePositionLevel): boolean {
    return this.sounds().some((s) => {
      const idx = level.letters.indexOf(s.toUpperCase());
      return idx > 0 || (idx >= 0 && idx < level.letters.length - 1);
    });
  }

  stepValid(index: number): boolean {
    if (index === 0) return this.sounds().length > 0;
    if (index === 1) {
      return this.levels().some(
        (l) => l.image && l.letters.length > 1 && this.hasSelectedSound(l),
      );
    }
    return this.name().trim().length > 0;
  }

  build(): Omit<RelativePositionGame, 'id' | 'createdAt' | 'updatedAt' | 'schema'> {
    return {
      type: 7,
      name: this.name().trim(),
      description: this.description().trim() || undefined,
      sounds: this.sounds(),
      levels: this.levels().filter(
        (l) => l.image && l.letters.length > 1 && this.hasSelectedSound(l),
      ),
    };
  }

  addLevel(): void {
    this.levels.update((arr) => [...arr, { id: this.nextLevelId(arr), word: '', letters: [] }]);
  }
  removeLevel(id: number): void {
    this.levels.update((arr) => arr.filter((l) => l.id !== id));
  }
  setImage(id: number, asset: CustomGameAsset): void {
    this.levels.update((arr) =>
      arr.map((l) => (l.id === id ? { ...l, image: asset } : l)),
    );
  }
  /** Слово введено — перестраиваем разбор по буквам. */
  setWord(id: number, word: string): void {
    this.levels.update((arr) =>
      arr.map((l) => (l.id === id ? { ...l, word, letters: splitWord(word) } : l)),
    );
  }
  /** Специалист правит конкретную букву разбора. */
  setLetter(id: number, index: number, value: string): void {
    const char = value.trim().toUpperCase().slice(0, 1);
    this.levels.update((arr) =>
      arr.map((l) => {
        if (l.id !== id) return l;
        const letters = [...l.letters];
        letters[index] = char || letters[index];
        return { ...l, letters };
      }),
    );
  }
}
```

- [ ] **Step 2: Создать шаблон `type7-relative-position.constructor.html`**

```html
@if (steps[stepIndex()].id === 'sound') {
  <div class="ctor-step">
    <h2>Выберите звуки</h2>
    <p class="muted">
      Можно выбрать несколько звуков — игра сама составит вопросы
      «какой звук до/после выбранного».
    </p>
    <app-sound-picker mode="multi" [(selected)]="sounds" />
  </div>
}

@if (steps[stepIndex()].id === 'levels') {
  <div class="ctor-step">
    <h2>Загрузите контент</h2>
    <p class="muted">
      Картинка и слово. Система разобьёт слово по буквам — при необходимости
      поправьте разбор. Вопросы генерируются автоматически.
    </p>
    <div class="ctor-levels">
      @for (level of levels(); track level.id; let i = $index) {
        <article class="ctor-level">
          <header class="ctor-level__head">
            <span>Задание №{{ i + 1 }}</span>
            @if (levels().length > 1) {
              <button type="button" class="ctor-icon-btn" (click)="removeLevel(level.id)" aria-label="Удалить">
                <i class="fi fi-rr-trash"></i>
              </button>
            }
          </header>
          <div class="ctor-answer-col">
            <span class="ctor-pill">Картинка</span>
            <app-asset-drop kind="image" [value]="level.image"
              (changed)="setImage(level.id, $event)" />
          </div>
          <label class="ctor-field">
            <span>Слово</span>
            <input type="text" [ngModel]="level.word"
              (ngModelChange)="setWord(level.id, $event)" placeholder="например, собака" />
          </label>
          @if (level.letters.length) {
            <div class="ctor-field">
              <span>Разбор по буквам (можно поправить)</span>
              <div class="ctor-toggle-group">
                @for (letter of level.letters; track $index) {
                  <input class="letter-cell" type="text" maxlength="1" [value]="letter"
                    (input)="setLetter(level.id, $index, $any($event.target).value)" />
                }
              </div>
            </div>
          }
        </article>
      }
      <button type="button" class="ctor-add-btn" (click)="addLevel()">
        <i class="fi fi-rr-plus"></i> Добавить задание
      </button>
    </div>
  </div>
}

@if (steps[stepIndex()].id === 'meta') {
  <div class="ctor-step">
    <h2>Последний шаг</h2>
    <label class="ctor-field">
      <span>Название игры</span>
      <input type="text" [ngModel]="name()" (ngModelChange)="name.set($event)"
        placeholder="Например, Соседи звуков" />
    </label>
    <label class="ctor-field">
      <span>Описание (по желанию)</span>
      <textarea rows="3" [ngModel]="description()" (ngModelChange)="description.set($event)"></textarea>
    </label>
    <div class="ctor-summary">
      <div><strong>Звуков</strong><span>{{ sounds().length }}</span></div>
      <div><strong>Заданий</strong><span>{{ build().levels.length }}</span></div>
    </div>
  </div>
}
```

- [ ] **Step 3: Добавить стиль `.letter-cell` в `src/styles.scss`**

В конец файла:

```scss
.letter-cell {
  width: 44px; height: 44px; text-align: center;
  font: inherit; font-family: var(--font-display); font-weight: 800;
  font-size: 1.2rem; text-transform: uppercase;
  border: 2px solid var(--ink); border-radius: 10px; background: var(--paper);
}
```

- [ ] **Step 4: Создать плеер `type7-relative-position.player.ts`**

```ts
import { Component, OnInit } from '@angular/core';
import { BasePlayerMode } from '../shared/base-player-mode';
import { RelativePositionGame, RelativePositionLevel } from '../custom-game.model';
import { buildRelativeQuestion, RelativeQuestion } from '../word-utils';
import { shuffle, getRandom } from '../../../common/functions/array.functions';

@Component({
  selector: 'app-type7-relative-position-player',
  standalone: true,
  imports: [],
  templateUrl: './type7-relative-position.player.html',
})
export class Type7RelativePositionPlayer extends BasePlayerMode<RelativePositionLevel> implements OnInit {
  question: RelativeQuestion | null = null;
  options: string[] = [];
  feedback = '';

  get g(): RelativePositionGame { return this.game as RelativePositionGame; }

  ngOnInit(): void {
    this.buildQuestion();
  }

  protected override onLevelChange(): void {
    this.feedback = '';
    this.buildQuestion();
  }

  private buildQuestion(): void {
    const letters = this.current.letters;
    // Звуки игры, реально присутствующие в слове.
    const usable = this.g.sounds.filter((s) => letters.includes(s.toUpperCase()));
    const candidates: RelativeQuestion[] = [];
    for (const sound of usable) {
      for (const dir of ['before', 'after'] as const) {
        const q = buildRelativeQuestion(letters, sound, dir);
        if (q) candidates.push(q);
      }
    }
    if (candidates.length === 0) {
      // Нет валидного вопроса для этого слова — засчитываем уровень.
      this.question = null;
      this.correct();
      return;
    }
    this.question = getRandom(candidates);
    this.options = shuffle([...this.question.options]);
  }

  pick(option: string): void {
    if (!this.question) return;
    if (option === this.question.correct) {
      this.correct();
    } else {
      this.feedback = 'Посмотри на слово внимательнее.';
      this.wrong();
    }
  }
}
```

- [ ] **Step 5: Создать шаблон `type7-relative-position.player.html`**

```html
<div class="cp-task">
  <img class="cp-choice__img" style="max-width: 240px;" [src]="current.image!.data" alt="">
  @if (question) {
    <p class="cp-prompt">{{ question.text }}</p>
    <div class="ctor-toggle-group" style="justify-content: center;">
      @for (option of options; track option) {
        <button type="button" class="ctor-toggle" style="font-size: 1.4rem; min-width: 56px;"
          (click)="pick(option)">{{ option }}</button>
      }
    </div>
  }
  <p class="cp-feedback">{{ feedback }}</p>
</div>
```

- [ ] **Step 6: Подключить конструктор в `constructor-host.component.ts`**

```ts
import { Type7RelativePositionConstructor } from './types/type7-relative-position.constructor';
```

- [ ] **Step 7: Добавить `@case` в `constructor-host.component.html`**

```html
        @case (7) { <app-type7-relative-position-constructor /> }
```

- [ ] **Step 8: Подключить плеер в `custom-player.component.ts`**

```ts
import { Type7RelativePositionPlayer } from './types/type7-relative-position.player';
```

- [ ] **Step 9: Добавить `@case` в `custom-player.component.html`**

```html
          @case (7) {
            <app-type7-relative-position-player [game]="g"
              (answered)="onAnswered($event)" (finished)="onFinished()" />
          }
```

- [ ] **Step 10: Проверить сборку**

Run: `npm run build`
Expected: BUILD SUCCESS.

- [ ] **Step 11: Коммит**

```bash
git add src/app/constructor/types/type7-relative-position.constructor.ts src/app/constructor/types/type7-relative-position.constructor.html src/app/constructor/types/type7-relative-position.player.ts src/app/constructor/types/type7-relative-position.player.html src/styles.scss src/app/constructor/constructor-host.component.ts src/app/constructor/constructor-host.component.html src/app/constructor/custom-player.component.ts src/app/constructor/custom-player.component.html
git commit -m "feat: type 7 (relative sound position) constructor and player"
```

---

### Task 3: Тип 6 — составление слова из звуков

**Files:**
- Create: `src/app/constructor/types/type6-assemble-word.constructor.ts`, `.html`
- Create: `src/app/constructor/types/type6-assemble-word.player.ts`, `.html`, `.scss`
- Modify: `src/app/constructor/constructor-host.component.ts`, `.html`
- Modify: `src/app/constructor/custom-player.component.ts`, `.html`

- [ ] **Step 1: Создать конструктор `type6-assemble-word.constructor.ts`**

```ts
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseConstructor } from '../shared/base-constructor';
import { AssetDropComponent } from '../shared/asset-drop.component';
import { ConstructorStep } from '../constructor-type';
import { AssembleWordGame, AssembleWordLevel, CustomGameAsset, ShuffleDifficulty } from '../custom-game.model';

@Component({
  selector: 'app-type6-assemble-word-constructor',
  standalone: true,
  imports: [FormsModule, AssetDropComponent],
  templateUrl: './type6-assemble-word.constructor.html',
})
export class Type6AssembleWordConstructor extends BaseConstructor {
  readonly steps: ConstructorStep[] = [
    { id: 'levels', label: 'Контент' },
    { id: 'difficulty', label: 'Сложность' },
    { id: 'meta', label: 'Сохранение' },
  ];

  readonly difficulties: Array<{ id: ShuffleDifficulty; label: string; hint: string }> = [
    { id: 'easy', label: 'Легко', hint: 'меняются местами две буквы' },
    { id: 'medium', label: 'Средне', hint: 'меняются местами три буквы' },
    { id: 'hard', label: 'Трудно', hint: 'буквы перемешиваются полностью' },
  ];

  levels = signal<AssembleWordLevel[]>([{ id: 1, word: '' }]);
  difficulty = signal<ShuffleDifficulty>('easy');
  name = signal('');
  description = signal('');

  stepValid(index: number): boolean {
    if (index === 0) {
      return this.levels().some((l) => l.word.trim().length > 1 && l.wordAudio);
    }
    if (index === 1) return true; // difficulty всегда выбрана (по умолчанию easy)
    return this.name().trim().length > 0;
  }

  build(): Omit<AssembleWordGame, 'id' | 'createdAt' | 'updatedAt' | 'schema'> {
    return {
      type: 6,
      name: this.name().trim(),
      description: this.description().trim() || undefined,
      difficulty: this.difficulty(),
      levels: this.levels()
        .filter((l) => l.word.trim().length > 1 && l.wordAudio)
        .map((l) => ({ ...l, word: l.word.trim() })),
    };
  }

  addLevel(): void {
    this.levels.update((arr) => [...arr, { id: this.nextLevelId(arr), word: '' }]);
  }
  removeLevel(id: number): void {
    this.levels.update((arr) => arr.filter((l) => l.id !== id));
  }
  setWord(id: number, word: string): void {
    this.levels.update((arr) =>
      arr.map((l) => (l.id === id ? { ...l, word } : l)),
    );
  }
  setAudio(id: number, asset: CustomGameAsset): void {
    this.levels.update((arr) =>
      arr.map((l) => (l.id === id ? { ...l, wordAudio: asset } : l)),
    );
  }
}
```

- [ ] **Step 2: Создать шаблон `type6-assemble-word.constructor.html`**

```html
@if (steps[stepIndex()].id === 'levels') {
  <div class="ctor-step">
    <h2>Загрузите контент</h2>
    <p class="muted">
      Звукозапись слова и само слово текстом — из него соберутся буквы для игры.
    </p>
    <div class="ctor-levels">
      @for (level of levels(); track level.id; let i = $index) {
        <article class="ctor-level">
          <header class="ctor-level__head">
            <span>Задание №{{ i + 1 }}</span>
            @if (levels().length > 1) {
              <button type="button" class="ctor-icon-btn" (click)="removeLevel(level.id)" aria-label="Удалить">
                <i class="fi fi-rr-trash"></i>
              </button>
            }
          </header>
          <div class="ctor-answer-col">
            <span class="ctor-pill">Звукозапись слова</span>
            <app-asset-drop kind="audio" [value]="level.wordAudio"
              hint="Запишите слово, которое нужно будет собирать из звуков"
              (changed)="setAudio(level.id, $event)" />
          </div>
          <label class="ctor-field">
            <span>Слово текстом</span>
            <input type="text" [ngModel]="level.word"
              (ngModelChange)="setWord(level.id, $event)" placeholder="например, кот" />
          </label>
        </article>
      }
      <button type="button" class="ctor-add-btn" (click)="addLevel()">
        <i class="fi fi-rr-plus"></i> Добавить задание
      </button>
    </div>
  </div>
}

@if (steps[stepIndex()].id === 'difficulty') {
  <div class="ctor-step">
    <h2>Сложность перемешивания</h2>
    <p class="muted">Как сильно перемешивать буквы при игре.</p>
    <div class="ctor-toggle-group">
      @for (d of difficulties; track d.id) {
        <button type="button" class="ctor-toggle" [class.active]="difficulty() === d.id"
          (click)="difficulty.set(d.id)">
          {{ d.label }} — {{ d.hint }}
        </button>
      }
    </div>
  </div>
}

@if (steps[stepIndex()].id === 'meta') {
  <div class="ctor-step">
    <h2>Последний шаг</h2>
    <label class="ctor-field">
      <span>Название игры</span>
      <input type="text" [ngModel]="name()" (ngModelChange)="name.set($event)"
        placeholder="Например, Собери слово" />
    </label>
    <label class="ctor-field">
      <span>Описание (по желанию)</span>
      <textarea rows="3" [ngModel]="description()" (ngModelChange)="description.set($event)"></textarea>
    </label>
    <div class="ctor-summary">
      <div><strong>Сложность</strong><span>{{ difficulty() }}</span></div>
      <div><strong>Заданий</strong><span>{{ build().levels.length }}</span></div>
    </div>
  </div>
}
```

- [ ] **Step 3: Создать плеер `type6-assemble-word.player.ts`**

```ts
import { Component, OnInit } from '@angular/core';
import { BasePlayerMode } from '../shared/base-player-mode';
import { AssembleWordGame, AssembleWordLevel } from '../custom-game.model';
import { splitWord, shuffleByDifficulty } from '../word-utils';
import { play } from '../../../common/functions/sounds.functions';

interface Tile { char: string; trayIndex: number; }

@Component({
  selector: 'app-type6-assemble-word-player',
  standalone: true,
  imports: [],
  templateUrl: './type6-assemble-word.player.html',
  styleUrl: './type6-assemble-word.player.scss',
})
export class Type6AssembleWordPlayer extends BasePlayerMode<AssembleWordLevel> implements OnInit {
  /** Ожидаемые буквы слова. */
  expected: string[] = [];
  /** Слоты под буквы (null — пусто). */
  slots: (Tile | null)[] = [];
  /** Лоток с перемешанными буквами (null — буква взята). */
  tray: (Tile | null)[] = [];
  feedback = '';

  get g(): AssembleWordGame { return this.game as AssembleWordGame; }

  ngOnInit(): void {
    this.setupLevel();
    setTimeout(() => this.playWord(), 200);
  }

  protected override onLevelChange(): void {
    this.feedback = '';
    this.setupLevel();
    setTimeout(() => this.playWord(), 200);
  }

  private setupLevel(): void {
    this.expected = splitWord(this.current.word);
    const shuffled = shuffleByDifficulty(this.expected, this.g.difficulty);
    this.tray = shuffled.map((char, trayIndex) => ({ char, trayIndex }));
    this.slots = this.expected.map(() => null);
  }

  playWord(): void {
    void play(this.current.wordAudio?.data);
  }

  /** Взять букву из лотка — встаёт в первый свободный слот. */
  takeTile(trayIndex: number): void {
    const tile = this.tray[trayIndex];
    if (!tile) return;
    const slot = this.slots.findIndex((s) => s === null);
    if (slot < 0) return;
    this.slots[slot] = tile;
    this.tray[trayIndex] = null;
    if (this.slots.every((s) => s !== null)) this.check();
  }

  /** Вернуть букву из слота обратно в лоток. */
  returnTile(slotIndex: number): void {
    const tile = this.slots[slotIndex];
    if (!tile) return;
    this.tray[tile.trayIndex] = tile;
    this.slots[slotIndex] = null;
    this.feedback = '';
  }

  private check(): void {
    const ok = this.slots.every((s, i) => s?.char === this.expected[i]);
    if (ok) {
      this.feedback = '';
      this.correct();
      return;
    }
    // Ошибка: неверно стоящие буквы улетают обратно в лоток.
    this.feedback = 'Ошибка!';
    this.wrong();
    this.slots.forEach((tile, i) => {
      if (tile && tile.char !== this.expected[i]) {
        this.tray[tile.trayIndex] = tile;
        this.slots[i] = null;
      }
    });
  }
}
```

- [ ] **Step 4: Создать шаблон `type6-assemble-word.player.html`**

```html
<div class="cp-task">
  <button type="button" class="cp-replay" (click)="playWord()">
    <i class="fi fi-rr-volume"></i> Повтор
  </button>

  <div class="aw-slots">
    @for (slot of slots; track $index) {
      <button type="button" class="aw-cell aw-cell--slot" [class.filled]="slot"
        (click)="returnTile($index)">
        {{ slot?.char ?? '' }}
      </button>
    }
  </div>

  <div class="aw-tray">
    @for (tile of tray; track $index) {
      <button type="button" class="aw-cell aw-cell--tile" [class.taken]="!tile"
        [disabled]="!tile" (click)="takeTile($index)">
        {{ tile?.char ?? '' }}
      </button>
    }
  </div>

  <p class="cp-feedback" [class.ok]="!feedback">{{ feedback }}</p>
</div>
```

- [ ] **Step 5: Создать стили `type6-assemble-word.player.scss`**

```scss
.aw-slots, .aw-tray {
  display: flex; flex-wrap: wrap; justify-content: center;
  gap: clamp(0.4rem, 1.5vw, 0.7rem);
}
.aw-tray { margin-top: 0.4rem; }
.aw-cell {
  width: clamp(48px, 12vw, 64px); height: clamp(48px, 12vw, 64px);
  display: grid; place-items: center;
  border: 2px solid var(--ink); border-radius: 12px;
  font-family: var(--font-display); font-weight: 800;
  font-size: clamp(1.4rem, 5vw, 2rem); cursor: pointer;
  box-shadow: var(--shadow-sticker-sm);
}
.aw-cell--slot {
  background: var(--paper); color: var(--ink); border-style: dashed;
  &.filled { border-style: solid; background: var(--sun); }
}
.aw-cell--tile { background: var(--sky); color: var(--paper); }
.aw-cell--tile.taken {
  background: var(--cream-deep); border-style: dashed;
  cursor: default; box-shadow: none;
}
```

- [ ] **Step 6: Подключить конструктор в `constructor-host.component.ts`**

```ts
import { Type6AssembleWordConstructor } from './types/type6-assemble-word.constructor';
```

- [ ] **Step 7: Добавить `@case` в `constructor-host.component.html`**

```html
        @case (6) { <app-type6-assemble-word-constructor /> }
```

- [ ] **Step 8: Подключить плеер в `custom-player.component.ts`**

```ts
import { Type6AssembleWordPlayer } from './types/type6-assemble-word.player';
```

- [ ] **Step 9: Добавить `@case` в `custom-player.component.html`**

```html
          @case (6) {
            <app-type6-assemble-word-player [game]="g"
              (answered)="onAnswered($event)" (finished)="onFinished()" />
          }
```

- [ ] **Step 10: Проверить сборку**

Run: `npm run build`
Expected: BUILD SUCCESS.

- [ ] **Step 11: Коммит**

```bash
git add src/app/constructor/types/type6-assemble-word.constructor.ts src/app/constructor/types/type6-assemble-word.constructor.html src/app/constructor/types/type6-assemble-word.player.ts src/app/constructor/types/type6-assemble-word.player.html src/app/constructor/types/type6-assemble-word.player.scss src/app/constructor/constructor-host.component.ts src/app/constructor/constructor-host.component.html src/app/constructor/custom-player.component.ts src/app/constructor/custom-player.component.html
git commit -m "feat: type 6 (assemble word from sounds) constructor and player"
```

---

### Task 4: Сквозная проверка юзабилити и адаптива

**Files:** изменений нет — только проверка; правки фиксируются отдельными коммитами при необходимости.

- [ ] **Step 1: Прогнать unit-тесты и сборку**

Run: `npm test -- --watch=false --browsers=ChromeHeadless`
Expected: PASS — тесты `isLegacyGame` и `word-utils`.

Run: `npm run build`
Expected: BUILD SUCCESS.

- [ ] **Step 2: Проверить все 8 конструкторов**

Run: `npm start`
Для каждого из 8 направлений на `/constructor`: пройти все шаги, заполнить
контент (для типов с аудио — проверить и загрузку файла, и запись с
микрофона), нажать «Создать игру», убедиться, что игра появилась в
`/my-games`. Особое внимание:
- тип 6 — после ввода слова и аудио шаг «Сложность» доступен;
- тип 7 — после ввода слова появляется редактируемый разбор по буквам;
- тип 8 — выбор вставляемого звука из чипсов работает.

- [ ] **Step 3: Проверить все 8 игровых режимов**

Из `/my-games` запустить каждую созданную игру и пройти до экрана «Игра
пройдена!». Особое внимание:
- тип 6 — «Повтор» озвучивает слово; буквы встают в слоты по порядку нажатия;
  при неверной сборке появляется «Ошибка!» и неверные буквы возвращаются в лоток;
- тип 7 — вопросы «какой звук до/после [X]» осмысленны, есть верный и неверный вариант;
- кнопка «Заново» в шапке плеера перезапускает игру с первого задания.

- [ ] **Step 4: Проверить адаптив на ключевых разрешениях**

В DevTools проверить ширины ~360px, ~414px, ~768px, ~1024px и десктоп для:
- `/constructor` (экран выбора) и всех 8 per-type конструкторов;
- `/my-games` (включая карточку «устаревший формат», если есть старая игра);
- `/custom-play` для всех 8 типов;
- встроенных игр (раздел «Игры» → темы → типы 1–5, 7).
Критерии: нет горизонтального скролла, тап-цели ≥ 44px, картинки не
обрезаются жёстким пикселем, текст читаем, элементы не наезжают друг на друга.

- [ ] **Step 5: Зафиксировать найденные правки (если есть)**

Если на шагах 2–4 обнаружены дефекты — исправить и закоммитить отдельными
коммитами вида `fix: <что исправлено>`. Если дефектов нет — шаг пропустить.

---

## Self-Review

- **Покрытие спеки:** тип 8 (Task 1) — выбор звука, искомое слово, выбор
  вставляемого звука из предложенных, картинка результата; плеер показывает
  слово+картинку и предлагает выбрать звук. Тип 7 (Task 2) — мультивыбор
  звуков, картинка+слово, авторазбор по буквам с возможностью правки;
  плеер генерирует вопросы «до/после» с верным и неверным вариантом. Тип 6
  (Task 3) — звукозапись с подсказкой «запишите слово…», слово текстом, выбор
  сложности перемешивания; плеер: «Повтор» озвучивает слово, слоты+лоток,
  заполнение по порядку нажатия, «Ошибка!» и возврат неверных букв. Сквозная
  проверка юзабилити и адаптива на всех разрешениях — Task 4.
- **Плейсхолдеров нет** — каждый шаг содержит полный код или точную команду;
  Task 4 — проверочный, изменений кода не предписывает, но это намеренно.
- **Согласованность типов:** `splitWord`/`shuffleByDifficulty`/
  `buildRelativeQuestion`/`RelativeQuestion` из `word-utils` (План 1) и
  `BaseConstructor`/`BasePlayerMode` (План 2) использованы с теми же
  сигнатурами; модельные типы `WordChangeLevel`/`RelativePositionLevel`/
  `AssembleWordLevel` и поля игр (`sound`, `sounds`, `difficulty`) совпадают
  с объявлениями Плана 1. `@case` в `@switch` хоста конструктора и плеера
  добавлены для типов 6, 7, 8 — после этого плана `@default`-заглушка
  становится недостижимой, но оставлена как защита.
