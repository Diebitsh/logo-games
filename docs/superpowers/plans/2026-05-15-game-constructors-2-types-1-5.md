# Конструкторы игр — План 2: типы 1–5

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Реализовать конструктор и игровой режим для типов 1–5 (неречевые звуки, квазиомонимы, есть ли звук, место звука, первый/последний звук).

**Architecture:** Абстрактные базы `BaseConstructor` и `BasePlayerMode` несут общую логику навигации по шагам и проигрывания заданий. Каждый per-type конструктор регистрируется в `ConstructorHostComponent` через инъекцию родителя; каждый per-type плеер встраивается в `CustomPlayerComponent` через `@switch` с биндингом `[game]`/`(answered)`/`(finished)`.

**Tech Stack:** Angular 21 (standalone, signals, `@for`/`@if`/`@switch`), TypeScript 5.9, SCSS-токены из `src/styles.scss`.

**Зависит от Плана 1.** Требует: модель `CustomGame`, интерфейсы `ConstructorType`/`CustomPlayerMode`, общие компоненты `AssetDropComponent`/`SoundPickerComponent`/`SoundPairPickerComponent`, каркасы `ConstructorHostComponent`/`CustomPlayerComponent`.

---

### Task 1: Общие базы и стили

**Files:**
- Create: `src/app/constructor/shared/base-constructor.ts`
- Create: `src/app/constructor/shared/base-player-mode.ts`
- Modify: `src/styles.scss` (добавить блок в конец)

- [ ] **Step 1: Создать `base-constructor.ts`**

```ts
import { computed, inject, signal, Signal } from '@angular/core';
import { ConstructorHostComponent } from '../constructor-host.component';
import { ConstructorStep, ConstructorType } from '../constructor-type';
import { CustomGame } from '../custom-game.model';

/**
 * Базовый класс per-type конструктора. Подкласс задаёт `steps`,
 * реализует `stepValid()` и `build()`. Регистрация в хосте — автоматически.
 */
export abstract class BaseConstructor implements ConstructorType {
  protected host = inject(ConstructorHostComponent);

  abstract readonly steps: ConstructorStep[];
  /** Валиден ли шаг с данным индексом (можно ли идти дальше / сохранять). */
  abstract stepValid(index: number): boolean;
  abstract build(): Omit<CustomGame, 'id' | 'createdAt' | 'updatedAt' | 'schema'>;

  readonly stepIndex = signal(0);

  readonly canAdvance: Signal<boolean> = computed(() => this.stepValid(this.stepIndex()));
  readonly readyToSave: Signal<boolean> = computed(
    () =>
      this.stepIndex() === this.steps.length - 1 &&
      this.stepValid(this.steps.length - 1),
  );

  constructor() {
    this.host.register(this);
  }

  advance(): void {
    if (this.stepIndex() < this.steps.length - 1 && this.canAdvance()) {
      this.stepIndex.update((i) => i + 1);
    }
  }

  goBack(): boolean {
    if (this.stepIndex() > 0) {
      this.stepIndex.update((i) => i - 1);
      return true;
    }
    return false;
  }

  /** Хелпер для подклассов: создаёт следующий id уровня. */
  protected nextLevelId(levels: ReadonlyArray<{ id: number }>): number {
    return levels.reduce((max, l) => Math.max(max, l.id), 0) + 1;
  }
}
```

- [ ] **Step 2: Создать `base-player-mode.ts`**

```ts
import { Directive, EventEmitter, Input, Output, signal } from '@angular/core';
import { CustomGame } from '../custom-game.model';
import { CustomPlayerMode } from '../custom-player-mode';

/**
 * Базовый класс per-type игрового режима. Подкласс работает с `levels` и
 * вызывает `correct()` / `wrong()`. Хост биндит `[game]` и слушает выходы.
 */
@Directive()
export abstract class BasePlayerMode<L> implements CustomPlayerMode {
  @Input({ required: true }) game!: CustomGame;
  @Output() answered = new EventEmitter<boolean>();
  @Output() finished = new EventEmitter<void>();

  readonly levelIndex = signal(0);

  get levels(): L[] {
    return this.game.levels as unknown as L[];
  }
  get current(): L {
    return this.levels[this.levelIndex()];
  }

  /** Верный ответ: эмитит true, переходит дальше или завершает игру. */
  protected correct(): void {
    this.answered.emit(true);
    if (this.levelIndex() + 1 >= this.levels.length) {
      this.finished.emit();
    } else {
      this.levelIndex.update((i) => i + 1);
      this.onLevelChange();
    }
  }

  /** Неверный ответ: эмитит false, уровень не меняется. */
  protected wrong(): void {
    this.answered.emit(false);
  }

  /** Хук — вызывается после перехода на новый уровень. */
  protected onLevelChange(): void {}
}
```

- [ ] **Step 3: Добавить общие классы конструктора и плеера в `src/styles.scss`**

В конец файла:

```scss
/* === Общая вёрстка per-type конструкторов === */
.ctor-step { display: flex; flex-direction: column; gap: 1rem; }
.ctor-step h2 { font-family: var(--font-display); margin: 0; }
.ctor-step .muted { color: var(--text-muted); margin: 0; }
.ctor-levels { display: flex; flex-direction: column; gap: 1rem; }
.ctor-level {
  border: 2px solid var(--ink); border-radius: var(--radius);
  background: var(--paper); padding: 1rem;
  display: flex; flex-direction: column; gap: 0.8rem;
}
.ctor-level__head {
  display: flex; justify-content: space-between; align-items: center;
  font-family: var(--font-display); font-weight: 800;
}
.ctor-answer-grid {
  display: grid; gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
}
.ctor-answer-col {
  display: flex; flex-direction: column; gap: 0.6rem;
  padding: 0.8rem; border-radius: var(--radius);
  border: 2px solid var(--ink); background: var(--cream);
}
.ctor-pill {
  align-self: flex-start; padding: 0.2rem 0.7rem;
  border: 2px solid var(--ink); border-radius: var(--radius-pill);
  font-weight: 800; font-size: 0.8rem; background: var(--mint); color: var(--paper);
}
.ctor-pill--secondary { background: var(--cream-deep); color: var(--ink); }
.ctor-field { display: flex; flex-direction: column; gap: 0.35rem; }
.ctor-field > span { font-weight: 700; font-size: 0.9rem; }
.ctor-field input, .ctor-field textarea {
  font: inherit; padding: 0.6rem 0.8rem; min-height: 44px;
  border: 2px solid var(--ink); border-radius: 12px; background: var(--paper);
}
.ctor-toggle-group { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.ctor-toggle {
  min-height: 44px; padding: 0.4rem 1rem;
  border: 2px solid var(--ink); border-radius: var(--radius-pill);
  background: var(--paper); font-weight: 700; cursor: pointer; color: var(--ink);
  &.active { background: var(--tomato); color: var(--paper); }
}
.ctor-add-btn {
  display: inline-flex; align-items: center; gap: 0.4rem; align-self: flex-start;
  min-height: 44px; padding: 0.5rem 1rem;
  border: 2px dashed var(--ink); border-radius: var(--radius-pill);
  background: var(--paper); font-weight: 700; cursor: pointer; color: var(--ink);
}
.ctor-icon-btn {
  width: 36px; height: 36px; display: grid; place-items: center;
  border: 2px solid var(--ink); border-radius: 10px;
  background: var(--paper); cursor: pointer; color: var(--tomato-dark);
}
.ctor-summary {
  display: grid; gap: 0.6rem;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 160px), 1fr));
  div {
    border: 2px solid var(--ink); border-radius: 12px;
    padding: 0.6rem 0.8rem; background: var(--cream);
    display: flex; flex-direction: column;
  }
  strong { font-size: 0.8rem; color: var(--text-muted); }
  span { font-family: var(--font-display); font-weight: 800; }
}

/* === Общая вёрстка per-type плееров === */
.cp-task { display: flex; flex-direction: column; gap: 1.2rem; width: 100%; align-items: center; }
.cp-replay {
  display: inline-flex; align-items: center; gap: 0.5rem;
  min-height: 48px; padding: 0.7rem 1.6rem;
  border: 2px solid var(--ink); border-radius: var(--radius-pill);
  background: var(--sun); color: var(--ink);
  font-family: var(--font-display); font-weight: 800;
  font-size: clamp(1rem, 2.5vw, 1.2rem); cursor: pointer;
  box-shadow: var(--shadow-sticker-sm);
}
.cp-prompt {
  font-family: var(--font-display); font-weight: 800;
  font-size: clamp(1rem, 3vw, 1.3rem); text-align: center; margin: 0;
}
.cp-choices {
  display: grid; gap: clamp(0.6rem, 2vw, 1.2rem); width: 100%;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
}
.cp-choice {
  display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
  padding: clamp(0.6rem, 2vw, 1rem);
  border: 2px solid var(--ink); border-radius: var(--radius);
  background: var(--paper); cursor: pointer;
  box-shadow: var(--shadow-sticker-sm); transition: transform 0.16s ease;
  &:hover { transform: translate(-2px, -2px); box-shadow: var(--shadow-sticker); }
}
.cp-choice__img {
  width: 100%; aspect-ratio: 1 / 1; object-fit: cover;
  border-radius: 12px; border: 2px solid var(--ink);
}
.cp-choice__label {
  font-family: var(--font-display); font-weight: 800;
  font-size: clamp(1rem, 3vw, 1.4rem); margin: 0; text-align: center;
}
.cp-feedback {
  font-weight: 700; color: var(--tomato-dark); margin: 0; min-height: 1.4em;
  &.ok { color: var(--mint); }
}
```

- [ ] **Step 4: Проверить сборку**

Run: `npm run build`
Expected: BUILD SUCCESS.

- [ ] **Step 5: Коммит**

```bash
git add src/app/constructor/shared/base-constructor.ts src/app/constructor/shared/base-player-mode.ts src/styles.scss
git commit -m "feat: BaseConstructor, BasePlayerMode and shared constructor/player styles"
```

---

### Task 2: Тип 1 — различение неречевых звуков

**Files:**
- Create: `src/app/constructor/types/type1-nonspeech.constructor.ts`, `.html`
- Create: `src/app/constructor/types/type1-nonspeech.player.ts`, `.html`
- Modify: `src/app/constructor/constructor-host.component.ts`, `.html`
- Modify: `src/app/constructor/custom-player.component.ts`, `.html`

- [ ] **Step 1: Создать конструктор `type1-nonspeech.constructor.ts`**

```ts
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseConstructor } from '../shared/base-constructor';
import { AssetDropComponent } from '../shared/asset-drop.component';
import { ConstructorStep } from '../constructor-type';
import { CustomGameAsset, NonSpeechGame, NonSpeechLevel } from '../custom-game.model';

@Component({
  selector: 'app-type1-nonspeech-constructor',
  standalone: true,
  imports: [FormsModule, AssetDropComponent],
  templateUrl: './type1-nonspeech.constructor.html',
})
export class Type1NonspeechConstructor extends BaseConstructor {
  readonly steps: ConstructorStep[] = [
    { id: 'levels', label: 'Контент' },
    { id: 'meta', label: 'Сохранение' },
  ];

  levels = signal<NonSpeechLevel[]>([{ id: 1 }]);
  name = signal('');
  description = signal('');

  stepValid(index: number): boolean {
    if (index === 0) {
      return this.levels().some((l) => l.image && l.audio && l.distractorImage);
    }
    return this.name().trim().length > 0;
  }

  build(): Omit<NonSpeechGame, 'id' | 'createdAt' | 'updatedAt' | 'schema'> {
    return {
      type: 1,
      name: this.name().trim(),
      description: this.description().trim() || undefined,
      levels: this.levels().filter((l) => l.image && l.audio && l.distractorImage),
    };
  }

  addLevel(): void {
    this.levels.update((arr) => [...arr, { id: this.nextLevelId(arr) }]);
  }
  removeLevel(id: number): void {
    this.levels.update((arr) => arr.filter((l) => l.id !== id));
  }
  setAsset(id: number, key: keyof NonSpeechLevel, asset: CustomGameAsset): void {
    this.levels.update((arr) =>
      arr.map((l) => (l.id === id ? { ...l, [key]: asset } : l)),
    );
  }
}
```

- [ ] **Step 2: Создать шаблон `type1-nonspeech.constructor.html`**

```html
@if (steps[stepIndex()].id === 'levels') {
  <div class="ctor-step">
    <h2>Загрузите контент</h2>
    <p class="muted">
      Картинка и звукозапись с правильным ответом, затем картинка
      неправильного ответа — звук для него не нужен.
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
          <div class="ctor-answer-grid">
            <div class="ctor-answer-col">
              <span class="ctor-pill">Правильный ответ</span>
              <app-asset-drop kind="image" [value]="level.image"
                (changed)="setAsset(level.id, 'image', $event)" />
              <app-asset-drop kind="audio" [value]="level.audio"
                hint="Звукозапись с правильным ответом"
                (changed)="setAsset(level.id, 'audio', $event)" />
            </div>
            <div class="ctor-answer-col">
              <span class="ctor-pill ctor-pill--secondary">Неправильный ответ</span>
              <app-asset-drop kind="image" [value]="level.distractorImage"
                (changed)="setAsset(level.id, 'distractorImage', $event)" />
            </div>
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
        placeholder="Например, Звуки летнего двора" />
    </label>
    <label class="ctor-field">
      <span>Описание (по желанию)</span>
      <textarea rows="3" [ngModel]="description()" (ngModelChange)="description.set($event)"></textarea>
    </label>
    <div class="ctor-summary">
      <div><strong>Заданий</strong><span>{{ build().levels.length }}</span></div>
    </div>
  </div>
}
```

- [ ] **Step 3: Создать плеер `type1-nonspeech.player.ts`**

```ts
import { Component, OnInit } from '@angular/core';
import { BasePlayerMode } from '../shared/base-player-mode';
import { NonSpeechLevel } from '../custom-game.model';
import { play } from '../../../common/functions/sounds.functions';
import { shuffle } from '../../../common/functions/array.functions';

interface Choice { img: string; correct: boolean; }

@Component({
  selector: 'app-type1-nonspeech-player',
  standalone: true,
  imports: [],
  templateUrl: './type1-nonspeech.player.html',
})
export class Type1NonspeechPlayer extends BasePlayerMode<NonSpeechLevel> implements OnInit {
  choices: Choice[] = [];
  feedback = '';

  ngOnInit(): void {
    this.buildChoices();
    setTimeout(() => this.playSound(), 200);
  }

  protected override onLevelChange(): void {
    this.feedback = '';
    this.buildChoices();
    setTimeout(() => this.playSound(), 200);
  }

  private buildChoices(): void {
    const l = this.current;
    this.choices = shuffle<Choice>([
      { img: l.image!.data, correct: true },
      { img: l.distractorImage!.data, correct: false },
    ]);
  }

  playSound(): void {
    void play(this.current.audio?.data);
  }

  pick(choice: Choice): void {
    if (choice.correct) {
      this.correct();
    } else {
      this.feedback = 'Послушай ещё раз и попробуй снова.';
      this.wrong();
      this.playSound();
    }
  }
}
```

- [ ] **Step 4: Создать шаблон `type1-nonspeech.player.html`**

```html
<div class="cp-task">
  <button type="button" class="cp-replay" (click)="playSound()">
    <i class="fi fi-rr-volume"></i> Послушать
  </button>
  <p class="cp-prompt">Что это за звук?</p>
  <div class="cp-choices">
    @for (choice of choices; track choice.img) {
      <button type="button" class="cp-choice" (click)="pick(choice)">
        <img class="cp-choice__img" [src]="choice.img" alt="">
      </button>
    }
  </div>
  <p class="cp-feedback">{{ feedback }}</p>
</div>
```

- [ ] **Step 5: Подключить конструктор в `constructor-host.component.ts`**

Добавить импорт и в `imports` массив `@Component`:

```ts
import { Type1NonspeechConstructor } from './types/type1-nonspeech.constructor';
```

В декораторе: `imports: [RouterLink, Type1NonspeechConstructor],`

- [ ] **Step 6: Добавить `@case` в `constructor-host.component.html`**

Внутри `@switch (type())`, перед `@default`:

```html
        @case (1) { <app-type1-nonspeech-constructor /> }
```

- [ ] **Step 7: Подключить плеер в `custom-player.component.ts`**

Добавить импорт и в `imports`:

```ts
import { Type1NonspeechPlayer } from './types/type1-nonspeech.player';
```

`imports: [RouterLink, Type1NonspeechPlayer],`

- [ ] **Step 8: Добавить `@case` в `custom-player.component.html`**

Внутри `@switch (g.type)`, перед `@default`:

```html
          @case (1) {
            <app-type1-nonspeech-player [game]="g"
              (answered)="onAnswered($event)" (finished)="onFinished()" />
          }
```

- [ ] **Step 9: Проверить сборку**

Run: `npm run build`
Expected: BUILD SUCCESS.

- [ ] **Step 10: Коммит**

```bash
git add src/app/constructor/types/type1-nonspeech.constructor.ts src/app/constructor/types/type1-nonspeech.constructor.html src/app/constructor/types/type1-nonspeech.player.ts src/app/constructor/types/type1-nonspeech.player.html src/app/constructor/constructor-host.component.ts src/app/constructor/constructor-host.component.html src/app/constructor/custom-player.component.ts src/app/constructor/custom-player.component.html
git commit -m "feat: type 1 (non-speech sounds) constructor and player"
```

---

### Task 3: Тип 2 — слова-квазиомонимы

**Files:**
- Create: `src/app/constructor/types/type2-quasi-homonym.constructor.ts`, `.html`
- Create: `src/app/constructor/types/type2-quasi-homonym.player.ts`, `.html`
- Modify: `src/app/constructor/constructor-host.component.ts`, `.html`
- Modify: `src/app/constructor/custom-player.component.ts`, `.html`

- [ ] **Step 1: Создать конструктор `type2-quasi-homonym.constructor.ts`**

```ts
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseConstructor } from '../shared/base-constructor';
import { AssetDropComponent } from '../shared/asset-drop.component';
import { SoundPairPickerComponent } from '../shared/sound-pair-picker.component';
import { ConstructorStep } from '../constructor-type';
import { CustomGameAsset, QuasiHomonymGame, QuasiHomonymLevel } from '../custom-game.model';

@Component({
  selector: 'app-type2-quasi-homonym-constructor',
  standalone: true,
  imports: [FormsModule, AssetDropComponent, SoundPairPickerComponent],
  templateUrl: './type2-quasi-homonym.constructor.html',
})
export class Type2QuasiHomonymConstructor extends BaseConstructor {
  readonly steps: ConstructorStep[] = [
    { id: 'sound', label: 'Звуки' },
    { id: 'levels', label: 'Контент' },
    { id: 'meta', label: 'Сохранение' },
  ];

  soundPair = signal<string | null>(null);
  levels = signal<QuasiHomonymLevel[]>([{ id: 1 }]);
  name = signal('');
  description = signal('');

  stepValid(index: number): boolean {
    if (index === 0) return this.soundPair() !== null;
    if (index === 1) {
      return this.levels().some((l) => l.correctImage && l.correctAudio && l.incorrectImage);
    }
    return this.name().trim().length > 0;
  }

  build(): Omit<QuasiHomonymGame, 'id' | 'createdAt' | 'updatedAt' | 'schema'> {
    return {
      type: 2,
      name: this.name().trim(),
      description: this.description().trim() || undefined,
      soundPair: this.soundPair()!,
      levels: this.levels().filter((l) => l.correctImage && l.correctAudio && l.incorrectImage),
    };
  }

  addLevel(): void {
    this.levels.update((arr) => [...arr, { id: this.nextLevelId(arr) }]);
  }
  removeLevel(id: number): void {
    this.levels.update((arr) => arr.filter((l) => l.id !== id));
  }
  setAsset(id: number, key: keyof QuasiHomonymLevel, asset: CustomGameAsset): void {
    this.levels.update((arr) =>
      arr.map((l) => (l.id === id ? { ...l, [key]: asset } : l)),
    );
  }
}
```

- [ ] **Step 2: Создать шаблон `type2-quasi-homonym.constructor.html`**

```html
@if (steps[stepIndex()].id === 'sound') {
  <div class="ctor-step">
    <h2>Выберите группу парных звуков</h2>
    <p class="muted">Слова будут отличаться одной фонемой из выбранной пары.</p>
    <app-sound-pair-picker [(selected)]="soundPair" />
  </div>
}

@if (steps[stepIndex()].id === 'levels') {
  <div class="ctor-step">
    <h2>Загрузите контент</h2>
    <p class="muted">
      Картинка и звукозапись правильного слова, затем картинка слова-пары —
      звук для него не нужен.
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
          <div class="ctor-answer-grid">
            <div class="ctor-answer-col">
              <span class="ctor-pill">Правильное слово</span>
              <app-asset-drop kind="image" [value]="level.correctImage"
                (changed)="setAsset(level.id, 'correctImage', $event)" />
              <app-asset-drop kind="audio" [value]="level.correctAudio"
                hint="Звукозапись правильного слова"
                (changed)="setAsset(level.id, 'correctAudio', $event)" />
            </div>
            <div class="ctor-answer-col">
              <span class="ctor-pill ctor-pill--secondary">Слово-пара</span>
              <app-asset-drop kind="image" [value]="level.incorrectImage"
                (changed)="setAsset(level.id, 'incorrectImage', $event)" />
            </div>
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
        placeholder="Например, Коза или коса" />
    </label>
    <label class="ctor-field">
      <span>Описание (по желанию)</span>
      <textarea rows="3" [ngModel]="description()" (ngModelChange)="description.set($event)"></textarea>
    </label>
    <div class="ctor-summary">
      <div><strong>Заданий</strong><span>{{ build().levels.length }}</span></div>
    </div>
  </div>
}
```

- [ ] **Step 3: Создать плеер `type2-quasi-homonym.player.ts`**

```ts
import { Component, OnInit } from '@angular/core';
import { BasePlayerMode } from '../shared/base-player-mode';
import { QuasiHomonymLevel } from '../custom-game.model';
import { play } from '../../../common/functions/sounds.functions';
import { shuffle } from '../../../common/functions/array.functions';

interface Choice { img: string; correct: boolean; }

@Component({
  selector: 'app-type2-quasi-homonym-player',
  standalone: true,
  imports: [],
  templateUrl: './type2-quasi-homonym.player.html',
})
export class Type2QuasiHomonymPlayer extends BasePlayerMode<QuasiHomonymLevel> implements OnInit {
  choices: Choice[] = [];
  feedback = '';

  ngOnInit(): void {
    this.buildChoices();
    setTimeout(() => this.playSound(), 200);
  }

  protected override onLevelChange(): void {
    this.feedback = '';
    this.buildChoices();
    setTimeout(() => this.playSound(), 200);
  }

  private buildChoices(): void {
    const l = this.current;
    this.choices = shuffle<Choice>([
      { img: l.correctImage!.data, correct: true },
      { img: l.incorrectImage!.data, correct: false },
    ]);
  }

  playSound(): void {
    void play(this.current.correctAudio?.data);
  }

  pick(choice: Choice): void {
    if (choice.correct) {
      this.correct();
    } else {
      this.feedback = 'Послушай слово внимательнее.';
      this.wrong();
      this.playSound();
    }
  }
}
```

- [ ] **Step 4: Создать шаблон `type2-quasi-homonym.player.html`**

```html
<div class="cp-task">
  <button type="button" class="cp-replay" (click)="playSound()">
    <i class="fi fi-rr-volume"></i> Послушать слово
  </button>
  <p class="cp-prompt">Выбери правильную картинку</p>
  <div class="cp-choices">
    @for (choice of choices; track choice.img) {
      <button type="button" class="cp-choice" (click)="pick(choice)">
        <img class="cp-choice__img" [src]="choice.img" alt="">
      </button>
    }
  </div>
  <p class="cp-feedback">{{ feedback }}</p>
</div>
```

- [ ] **Step 5: Подключить конструктор в `constructor-host.component.ts`**

Добавить импорт и элемент в `imports`:

```ts
import { Type2QuasiHomonymConstructor } from './types/type2-quasi-homonym.constructor';
```

- [ ] **Step 6: Добавить `@case` в `constructor-host.component.html`**

```html
        @case (2) { <app-type2-quasi-homonym-constructor /> }
```

- [ ] **Step 7: Подключить плеер в `custom-player.component.ts`**

```ts
import { Type2QuasiHomonymPlayer } from './types/type2-quasi-homonym.player';
```

- [ ] **Step 8: Добавить `@case` в `custom-player.component.html`**

```html
          @case (2) {
            <app-type2-quasi-homonym-player [game]="g"
              (answered)="onAnswered($event)" (finished)="onFinished()" />
          }
```

- [ ] **Step 9: Проверить сборку**

Run: `npm run build`
Expected: BUILD SUCCESS.

- [ ] **Step 10: Коммит**

```bash
git add src/app/constructor/types/type2-quasi-homonym.constructor.ts src/app/constructor/types/type2-quasi-homonym.constructor.html src/app/constructor/types/type2-quasi-homonym.player.ts src/app/constructor/types/type2-quasi-homonym.player.html src/app/constructor/constructor-host.component.ts src/app/constructor/constructor-host.component.html src/app/constructor/custom-player.component.ts src/app/constructor/custom-player.component.html
git commit -m "feat: type 2 (quasi-homonyms) constructor and player"
```

---

### Task 4: Тип 3 — есть ли звук в слове

**Files:**
- Create: `src/app/constructor/types/type3-sound-presence.constructor.ts`, `.html`
- Create: `src/app/constructor/types/type3-sound-presence.player.ts`, `.html`
- Modify: `src/app/constructor/constructor-host.component.ts`, `.html`
- Modify: `src/app/constructor/custom-player.component.ts`, `.html`

- [ ] **Step 1: Создать конструктор `type3-sound-presence.constructor.ts`**

```ts
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseConstructor } from '../shared/base-constructor';
import { AssetDropComponent } from '../shared/asset-drop.component';
import { SoundPickerComponent } from '../shared/sound-picker.component';
import { ConstructorStep } from '../constructor-type';
import { CustomGameAsset, SoundPresenceGame, SoundPresenceLevel } from '../custom-game.model';

@Component({
  selector: 'app-type3-sound-presence-constructor',
  standalone: true,
  imports: [FormsModule, AssetDropComponent, SoundPickerComponent],
  templateUrl: './type3-sound-presence.constructor.html',
})
export class Type3SoundPresenceConstructor extends BaseConstructor {
  readonly steps: ConstructorStep[] = [
    { id: 'sound', label: 'Звук' },
    { id: 'levels', label: 'Контент' },
    { id: 'meta', label: 'Сохранение' },
  ];

  sound = signal<string[]>([]);
  levels = signal<SoundPresenceLevel[]>([{ id: 1, hasSound: true }]);
  name = signal('');
  description = signal('');

  soundChar = computed(() => this.sound()[0] ?? '');
  audioHint = computed(
    () => `Звук должен звучать так: есть ли звук [${this.soundChar()}] в слове (слово на картинке)?`,
  );

  stepValid(index: number): boolean {
    if (index === 0) return this.sound().length === 1;
    if (index === 1) return this.levels().some((l) => l.image && l.audio);
    return this.name().trim().length > 0;
  }

  build(): Omit<SoundPresenceGame, 'id' | 'createdAt' | 'updatedAt' | 'schema'> {
    return {
      type: 3,
      name: this.name().trim(),
      description: this.description().trim() || undefined,
      sound: this.soundChar(),
      levels: this.levels().filter((l) => l.image && l.audio),
    };
  }

  addLevel(): void {
    this.levels.update((arr) => [...arr, { id: this.nextLevelId(arr), hasSound: true }]);
  }
  removeLevel(id: number): void {
    this.levels.update((arr) => arr.filter((l) => l.id !== id));
  }
  setAsset(id: number, key: 'image' | 'audio', asset: CustomGameAsset): void {
    this.levels.update((arr) =>
      arr.map((l) => (l.id === id ? { ...l, [key]: asset } : l)),
    );
  }
  setHasSound(id: number, value: boolean): void {
    this.levels.update((arr) =>
      arr.map((l) => (l.id === id ? { ...l, hasSound: value } : l)),
    );
  }
}
```

- [ ] **Step 2: Создать шаблон `type3-sound-presence.constructor.html`**

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
    <p class="muted">Картинка слова, звукозапись вопроса и отметка верного ответа.</p>
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
          <div class="ctor-answer-grid">
            <div class="ctor-answer-col">
              <span class="ctor-pill">Картинка</span>
              <app-asset-drop kind="image" [value]="level.image"
                (changed)="setAsset(level.id, 'image', $event)" />
            </div>
            <div class="ctor-answer-col">
              <span class="ctor-pill">Звукозапись вопроса</span>
              <app-asset-drop kind="audio" [value]="level.audio"
                [hint]="audioHint()"
                (changed)="setAsset(level.id, 'audio', $event)" />
            </div>
          </div>
          <div class="ctor-field">
            <span>Правильный ответ</span>
            <div class="ctor-toggle-group">
              <button type="button" class="ctor-toggle" [class.active]="level.hasSound"
                (click)="setHasSound(level.id, true)">Да</button>
              <button type="button" class="ctor-toggle" [class.active]="!level.hasSound"
                (click)="setHasSound(level.id, false)">Нет</button>
            </div>
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
        placeholder="Например, Ищем звук [С]" />
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

- [ ] **Step 3: Создать плеер `type3-sound-presence.player.ts`**

```ts
import { Component, OnInit } from '@angular/core';
import { BasePlayerMode } from '../shared/base-player-mode';
import { SoundPresenceGame, SoundPresenceLevel } from '../custom-game.model';
import { play } from '../../../common/functions/sounds.functions';

@Component({
  selector: 'app-type3-sound-presence-player',
  standalone: true,
  imports: [],
  templateUrl: './type3-sound-presence.player.html',
})
export class Type3SoundPresencePlayer extends BasePlayerMode<SoundPresenceLevel> implements OnInit {
  feedback = '';

  get g(): SoundPresenceGame { return this.game as SoundPresenceGame; }

  ngOnInit(): void {
    setTimeout(() => this.playSound(), 200);
  }

  protected override onLevelChange(): void {
    this.feedback = '';
    setTimeout(() => this.playSound(), 200);
  }

  playSound(): void {
    void play(this.current.audio?.data);
  }

  answer(value: boolean): void {
    if (value === this.current.hasSound) {
      this.correct();
    } else {
      this.feedback = 'Послушай слово ещё раз.';
      this.wrong();
      this.playSound();
    }
  }
}
```

- [ ] **Step 4: Создать шаблон `type3-sound-presence.player.html`**

```html
<div class="cp-task">
  <img class="cp-choice__img" style="max-width: 260px;" [src]="current.image!.data" alt="">
  <button type="button" class="cp-replay" (click)="playSound()">
    <i class="fi fi-rr-volume"></i> Повторить вопрос
  </button>
  <p class="cp-prompt">Есть ли звук [{{ g.sound }}] в этом слове?</p>
  <div class="cp-choices" style="grid-template-columns: repeat(2, 1fr); max-width: 360px;">
    <button type="button" class="cp-choice" (click)="answer(true)">
      <span class="cp-choice__label">Да</span>
    </button>
    <button type="button" class="cp-choice" (click)="answer(false)">
      <span class="cp-choice__label">Нет</span>
    </button>
  </div>
  <p class="cp-feedback">{{ feedback }}</p>
</div>
```

- [ ] **Step 5: Подключить конструктор в `constructor-host.component.ts`**

```ts
import { Type3SoundPresenceConstructor } from './types/type3-sound-presence.constructor';
```

- [ ] **Step 6: Добавить `@case` в `constructor-host.component.html`**

```html
        @case (3) { <app-type3-sound-presence-constructor /> }
```

- [ ] **Step 7: Подключить плеер в `custom-player.component.ts`**

```ts
import { Type3SoundPresencePlayer } from './types/type3-sound-presence.player';
```

- [ ] **Step 8: Добавить `@case` в `custom-player.component.html`**

```html
          @case (3) {
            <app-type3-sound-presence-player [game]="g"
              (answered)="onAnswered($event)" (finished)="onFinished()" />
          }
```

- [ ] **Step 9: Проверить сборку**

Run: `npm run build`
Expected: BUILD SUCCESS.

- [ ] **Step 10: Коммит**

```bash
git add src/app/constructor/types/type3-sound-presence.constructor.ts src/app/constructor/types/type3-sound-presence.constructor.html src/app/constructor/types/type3-sound-presence.player.ts src/app/constructor/types/type3-sound-presence.player.html src/app/constructor/constructor-host.component.ts src/app/constructor/constructor-host.component.html src/app/constructor/custom-player.component.ts src/app/constructor/custom-player.component.html
git commit -m "feat: type 3 (sound presence) constructor and player"
```

---

### Task 5: Тип 4 — место звука в слове

**Files:**
- Create: `src/app/constructor/types/type4-sound-position.constructor.ts`, `.html`
- Create: `src/app/constructor/types/type4-sound-position.player.ts`, `.html`
- Modify: `src/app/constructor/constructor-host.component.ts`, `.html`
- Modify: `src/app/constructor/custom-player.component.ts`, `.html`

- [ ] **Step 1: Создать конструктор `type4-sound-position.constructor.ts`**

```ts
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseConstructor } from '../shared/base-constructor';
import { AssetDropComponent } from '../shared/asset-drop.component';
import { SoundPickerComponent } from '../shared/sound-picker.component';
import { ConstructorStep } from '../constructor-type';
import {
  CustomGameAsset, SoundPositionGame, SoundPositionLevel, SoundSpot,
} from '../custom-game.model';

@Component({
  selector: 'app-type4-sound-position-constructor',
  standalone: true,
  imports: [FormsModule, AssetDropComponent, SoundPickerComponent],
  templateUrl: './type4-sound-position.constructor.html',
})
export class Type4SoundPositionConstructor extends BaseConstructor {
  readonly steps: ConstructorStep[] = [
    { id: 'sound', label: 'Звук' },
    { id: 'levels', label: 'Контент' },
    { id: 'meta', label: 'Сохранение' },
  ];

  readonly spots: Array<{ id: SoundSpot; label: string }> = [
    { id: 'start', label: 'Начало' },
    { id: 'middle', label: 'Середина' },
    { id: 'end', label: 'Конец' },
  ];

  sound = signal<string[]>([]);
  levels = signal<SoundPositionLevel[]>([{ id: 1, position: 'start' }]);
  name = signal('');
  description = signal('');

  soundChar = computed(() => this.sound()[0] ?? '');
  audioHint = computed(
    () => `Звук должен звучать так: где находится звук [${this.soundChar()}] в слове (слово на картинке)?`,
  );

  stepValid(index: number): boolean {
    if (index === 0) return this.sound().length === 1;
    if (index === 1) return this.levels().some((l) => l.image && l.audio);
    return this.name().trim().length > 0;
  }

  build(): Omit<SoundPositionGame, 'id' | 'createdAt' | 'updatedAt' | 'schema'> {
    return {
      type: 4,
      name: this.name().trim(),
      description: this.description().trim() || undefined,
      sound: this.soundChar(),
      levels: this.levels().filter((l) => l.image && l.audio),
    };
  }

  addLevel(): void {
    this.levels.update((arr) => [...arr, { id: this.nextLevelId(arr), position: 'start' }]);
  }
  removeLevel(id: number): void {
    this.levels.update((arr) => arr.filter((l) => l.id !== id));
  }
  setAsset(id: number, key: 'image' | 'audio', asset: CustomGameAsset): void {
    this.levels.update((arr) =>
      arr.map((l) => (l.id === id ? { ...l, [key]: asset } : l)),
    );
  }
  setPosition(id: number, position: SoundSpot): void {
    this.levels.update((arr) =>
      arr.map((l) => (l.id === id ? { ...l, position } : l)),
    );
  }
}
```

- [ ] **Step 2: Создать шаблон `type4-sound-position.constructor.html`**

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
    <p class="muted">Картинка слова, звукозапись вопроса и отметка места звука.</p>
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
          <div class="ctor-answer-grid">
            <div class="ctor-answer-col">
              <span class="ctor-pill">Картинка</span>
              <app-asset-drop kind="image" [value]="level.image"
                (changed)="setAsset(level.id, 'image', $event)" />
            </div>
            <div class="ctor-answer-col">
              <span class="ctor-pill">Звукозапись вопроса</span>
              <app-asset-drop kind="audio" [value]="level.audio"
                [hint]="audioHint()"
                (changed)="setAsset(level.id, 'audio', $event)" />
            </div>
          </div>
          <div class="ctor-field">
            <span>Правильный ответ</span>
            <div class="ctor-toggle-group">
              @for (spot of spots; track spot.id) {
                <button type="button" class="ctor-toggle" [class.active]="level.position === spot.id"
                  (click)="setPosition(level.id, spot.id)">{{ spot.label }}</button>
              }
            </div>
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
        placeholder="Например, Где звук [Р]" />
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

- [ ] **Step 3: Создать плеер `type4-sound-position.player.ts`**

```ts
import { Component, OnInit } from '@angular/core';
import { BasePlayerMode } from '../shared/base-player-mode';
import { SoundPositionGame, SoundPositionLevel, SoundSpot } from '../custom-game.model';
import { play } from '../../../common/functions/sounds.functions';

@Component({
  selector: 'app-type4-sound-position-player',
  standalone: true,
  imports: [],
  templateUrl: './type4-sound-position.player.html',
})
export class Type4SoundPositionPlayer extends BasePlayerMode<SoundPositionLevel> implements OnInit {
  feedback = '';

  readonly spots: Array<{ id: SoundSpot; label: string }> = [
    { id: 'start', label: 'Начало' },
    { id: 'middle', label: 'Середина' },
    { id: 'end', label: 'Конец' },
  ];

  get g(): SoundPositionGame { return this.game as SoundPositionGame; }

  ngOnInit(): void {
    setTimeout(() => this.playSound(), 200);
  }

  protected override onLevelChange(): void {
    this.feedback = '';
    setTimeout(() => this.playSound(), 200);
  }

  playSound(): void {
    void play(this.current.audio?.data);
  }

  answer(spot: SoundSpot): void {
    if (spot === this.current.position) {
      this.correct();
    } else {
      this.feedback = 'Послушай слово ещё раз.';
      this.wrong();
      this.playSound();
    }
  }
}
```

- [ ] **Step 4: Создать шаблон `type4-sound-position.player.html`**

```html
<div class="cp-task">
  <img class="cp-choice__img" style="max-width: 260px;" [src]="current.image!.data" alt="">
  <button type="button" class="cp-replay" (click)="playSound()">
    <i class="fi fi-rr-volume"></i> Повторить вопрос
  </button>
  <p class="cp-prompt">Где находится звук [{{ g.sound }}]?</p>
  <div class="cp-choices" style="grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));">
    @for (spot of spots; track spot.id) {
      <button type="button" class="cp-choice" (click)="answer(spot.id)">
        <span class="cp-choice__label">{{ spot.label }}</span>
      </button>
    }
  </div>
  <p class="cp-feedback">{{ feedback }}</p>
</div>
```

- [ ] **Step 5: Подключить конструктор в `constructor-host.component.ts`**

```ts
import { Type4SoundPositionConstructor } from './types/type4-sound-position.constructor';
```

- [ ] **Step 6: Добавить `@case` в `constructor-host.component.html`**

```html
        @case (4) { <app-type4-sound-position-constructor /> }
```

- [ ] **Step 7: Подключить плеер в `custom-player.component.ts`**

```ts
import { Type4SoundPositionPlayer } from './types/type4-sound-position.player';
```

- [ ] **Step 8: Добавить `@case` в `custom-player.component.html`**

```html
          @case (4) {
            <app-type4-sound-position-player [game]="g"
              (answered)="onAnswered($event)" (finished)="onFinished()" />
          }
```

- [ ] **Step 9: Проверить сборку**

Run: `npm run build`
Expected: BUILD SUCCESS.

- [ ] **Step 10: Коммит**

```bash
git add src/app/constructor/types/type4-sound-position.constructor.ts src/app/constructor/types/type4-sound-position.constructor.html src/app/constructor/types/type4-sound-position.player.ts src/app/constructor/types/type4-sound-position.player.html src/app/constructor/constructor-host.component.ts src/app/constructor/constructor-host.component.html src/app/constructor/custom-player.component.ts src/app/constructor/custom-player.component.html
git commit -m "feat: type 4 (sound position) constructor and player"
```

---

### Task 6: Тип 5 — первый/последний звук в слове

**Files:**
- Create: `src/app/constructor/types/type5-first-last.constructor.ts`, `.html`
- Create: `src/app/constructor/types/type5-first-last.player.ts`, `.html`
- Modify: `src/app/constructor/constructor-host.component.ts`, `.html`
- Modify: `src/app/constructor/custom-player.component.ts`, `.html`

- [ ] **Step 1: Создать конструктор `type5-first-last.constructor.ts`**

```ts
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseConstructor } from '../shared/base-constructor';
import { AssetDropComponent } from '../shared/asset-drop.component';
import { SoundPickerComponent } from '../shared/sound-picker.component';
import { ConstructorStep } from '../constructor-type';
import {
  CustomGameAsset, FirstLastGame, FirstLastLevel, FirstLastMode,
} from '../custom-game.model';

@Component({
  selector: 'app-type5-first-last-constructor',
  standalone: true,
  imports: [FormsModule, AssetDropComponent, SoundPickerComponent],
  templateUrl: './type5-first-last.constructor.html',
})
export class Type5FirstLastConstructor extends BaseConstructor {
  readonly steps: ConstructorStep[] = [
    { id: 'sound', label: 'Звук' },
    { id: 'levels', label: 'Контент' },
    { id: 'meta', label: 'Сохранение' },
  ];

  sound = signal<string[]>([]);
  levels = signal<FirstLastLevel[]>([{ id: 1, mode: 'first' }]);
  name = signal('');
  description = signal('');

  soundChar = computed(() => this.sound()[0] ?? '');

  audioHint(mode: FirstLastMode): string {
    const word = mode === 'first' ? 'первый' : 'последний';
    return `Звук должен звучать так: какой ${word} звук в слове (слово на картинке)?`;
  }

  stepValid(index: number): boolean {
    if (index === 0) return this.sound().length === 1;
    if (index === 1) {
      return this.levels().some(
        (l) => l.image && l.audio && l.correctSoundImage && l.incorrectSoundImage,
      );
    }
    return this.name().trim().length > 0;
  }

  build(): Omit<FirstLastGame, 'id' | 'createdAt' | 'updatedAt' | 'schema'> {
    return {
      type: 5,
      name: this.name().trim(),
      description: this.description().trim() || undefined,
      sound: this.soundChar(),
      levels: this.levels().filter(
        (l) => l.image && l.audio && l.correctSoundImage && l.incorrectSoundImage,
      ),
    };
  }

  addLevel(): void {
    this.levels.update((arr) => [...arr, { id: this.nextLevelId(arr), mode: 'first' }]);
  }
  removeLevel(id: number): void {
    this.levels.update((arr) => arr.filter((l) => l.id !== id));
  }
  setAsset(id: number, key: keyof FirstLastLevel, asset: CustomGameAsset): void {
    this.levels.update((arr) =>
      arr.map((l) => (l.id === id ? { ...l, [key]: asset } : l)),
    );
  }
  setMode(id: number, mode: FirstLastMode): void {
    this.levels.update((arr) =>
      arr.map((l) => (l.id === id ? { ...l, mode } : l)),
    );
  }
}
```

- [ ] **Step 2: Создать шаблон `type5-first-last.constructor.html`**

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
      Картинка слова и звукозапись вопроса, отметка «первый/последний»,
      картинки правильного и неправильного звука.
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
          <div class="ctor-field">
            <span>Какой звук ищем</span>
            <div class="ctor-toggle-group">
              <button type="button" class="ctor-toggle" [class.active]="level.mode === 'first'"
                (click)="setMode(level.id, 'first')">Первый</button>
              <button type="button" class="ctor-toggle" [class.active]="level.mode === 'last'"
                (click)="setMode(level.id, 'last')">Последний</button>
            </div>
          </div>
          <div class="ctor-answer-grid">
            <div class="ctor-answer-col">
              <span class="ctor-pill">Картинка слова</span>
              <app-asset-drop kind="image" [value]="level.image"
                (changed)="setAsset(level.id, 'image', $event)" />
            </div>
            <div class="ctor-answer-col">
              <span class="ctor-pill">Звукозапись вопроса</span>
              <app-asset-drop kind="audio" [value]="level.audio"
                [hint]="audioHint(level.mode)"
                (changed)="setAsset(level.id, 'audio', $event)" />
            </div>
          </div>
          <div class="ctor-answer-grid">
            <div class="ctor-answer-col">
              <span class="ctor-pill">Картинка правильного звука</span>
              <app-asset-drop kind="image" [value]="level.correctSoundImage"
                (changed)="setAsset(level.id, 'correctSoundImage', $event)" />
            </div>
            <div class="ctor-answer-col">
              <span class="ctor-pill ctor-pill--secondary">Картинка неправильного звука</span>
              <app-asset-drop kind="image" [value]="level.incorrectSoundImage"
                (changed)="setAsset(level.id, 'incorrectSoundImage', $event)" />
            </div>
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
        placeholder="Например, Первый звук в слове" />
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

- [ ] **Step 3: Создать плеер `type5-first-last.player.ts`**

```ts
import { Component, OnInit } from '@angular/core';
import { BasePlayerMode } from '../shared/base-player-mode';
import { FirstLastLevel } from '../custom-game.model';
import { play } from '../../../common/functions/sounds.functions';
import { shuffle } from '../../../common/functions/array.functions';

interface Choice { img: string; correct: boolean; }

@Component({
  selector: 'app-type5-first-last-player',
  standalone: true,
  imports: [],
  templateUrl: './type5-first-last.player.html',
})
export class Type5FirstLastPlayer extends BasePlayerMode<FirstLastLevel> implements OnInit {
  choices: Choice[] = [];
  feedback = '';

  ngOnInit(): void {
    this.buildChoices();
    setTimeout(() => this.playSound(), 200);
  }

  protected override onLevelChange(): void {
    this.feedback = '';
    this.buildChoices();
    setTimeout(() => this.playSound(), 200);
  }

  private buildChoices(): void {
    const l = this.current;
    this.choices = shuffle<Choice>([
      { img: l.correctSoundImage!.data, correct: true },
      { img: l.incorrectSoundImage!.data, correct: false },
    ]);
  }

  get prompt(): string {
    return this.current.mode === 'first'
      ? 'Какой первый звук в слове?'
      : 'Какой последний звук в слове?';
  }

  playSound(): void {
    void play(this.current.audio?.data);
  }

  pick(choice: Choice): void {
    if (choice.correct) {
      this.correct();
    } else {
      this.feedback = 'Послушай слово ещё раз.';
      this.wrong();
      this.playSound();
    }
  }
}
```

- [ ] **Step 4: Создать шаблон `type5-first-last.player.html`**

```html
<div class="cp-task">
  <img class="cp-choice__img" style="max-width: 220px;" [src]="current.image!.data" alt="">
  <button type="button" class="cp-replay" (click)="playSound()">
    <i class="fi fi-rr-volume"></i> Повторить вопрос
  </button>
  <p class="cp-prompt">{{ prompt }}</p>
  <div class="cp-choices" style="grid-template-columns: repeat(2, 1fr); max-width: 360px;">
    @for (choice of choices; track choice.img) {
      <button type="button" class="cp-choice" (click)="pick(choice)">
        <img class="cp-choice__img" [src]="choice.img" alt="">
      </button>
    }
  </div>
  <p class="cp-feedback">{{ feedback }}</p>
</div>
```

- [ ] **Step 5: Подключить конструктор в `constructor-host.component.ts`**

```ts
import { Type5FirstLastConstructor } from './types/type5-first-last.constructor';
```

- [ ] **Step 6: Добавить `@case` в `constructor-host.component.html`**

```html
        @case (5) { <app-type5-first-last-constructor /> }
```

- [ ] **Step 7: Подключить плеер в `custom-player.component.ts`**

```ts
import { Type5FirstLastPlayer } from './types/type5-first-last.player';
```

- [ ] **Step 8: Добавить `@case` в `custom-player.component.html`**

```html
          @case (5) {
            <app-type5-first-last-player [game]="g"
              (answered)="onAnswered($event)" (finished)="onFinished()" />
          }
```

- [ ] **Step 9: Проверить сборку**

Run: `npm run build`
Expected: BUILD SUCCESS.

- [ ] **Step 10: Ручная проверка типов 1–5**

Run: `npm start`
Для каждого из типов 1–5: `/constructor` → выбрать направление → пройти все
шаги, загрузить картинки/аудио (для типов с аудио — проверить и загрузку
файла, и запись с микрофона) → «Создать игру». Затем `/my-games` → «Играть» →
пройти игру до экрана «Игра пройдена!». Проверить на ширине ~360px: нет
горизонтального скролла, кнопки и картинки не наезжают.

- [ ] **Step 11: Коммит**

```bash
git add src/app/constructor/types/type5-first-last.constructor.ts src/app/constructor/types/type5-first-last.constructor.html src/app/constructor/types/type5-first-last.player.ts src/app/constructor/types/type5-first-last.player.html src/app/constructor/constructor-host.component.ts src/app/constructor/constructor-host.component.html src/app/constructor/custom-player.component.ts src/app/constructor/custom-player.component.html
git commit -m "feat: type 5 (first/last sound) constructor and player"
```

---

## Self-Review

- **Покрытие спеки:** тип 1 (Task 2) — картинка+аудио правильного, картинка
  отвлекающего; тип 2 (Task 3) — выбор парной группы + картинка+аудио
  правильного + картинка пары; тип 3 (Task 4) — звук + картинка+аудио с
  подсказкой «есть ли звук [X]…» + Да/Нет; тип 4 (Task 5) — звук +
  картинка+аудио с подсказкой «где находится…» + Начало/Середина/Конец; тип 5
  (Task 6) — звук + картинка+аудио + переключатель первый/последний + картинки
  правильного и неправильного звука. Базы и общие стили — Task 1. Плееры для
  всех пяти типов реализованы и подключены в `@switch` хоста плеера.
- **Плейсхолдеров нет** — каждый шаг содержит полный код или точную команду.
- **Согласованность типов:** `BaseConstructor.nextLevelId`, `stepValid`,
  `build`, `BasePlayerMode.correct/wrong/current/levels`, сигнатуры
  `AssetDropComponent` (`kind`/`hint`/`value`/`changed`),
  `SoundPickerComponent` (`mode`/`selected`), `SoundPairPickerComponent`
  (`selected`) использованы единообразно во всех задачах и совпадают с
  объявлениями из Плана 1. `@switch` хоста конструктора и плеера дополняется
  по одному `@case` на тип — `@default` (заглушка) остаётся для типов 6–8 до
  Плана 3.
