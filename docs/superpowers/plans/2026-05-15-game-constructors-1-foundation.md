# Конструкторы игр — План 1: Фундамент и адаптив

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Заложить модель данных, общие компоненты и каркасы (picker/host/плеер) под 8 per-type конструкторов и привести вёрстку 8 встроенных игр к адаптивной.

**Architecture:** `CustomGame` становится размеченным объединением по `type` (`schema: 2`). Старый универсальный `ConstructorComponent` удаляется, вместо него — `ConstructorPickerComponent` (выбор направления) и `ConstructorHostComponent` (каркас со `@switch`). `CustomPlayerComponent` превращается в хост со `@switch`. Per-type конструкторы и плееры в этом плане — заглушки «в разработке», их реализуют Планы 2 и 3.

**Tech Stack:** Angular 21 (standalone components, signals, `@if`/`@switch`/`@for`), TypeScript 5.9, IndexedDB через `idb`, Karma + Jasmine для unit-тестов чистой логики, SCSS с токенами из `src/styles.scss`.

**Это первый из трёх планов.** План 2 — типы 1–5 (конструктор + плеер). План 3 — типы 6, 7, 8.

---

### Task 1: Модель данных — размеченное объединение `CustomGame`

**Files:**
- Modify: `src/app/constructor/custom-game.model.ts` (полная замена содержимого)
- Test: `src/app/constructor/custom-game.model.spec.ts`

- [ ] **Step 1: Написать падающий тест на `isLegacyGame`**

Создать `src/app/constructor/custom-game.model.spec.ts`:

```ts
import { isLegacyGame, CUSTOM_GAME_SCHEMA } from './custom-game.model';

describe('isLegacyGame', () => {
  it('считает игру без поля schema устаревшей', () => {
    expect(isLegacyGame({})).toBe(true);
  });

  it('считает игру со schema=1 устаревшей', () => {
    expect(isLegacyGame({ schema: 1 })).toBe(true);
  });

  it('считает игру с текущей schema актуальной', () => {
    expect(isLegacyGame({ schema: CUSTOM_GAME_SCHEMA })).toBe(false);
  });
});
```

- [ ] **Step 2: Запустить тест — убедиться, что падает**

Run: `npm test -- --watch=false --browsers=ChromeHeadless`
Expected: FAIL — `isLegacyGame` / `CUSTOM_GAME_SCHEMA` не экспортируются.

- [ ] **Step 3: Заменить содержимое `custom-game.model.ts`**

```ts
export interface CustomGameAsset {
  name: string;
  mime: string;
  data: string; // data-URL
}

/** Версия формата сохранённой игры. Игры со старой версией не запускаются. */
export const CUSTOM_GAME_SCHEMA = 2;

interface CustomGameBase {
  id: string;
  schema: number;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  cover?: CustomGameAsset;
}

/** type 1 — различение неречевых звуков */
export interface NonSpeechLevel {
  id: number;
  image?: CustomGameAsset;
  audio?: CustomGameAsset;
  distractorImage?: CustomGameAsset;
}
export interface NonSpeechGame extends CustomGameBase {
  type: 1;
  levels: NonSpeechLevel[];
}

/** type 2 — слова-квазиомонимы */
export interface QuasiHomonymLevel {
  id: number;
  correctImage?: CustomGameAsset;
  correctAudio?: CustomGameAsset;
  incorrectImage?: CustomGameAsset;
}
export interface QuasiHomonymGame extends CustomGameBase {
  type: 2;
  soundPair: string;
  levels: QuasiHomonymLevel[];
}

/** type 3 — есть ли звук в слове */
export interface SoundPresenceLevel {
  id: number;
  image?: CustomGameAsset;
  audio?: CustomGameAsset;
  hasSound: boolean;
}
export interface SoundPresenceGame extends CustomGameBase {
  type: 3;
  sound: string;
  levels: SoundPresenceLevel[];
}

/** type 4 — место звука в слове */
export type SoundSpot = 'start' | 'middle' | 'end';
export interface SoundPositionLevel {
  id: number;
  image?: CustomGameAsset;
  audio?: CustomGameAsset;
  position: SoundSpot;
}
export interface SoundPositionGame extends CustomGameBase {
  type: 4;
  sound: string;
  levels: SoundPositionLevel[];
}

/** type 5 — первый/последний звук */
export type FirstLastMode = 'first' | 'last';
export interface FirstLastLevel {
  id: number;
  image?: CustomGameAsset;
  audio?: CustomGameAsset;
  mode: FirstLastMode;
  correctSoundImage?: CustomGameAsset;
  incorrectSoundImage?: CustomGameAsset;
}
export interface FirstLastGame extends CustomGameBase {
  type: 5;
  sound: string;
  levels: FirstLastLevel[];
}

/** type 6 — сборка слова из звуков */
export type ShuffleDifficulty = 'easy' | 'medium' | 'hard';
export interface AssembleWordLevel {
  id: number;
  word: string;
  wordAudio?: CustomGameAsset;
}
export interface AssembleWordGame extends CustomGameBase {
  type: 6;
  difficulty: ShuffleDifficulty;
  levels: AssembleWordLevel[];
}

/** type 7 — место звука по отношению к другим */
export interface RelativePositionLevel {
  id: number;
  word: string;
  letters: string[];
  image?: CustomGameAsset;
}
export interface RelativePositionGame extends CustomGameBase {
  type: 7;
  sounds: string[];
  levels: RelativePositionLevel[];
}

/** type 8 — замена/перестановка звука */
export interface WordChangeLevel {
  id: number;
  sourceWord: string;
  insertSound: string;
  resultImage?: CustomGameAsset;
}
export interface WordChangeGame extends CustomGameBase {
  type: 8;
  sound: string;
  levels: WordChangeLevel[];
}

export type CustomGame =
  | NonSpeechGame
  | QuasiHomonymGame
  | SoundPresenceGame
  | SoundPositionGame
  | FirstLastGame
  | AssembleWordGame
  | RelativePositionGame
  | WordChangeGame;

export type CustomGameType = CustomGame['type'];

/** Игра, сохранённая в старом формате (до per-type конструкторов). */
export function isLegacyGame(game: { schema?: number } | null | undefined): boolean {
  return (game?.schema ?? 1) !== CUSTOM_GAME_SCHEMA;
}

export const GAME_TYPES: Array<{ id: CustomGameType; name: string; description: string; icon: string }> = [
  { id: 1, name: 'Различение неречевых звуков', description: 'Ребёнок угадывает источник звука: машина, вертолёт и др.', icon: 'fi-rr-volume' },
  { id: 2, name: 'Слова-квазиомонимы', description: 'Выбрать слово, отличающееся от пары одной фонемой (коза — коса).', icon: 'fi-rr-comment' },
  { id: 8, name: 'Замена/перестановка звука', description: 'Преобразование слов: кот — ток.', icon: 'fi-rr-shuffle' },
  { id: 3, name: 'Есть ли звук в слове', description: 'Определить наличие заданного звука в слове.', icon: 'fi-rr-search' },
  { id: 4, name: 'Место звука в слове', description: 'Начало, середина или конец.', icon: 'fi-rr-marker' },
  { id: 5, name: 'Первый/последний звук', description: 'Определить первый или последний звук в слове.', icon: 'fi-rr-arrow-right' },
  { id: 7, name: 'Место по отношению к другим', description: 'Какой звук стоит до/после заданного.', icon: 'fi-rr-list' },
  { id: 6, name: 'Составление слова из звуков', description: 'Собрать слово из перепутанной последовательности.', icon: 'fi-rr-puzzle-alt' },
];

export const SOUND_GROUPS: Array<{
  id: string;
  name: string;
  sounds: Array<{ char: string; soft?: boolean }>;
}> = [
  {
    id: 'vowels',
    name: 'Гласные',
    sounds: [
      { char: 'А' }, { char: 'Е' }, { char: 'Ё' }, { char: 'И' }, { char: 'О' },
      { char: 'У' }, { char: 'Ы' }, { char: 'Э' }, { char: 'Ю' }, { char: 'Я' },
    ],
  },
  {
    id: 'sibilants',
    name: 'Свистящие',
    sounds: [
      { char: 'С' }, { char: 'С’', soft: true }, { char: 'З' }, { char: 'З’', soft: true }, { char: 'Ц' },
    ],
  },
  {
    id: 'hushing',
    name: 'Шипящие',
    sounds: [
      { char: 'Ш' }, { char: 'Ж' }, { char: 'Ч' }, { char: 'Щ' },
    ],
  },
  {
    id: 'sonorants',
    name: 'Сонорные',
    sounds: [
      { char: 'Л' }, { char: 'Л’', soft: true }, { char: 'Р' }, { char: 'Р’', soft: true },
      { char: 'М' }, { char: 'М’', soft: true }, { char: 'Н' }, { char: 'Н’', soft: true }, { char: 'Й' },
    ],
  },
];

/** Парные звуки для типа 2 (квазиомонимы): твёрдые и мягкие пары. */
export const SOUND_PAIRS: Array<{ id: string; label: string; sounds: [string, string]; soft?: boolean }> = [
  { id: 'd-t', label: 'Д — Т', sounds: ['Д', 'Т'] },
  { id: 'ds-ts', label: 'Д’ — Т’', sounds: ['Д’', 'Т’'], soft: true },
  { id: 'z-s', label: 'З — С', sounds: ['З', 'С'] },
  { id: 'zs-ss', label: 'З’ — С’', sounds: ['З’', 'С’'], soft: true },
  { id: 'g-k', label: 'Г — К', sounds: ['Г', 'К'] },
  { id: 'gs-ks', label: 'Г’ — К’', sounds: ['Г’', 'К’'], soft: true },
  { id: 'zh-sh', label: 'Ж — Ш', sounds: ['Ж', 'Ш'] },
  { id: 'l-r', label: 'Л — Р', sounds: ['Л', 'Р'] },
  { id: 'ls-rs', label: 'Л’ — Р’', sounds: ['Л’', 'Р’'], soft: true },
  { id: 'v-f', label: 'В — Ф', sounds: ['В', 'Ф'] },
  { id: 'vs-fs', label: 'В’ — Ф’', sounds: ['В’', 'Ф’'], soft: true },
  { id: 'b-p', label: 'Б — П', sounds: ['Б', 'П'] },
  { id: 'bs-ps', label: 'Б’ — П’', sounds: ['Б’', 'П’'], soft: true },
];
```

- [ ] **Step 4: Запустить тест — убедиться, что проходит**

Run: `npm test -- --watch=false --browsers=ChromeHeadless`
Expected: PASS (3 теста `isLegacyGame`).

- [ ] **Step 5: Коммит**

```bash
git add src/app/constructor/custom-game.model.ts src/app/constructor/custom-game.model.spec.ts
git commit -m "feat: discriminated-union CustomGame model + sound pairs"
```

> ⚠️ После этой задачи `ng build` временно сломан: старые `ConstructorComponent`,
> `CustomPlayerComponent`, `MyGamesComponent` используют прежнюю форму модели.
> Их чинит Task 2. Не запускайте `ng build` между Task 1 и Task 2.

---

### Task 2: Замена каркасов — picker, host, плеер-хост, my-games, роуты

**Files:**
- Delete: `src/app/constructor/constructor.component.ts`, `.html`, `.scss`
- Create: `src/app/constructor/constructor-picker.component.ts`, `.html`, `.scss`
- Create: `src/app/constructor/constructor-host.component.ts`, `.html`, `.scss`
- Create: `src/app/constructor/constructor-type.ts` (интерфейс per-type конструктора)
- Create: `src/app/constructor/custom-player-mode.ts` (интерфейс per-type плеера)
- Modify: `src/app/constructor/custom-player.component.ts`, `.html`, `.scss` (полная замена — хост)
- Modify: `src/app/constructor/my-games.component.ts`, `.html`
- Modify: `src/app/app.routes.ts`

- [ ] **Step 1: Удалить старый конструктор**

```bash
git rm src/app/constructor/constructor.component.ts src/app/constructor/constructor.component.html src/app/constructor/constructor.component.scss
```

- [ ] **Step 2: Создать интерфейс per-type конструктора `constructor-type.ts`**

```ts
import { Signal } from '@angular/core';
import { CustomGame } from './custom-game.model';

/** Описание одного шага в степпере. */
export interface ConstructorStep {
  id: string;
  label: string;
}

/**
 * Контракт per-type конструктора. Каждый из 8 конструкторов реализует его,
 * а `ConstructorHostComponent` управляет общим каркасом (степпер, кнопки).
 */
export interface ConstructorType {
  /** Шаги этого конструктора (без финального экрана «Готово»). */
  readonly steps: ConstructorStep[];
  /** Индекс текущего шага. */
  readonly stepIndex: Signal<number>;
  /** Можно ли уйти с текущего шага вперёд. */
  readonly canAdvance: Signal<boolean>;
  /** Перейти на следующий шаг. */
  advance(): void;
  /** Вернуться на предыдущий шаг. На первом шаге — вернёт false. */
  goBack(): boolean;
  /** Готова ли игра к сохранению (последний шаг пройден). */
  readonly readyToSave: Signal<boolean>;
  /** Собрать объект игры для сохранения. id/createdAt проставляет хост. */
  build(): Omit<CustomGame, 'id' | 'createdAt' | 'updatedAt' | 'schema'>;
}
```

- [ ] **Step 3: Создать интерфейс per-type плеера `custom-player-mode.ts`**

```ts
import { EventEmitter } from '@angular/core';
import { CustomGame } from './custom-game.model';

/**
 * Контракт per-type игрового режима. `CustomPlayerComponent` создаёт нужный
 * компонент в `@switch`, передаёт игру и подписывается на события.
 */
export interface CustomPlayerMode {
  /** Игра для проигрывания (хост гарантирует совпадение по type). */
  game: CustomGame;
  /** true — ответ верный, false — неверный. */
  answered: EventEmitter<boolean>;
  /** Все задания пройдены. */
  finished: EventEmitter<void>;
}
```

- [ ] **Step 4: Создать `ConstructorPickerComponent`**

`constructor-picker.component.ts`:

```ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GAME_TYPES } from './custom-game.model';

@Component({
  selector: 'app-constructor-picker',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './constructor-picker.component.html',
  styleUrl: './constructor-picker.component.scss',
})
export class ConstructorPickerComponent {
  gameTypes = GAME_TYPES;
}
```

`constructor-picker.component.html`:

```html
<section class="picker">
  <header class="picker__head">
    <div>
      <h1>Конструктор <span class="script-accent">собираем игру</span></h1>
      <p>Выберите направление работы — для каждого свой простой мастер.</p>
    </div>
    <a routerLink="/my-games" class="ghost-link">
      <i class="fi fi-rr-bookmark"></i> Мои игры
    </a>
  </header>

  <div class="picker__grid">
    @for (t of gameTypes; track t.id) {
      <a class="type-card" [routerLink]="['/constructor', t.id]">
        <span class="card-icon"><i class="fi" [class]="t.icon"></i></span>
        <strong>{{ t.name }}</strong>
        <span class="muted">{{ t.description }}</span>
      </a>
    }
  </div>
</section>
```

`constructor-picker.component.scss`:

```scss
.picker { max-width: 1100px; margin: 0 auto; padding: clamp(0.8rem, 3vw, 2rem); }

.picker__head {
  display: flex; flex-wrap: wrap; gap: 1rem;
  justify-content: space-between; align-items: flex-start; margin-bottom: 1.6rem;
  h1 { font-family: var(--font-display); font-weight: 900; margin: 0 0 0.3rem; }
  p { color: var(--text-muted); margin: 0; }
}
.ghost-link {
  display: inline-flex; align-items: center; gap: 0.4rem;
  text-decoration: none; color: var(--ink); font-weight: 700;
  border: 2px solid var(--ink); border-radius: var(--radius-pill);
  padding: 0.5rem 1rem; background: var(--paper);
}
.picker__grid {
  display: grid; gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
}
.type-card {
  display: flex; flex-direction: column; gap: 0.5rem;
  text-align: left; text-decoration: none; color: var(--ink);
  border: 2px solid var(--ink); border-radius: var(--radius);
  background: var(--paper); padding: 1.2rem;
  box-shadow: var(--shadow-sticker-sm); transition: transform 0.16s ease;
  strong { font-family: var(--font-display); font-size: 1.05rem; }
  .muted { color: var(--text-muted); font-size: 0.9rem; }
  &:hover { transform: translate(-2px, -2px); box-shadow: var(--shadow-sticker); }
}
.card-icon {
  width: 48px; height: 48px; display: grid; place-items: center;
  border: 2px solid var(--ink); border-radius: 14px;
  background: var(--sun); font-size: 1.4rem;
}
```

- [ ] **Step 5: Создать `ConstructorHostComponent`**

`constructor-host.component.ts`:

```ts
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomGamesService } from './custom-games.service';
import { CustomGame, CUSTOM_GAME_SCHEMA, GAME_TYPES, CustomGameType } from './custom-game.model';
import { ConstructorType } from './constructor-type';

@Component({
  selector: 'app-constructor-host',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './constructor-host.component.html',
  styleUrl: './constructor-host.component.scss',
})
export class ConstructorHostComponent {
  private store = inject(CustomGamesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  /** Per-type конструктор регистрирует себя здесь через `register()`. */
  active = signal<ConstructorType | null>(null);

  type = signal<CustomGameType>(
    Number(this.route.snapshot.paramMap.get('type')) as CustomGameType,
  );
  typeInfo = computed(() => GAME_TYPES.find((t) => t.id === this.type()));

  saving = signal(false);
  savedId = signal<string | null>(null);
  done = computed(() => this.savedId() !== null);

  steps = computed(() => this.active()?.steps ?? []);
  stepIndex = computed(() => this.active()?.stepIndex() ?? 0);
  canAdvance = computed(() => this.active()?.canAdvance() ?? false);
  readyToSave = computed(() => this.active()?.readyToSave() ?? false);

  progress = computed(() => {
    const total = this.steps().length + 1; // + экран «Готово»
    const done = this.done() ? total : this.stepIndex();
    return (done / total) * 100;
  });

  /** Вызывается per-type конструктором из его конструктора класса. */
  register(impl: ConstructorType): void {
    this.active.set(impl);
  }

  advance(): void {
    const impl = this.active();
    if (impl && impl.canAdvance()) impl.advance();
  }

  back(): void {
    const impl = this.active();
    if (impl && !impl.goBack()) {
      this.router.navigate(['/constructor']);
    }
  }

  async save(): Promise<void> {
    const impl = this.active();
    if (!impl || !impl.readyToSave() || this.saving()) return;
    this.saving.set(true);
    try {
      const id = crypto.randomUUID();
      const now = Date.now();
      const game = {
        ...impl.build(),
        id,
        schema: CUSTOM_GAME_SCHEMA,
        createdAt: now,
        updatedAt: now,
      } as CustomGame;
      await this.store.save(game);
      this.savedId.set(id);
    } finally {
      this.saving.set(false);
    }
  }
}
```

`constructor-host.component.html`:

```html
<section class="host">
  <header class="host__head">
    <div>
      <h1>{{ typeInfo()?.name }}</h1>
      <p>{{ typeInfo()?.description }}</p>
    </div>
    <a routerLink="/constructor" class="ghost-link">
      <i class="fi fi-rr-apps"></i> Все направления
    </a>
  </header>

  @if (!done()) {
    <ol class="stepper">
      @for (s of steps(); track s.id; let i = $index) {
        <li [class.active]="i === stepIndex()" [class.passed]="i < stepIndex()">
          <span class="stepper__num">{{ i + 1 }}</span>
          <span class="stepper__label">{{ s.label }}</span>
        </li>
      }
    </ol>
  }

  <div class="progress"><div [style.width.%]="progress()"></div></div>

  @if (!done()) {
    <div class="host__body">
      @switch (type()) {
        @default {
          <div class="todo-card">
            <i class="fi fi-rr-hammer"></i>
            <h2>Конструктор в разработке</h2>
            <p>Этот тип игры скоро появится.</p>
          </div>
        }
      }
    </div>

    <div class="actions">
      <button type="button" class="lg-btn" (click)="back()">
        <i class="fi fi-rr-arrow-left"></i> Назад
      </button>
      @if (stepIndex() < steps().length - 1) {
        <button type="button" class="lg-btn lg-btn--tomato" [disabled]="!canAdvance()" (click)="advance()">
          Продолжить <i class="fi fi-rr-arrow-right"></i>
        </button>
      } @else {
        <button type="button" class="lg-btn lg-btn--tomato" [disabled]="!readyToSave() || saving()" (click)="save()">
          <i class="fi fi-rr-check"></i> Создать игру
        </button>
      }
    </div>
  } @else {
    <div class="done">
      <div class="success-illu"><i class="fi fi-rr-confetti"></i></div>
      <h2>Готово!</h2>
      <p>Игра сохранена в вашем браузере и доступна в «Моих играх».</p>
      <div class="actions" style="justify-content: center;">
        <a routerLink="/my-games" class="lg-btn lg-btn--tomato">
          <i class="fi fi-rr-bookmark"></i> К моим играм
        </a>
        <a routerLink="/constructor" class="lg-btn">
          <i class="fi fi-rr-plus"></i> Ещё одну
        </a>
      </div>
    </div>
  }
</section>
```

`constructor-host.component.scss`:

```scss
.host { max-width: 900px; margin: 0 auto; padding: clamp(0.8rem, 3vw, 2rem); }
.host__head {
  display: flex; flex-wrap: wrap; gap: 1rem;
  justify-content: space-between; align-items: flex-start; margin-bottom: 1.2rem;
  h1 { font-family: var(--font-display); font-weight: 900; margin: 0 0 0.3rem; }
  p { color: var(--text-muted); margin: 0; }
}
.ghost-link {
  display: inline-flex; align-items: center; gap: 0.4rem; white-space: nowrap;
  text-decoration: none; color: var(--ink); font-weight: 700;
  border: 2px solid var(--ink); border-radius: var(--radius-pill);
  padding: 0.5rem 1rem; background: var(--paper);
}
.stepper {
  list-style: none; display: flex; flex-wrap: wrap; gap: 0.5rem;
  padding: 0; margin: 0 0 0.8rem;
  li {
    display: flex; align-items: center; gap: 0.45rem;
    font-weight: 700; color: var(--text-muted); font-size: 0.9rem;
  }
  li.active { color: var(--ink); }
  .stepper__num {
    width: 26px; height: 26px; display: grid; place-items: center;
    border: 2px solid currentColor; border-radius: 50%; font-size: 0.85rem;
  }
  li.active .stepper__num { background: var(--tomato); color: var(--paper); border-color: var(--ink); }
  li.passed .stepper__num { background: var(--mint); color: var(--paper); border-color: var(--ink); }
}
.progress {
  height: 8px; border: 2px solid var(--ink); border-radius: var(--radius-pill);
  background: var(--paper); overflow: hidden; margin-bottom: 1.4rem;
  div { height: 100%; background: var(--tomato); transition: width 0.3s ease; }
}
.host__body { margin-bottom: 1.4rem; }
.todo-card, .done {
  text-align: center; border: 2px dashed var(--ink); border-radius: var(--radius);
  padding: 2rem 1rem; background: var(--paper);
  i { font-size: 2.4rem; }
  h2 { font-family: var(--font-display); margin: 0.6rem 0 0.3rem; }
  p { color: var(--text-muted); margin: 0; }
}
.done { border-style: solid; box-shadow: var(--shadow-sticker); }
.actions {
  display: flex; flex-wrap: wrap; gap: 0.8rem; justify-content: space-between;
}
.lg-btn {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.8rem 1.4rem; border: 2px solid var(--ink);
  border-radius: var(--radius-pill); background: var(--paper);
  font-family: var(--font-display); font-weight: 800; cursor: pointer;
  text-decoration: none; color: var(--ink); min-height: 48px;
  box-shadow: var(--shadow-sticker-sm); transition: transform 0.16s ease;
  &:hover:not(:disabled) { transform: translate(-2px, -2px); box-shadow: var(--shadow-sticker); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}
.lg-btn--tomato { background: var(--tomato); color: var(--paper); }
.success-illu i { font-size: 3rem; color: var(--sun-dark); }
```

- [ ] **Step 6: Заменить `CustomPlayerComponent` на хост**

`custom-player.component.ts` (полная замена):

```ts
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomGamesService } from './custom-games.service';
import { CustomGame, GAME_TYPES, isLegacyGame } from './custom-game.model';
import { stop } from '../../common/functions/sounds.functions';

type Phase = 'intro' | 'play' | 'done';

@Component({
  selector: 'app-custom-player',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './custom-player.component.html',
  styleUrl: './custom-player.component.scss',
})
export class CustomPlayerComponent implements OnInit, OnDestroy {
  private store = inject(CustomGamesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  game = signal<CustomGame | null>(null);
  phase = signal<Phase>('intro');
  /** Сколько заданий пройдено верно — для прогресса. */
  solved = signal(0);

  typeName = computed(() => GAME_TYPES.find((t) => t.id === this.game()?.type)?.name ?? '');
  total = computed(() => this.game()?.levels.length ?? 0);
  progress = computed(() => {
    const t = this.total();
    return t === 0 ? 0 : (this.solved() / t) * 100;
  });

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (!id) { this.router.navigate(['/my-games']); return; }
    const g = await this.store.get(id);
    if (!g || isLegacyGame(g) || g.levels.length === 0) {
      this.router.navigate(['/my-games']);
      return;
    }
    this.game.set(g);
  }

  ngOnDestroy(): void { stop(); }

  start(): void { this.phase.set('play'); }

  onAnswered(correct: boolean): void {
    if (correct) this.solved.update((n) => n + 1);
  }

  onFinished(): void {
    this.solved.set(this.total());
    this.phase.set('done');
  }

  restart(): void {
    this.solved.set(0);
    this.phase.set('intro');
    // Пересоздаём игру, чтобы per-type режим перемонтировался с нуля.
    const g = this.game();
    this.game.set(null);
    queueMicrotask(() => this.game.set(g));
  }
}
```

`custom-player.component.html`:

```html
@if (game(); as g) {
  <section class="player">
    <header class="player__head">
      <button type="button" class="back" (click)="restart()" aria-label="Заново">
        <i class="fi fi-rr-refresh"></i>
      </button>
      <div>
        <h1>{{ g.name }}</h1>
        <span class="muted">{{ typeName() }}</span>
      </div>
      <a routerLink="/my-games" class="exit" aria-label="Выйти">
        <i class="fi fi-rr-cross-small"></i>
      </a>
    </header>

    <div class="progress"><div [style.width.%]="progress()"></div></div>

    @if (phase() === 'intro') {
      <div class="stage">
        <div class="stage__hero">
          <i class="fi fi-rr-play-circle"></i>
          <h2>Готовы?</h2>
          <p>Выполните все задания игры.</p>
          <button type="button" class="btn-action" (click)="start()">
            <i class="fi fi-rr-play"></i> Начать
          </button>
        </div>
      </div>
    }

    @if (phase() === 'play') {
      <div class="stage stage--game">
        @switch (g.type) {
          @default {
            <div class="stage__hero">
              <i class="fi fi-rr-hammer"></i>
              <h2>Режим в разработке</h2>
              <p>Этот тип игры скоро можно будет играть.</p>
            </div>
          }
        }
      </div>
    }

    @if (phase() === 'done') {
      <div class="stage">
        <div class="stage__hero success">
          <i class="fi fi-rr-trophy"></i>
          <h2>Игра пройдена!</h2>
          <div class="row">
            <button type="button" class="btn-action" (click)="restart()">
              <i class="fi fi-rr-refresh"></i> Заново
            </button>
            <a routerLink="/my-games" class="btn-ghost">
              <i class="fi fi-rr-bookmark"></i> К моим играм
            </a>
          </div>
        </div>
      </div>
    }
  </section>
}
```

`custom-player.component.scss`:

```scss
.player {
  max-width: 760px; margin: 0 auto;
  padding: clamp(0.8rem, 3vw, 1.6rem);
  display: flex; flex-direction: column; min-height: 100%;
}
.player__head {
  display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.8rem;
  h1 { font-family: var(--font-display); font-size: clamp(1.1rem, 3vw, 1.5rem); margin: 0; }
  .muted { color: var(--text-muted); font-size: 0.85rem; }
  div { flex: 1; min-width: 0; }
}
.back, .exit {
  width: 44px; height: 44px; flex-shrink: 0;
  display: grid; place-items: center;
  border: 2px solid var(--ink); border-radius: 50%;
  background: var(--paper); cursor: pointer; color: var(--ink);
  text-decoration: none; font-size: 1.1rem;
}
.progress {
  height: 8px; border: 2px solid var(--ink); border-radius: var(--radius-pill);
  background: var(--paper); overflow: hidden; margin-bottom: 1.2rem;
  div { height: 100%; background: var(--mint); transition: width 0.3s ease; }
}
.stage {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}
.stage--game { justify-content: flex-start; }
.stage__hero {
  text-align: center; max-width: 420px;
  i { font-size: 3rem; color: var(--tomato); }
  &.success i { color: var(--sun-dark); }
  h2 { font-family: var(--font-display); margin: 0.6rem 0 0.3rem; }
  p { color: var(--text-muted); }
}
.btn-action {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.9rem 1.6rem; min-height: 48px;
  border: 2px solid var(--ink); border-radius: var(--radius-pill);
  background: var(--tomato); color: var(--paper);
  font-family: var(--font-display); font-weight: 800; cursor: pointer;
  box-shadow: var(--shadow-sticker-sm);
}
.btn-ghost {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.9rem 1.6rem; min-height: 48px;
  border: 2px solid var(--ink); border-radius: var(--radius-pill);
  background: var(--paper); color: var(--ink); text-decoration: none;
  font-family: var(--font-display); font-weight: 800;
}
.row { display: flex; flex-wrap: wrap; gap: 0.8rem; justify-content: center; }
```

- [ ] **Step 7: Обновить `MyGamesComponent` под новую модель**

В `my-games.component.ts` заменить импорт и добавить хелпер `legacy`:

```ts
import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CustomGamesService } from './custom-games.service';
import { CustomGame, GAME_TYPES, isLegacyGame } from './custom-game.model';

@Component({
  selector: 'app-my-games',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './my-games.component.html',
  styleUrl: './my-games.component.scss',
})
export class MyGamesComponent {
  private store = inject(CustomGamesService);

  games = this.store.games;
  types = GAME_TYPES;

  typeName(id: number): string {
    return this.types.find((t) => t.id === id)?.name ?? 'Игра';
  }

  typeIcon(id: number): string {
    return this.types.find((t) => t.id === id)?.icon ?? 'fi-rr-puzzle-alt';
  }

  legacy(game: CustomGame): boolean {
    return isLegacyGame(game);
  }

  async export(game: CustomGame): Promise<void> {
    await this.store.exportToFile(game);
  }

  async remove(game: CustomGame): Promise<void> {
    if (confirm(`Удалить игру «${game.name}»?`)) {
      await this.store.remove(game.id);
    }
  }

  async onImport(ev: Event): Promise<void> {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (file) await this.store.importFromFile(file);
    (ev.target as HTMLInputElement).value = '';
  }
}
```

В `my-games.component.html` заменить блок `.game-card` footer/meta так, чтобы
устаревшие игры не предлагали «Играть» и не обращались к `g.sound`:

```html
    <article class="game-card" *ngFor="let g of games()" [class.legacy]="legacy(g)">
      <header>
        <span class="icon"><i class="fi" [class]="typeIcon(g.type)"></i></span>
        <div>
          <h3>{{ g.name }}</h3>
          <span class="muted">{{ typeName(g.type) }}</span>
        </div>
      </header>

      <p class="desc" *ngIf="g.description">{{ g.description }}</p>
      <p class="legacy-note" *ngIf="legacy(g)">
        <i class="fi fi-rr-triangle-warning"></i> Устаревший формат — пересоздайте игру.
      </p>

      <dl>
        <div><dt>Заданий</dt><dd>{{ g.levels.length }}</dd></div>
        <div><dt>Обновлено</dt><dd>{{ g.updatedAt | date: 'd MMM, HH:mm' }}</dd></div>
      </dl>

      <footer>
        <a *ngIf="!legacy(g)" class="chip primary" [routerLink]="'/custom-play'" [queryParams]="{ id: g.id }">
          <i class="fi fi-rr-play"></i> Играть
        </a>
        <button type="button" class="chip" (click)="export(g)">
          <i class="fi fi-rr-download"></i> Экспорт
        </button>
        <button type="button" class="chip danger" (click)="remove(g)">
          <i class="fi fi-rr-trash"></i>
        </button>
      </footer>
    </article>
```

Добавить в `my-games.component.scss` в конец:

```scss
.game-card.legacy { opacity: 0.85; }
.legacy-note {
  display: flex; align-items: center; gap: 0.4rem;
  color: var(--tomato-dark); font-size: 0.85rem; font-weight: 600; margin: 0;
}
```

- [ ] **Step 8: Обновить роуты `app.routes.ts`**

Заменить блоки `constructor` и `custom-play`:

```ts
  {
    path: 'constructor',
    loadComponent: () =>
      import('./constructor/constructor-picker.component').then((m) => m.ConstructorPickerComponent),
  },
  {
    path: 'constructor/:type',
    loadComponent: () =>
      import('./constructor/constructor-host.component').then((m) => m.ConstructorHostComponent),
  },
  {
    path: 'my-games',
    loadComponent: () =>
      import('./constructor/my-games.component').then((m) => m.MyGamesComponent),
  },
  {
    path: 'custom-play',
    loadComponent: () =>
      import('./constructor/custom-player.component').then((m) => m.CustomPlayerComponent),
  },
```

- [ ] **Step 9: Проверить сборку**

Run: `npm run build`
Expected: BUILD SUCCESS — без ошибок TypeScript.

- [ ] **Step 10: Коммит**

```bash
git add -A
git commit -m "feat: replace generic constructor with picker + per-type host scaffolding"
```

---

### Task 3: `AssetDropComponent` — загрузка картинки/аудио + запись с микрофона

**Files:**
- Create: `src/app/constructor/shared/asset-drop.component.ts`, `.html`, `.scss`

- [ ] **Step 1: Создать `asset-drop.component.ts`**

```ts
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { CustomGamesService } from '../custom-games.service';
import { CustomGameAsset } from '../custom-game.model';
import { DropFileDirective } from '../drop-file.directive';

@Component({
  selector: 'app-asset-drop',
  standalone: true,
  imports: [DropFileDirective],
  templateUrl: './asset-drop.component.html',
  styleUrl: './asset-drop.component.scss',
})
export class AssetDropComponent {
  private store = inject(CustomGamesService);

  /** 'image' — только файл; 'audio' — файл + запись с микрофона. */
  kind = input.required<'image' | 'audio'>();
  /** Подсказка под зоной загрузки. */
  hint = input('');
  /** Текущее значение (data-URL ассет). */
  value = input<CustomGameAsset | undefined>(undefined);

  changed = output<CustomGameAsset>();

  accept = computed(() => (this.kind() === 'image' ? 'image/*' : 'audio/*'));

  recording = signal(false);
  recError = signal<string | null>(null);
  private recorder: MediaRecorder | null = null;
  private chunks: BlobPart[] = [];

  async onFile(file: File): Promise<void> {
    const asset = await this.store.fileToAsset(file);
    this.changed.emit(asset);
  }

  async toggleRecord(): Promise<void> {
    if (this.recording()) {
      this.recorder?.stop();
      return;
    }
    this.recError.set(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.chunks = [];
      this.recorder = new MediaRecorder(stream);
      this.recorder.ondataavailable = (e) => this.chunks.push(e.data);
      this.recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        this.recording.set(false);
        const blob = new Blob(this.chunks, { type: this.recorder?.mimeType || 'audio/webm' });
        const file = new File([blob], `запись-${Date.now()}.webm`, { type: blob.type });
        await this.onFile(file);
      };
      this.recorder.start();
      this.recording.set(true);
    } catch {
      this.recError.set('Не удалось получить доступ к микрофону. Загрузите файл.');
    }
  }
}
```

- [ ] **Step 2: Создать `asset-drop.component.html`**

```html
<div class="asset-drop">
  <div
    class="zone"
    appDropFile
    [accept]="accept()"
    (fileSelected)="onFile($event)"
  >
    @if (kind() === 'image' && value()) {
      <img [src]="value()!.data" alt="">
    } @else if (kind() === 'audio' && value()) {
      <audio [src]="value()!.data" controls></audio>
    } @else {
      <i class="fi" [class.fi-rr-picture]="kind() === 'image'" [class.fi-rr-volume]="kind() === 'audio'"></i>
      <p>Перетащите файл сюда или нажмите, чтобы выбрать</p>
    }
  </div>

  @if (hint()) {
    <p class="hint">{{ hint() }}</p>
  }

  @if (kind() === 'audio') {
    <button type="button" class="rec-btn" [class.active]="recording()" (click)="toggleRecord()">
      <i class="fi" [class.fi-rr-microphone]="!recording()" [class.fi-rr-stop]="recording()"></i>
      {{ recording() ? 'Остановить запись' : 'Записать с микрофона' }}
    </button>
    @if (recError()) {
      <p class="rec-error">{{ recError() }}</p>
    }
  }
</div>
```

- [ ] **Step 3: Создать `asset-drop.component.scss`**

```scss
.asset-drop { display: flex; flex-direction: column; gap: 0.5rem; }
.zone {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 0.4rem; text-align: center;
  min-height: 130px; padding: 1rem;
  border: 2px dashed var(--ink); border-radius: var(--radius);
  background: var(--cream); cursor: pointer; color: var(--text-muted);
  i { font-size: 1.8rem; }
  p { margin: 0; font-size: 0.85rem; }
  img { max-width: 100%; max-height: 180px; border-radius: 12px; }
  audio { width: 100%; }
  &.drag-over { background: var(--sun); color: var(--ink); }
}
.hint { margin: 0; font-size: 0.8rem; color: var(--text-muted); }
.rec-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
  min-height: 44px; padding: 0.5rem 1rem;
  border: 2px solid var(--ink); border-radius: var(--radius-pill);
  background: var(--paper); font-weight: 700; cursor: pointer; color: var(--ink);
  &.active { background: var(--tomato); color: var(--paper); }
}
.rec-error { margin: 0; font-size: 0.8rem; color: var(--tomato-dark); }
```

- [ ] **Step 4: Проверить сборку**

Run: `npm run build`
Expected: BUILD SUCCESS.

- [ ] **Step 5: Коммит**

```bash
git add src/app/constructor/shared/asset-drop.component.ts src/app/constructor/shared/asset-drop.component.html src/app/constructor/shared/asset-drop.component.scss
git commit -m "feat: AssetDropComponent with file upload and mic recording"
```

---

### Task 4: `SoundPickerComponent` и `SoundPairPickerComponent`

**Files:**
- Create: `src/app/constructor/shared/sound-picker.component.ts`, `.html`, `.scss`
- Create: `src/app/constructor/shared/sound-pair-picker.component.ts`, `.html`

- [ ] **Step 1: Создать `sound-picker.component.ts`**

```ts
import { Component, input, model } from '@angular/core';
import { SOUND_GROUPS } from '../custom-game.model';

@Component({
  selector: 'app-sound-picker',
  standalone: true,
  imports: [],
  templateUrl: './sound-picker.component.html',
  styleUrl: './sound-picker.component.scss',
})
export class SoundPickerComponent {
  /** 'single' — один звук (string), 'multi' — массив строк. */
  mode = input<'single' | 'multi'>('single');
  /** Выбранные звуки. Для single — массив из 0–1 элемента. */
  selected = model<string[]>([]);

  groups = SOUND_GROUPS;

  isActive(char: string): boolean {
    return this.selected().includes(char);
  }

  toggle(char: string): void {
    if (this.mode() === 'single') {
      this.selected.set(this.isActive(char) ? [] : [char]);
      return;
    }
    this.selected.update((arr) =>
      arr.includes(char) ? arr.filter((c) => c !== char) : [...arr, char],
    );
  }
}
```

- [ ] **Step 2: Создать `sound-picker.component.html`**

```html
<div class="sound-groups">
  @for (group of groups; track group.id) {
    <article class="sound-group">
      <h3>{{ group.name }}</h3>
      <div class="sound-grid">
        @for (s of group.sounds; track s.char) {
          <button
            type="button"
            class="sound-chip"
            [class.soft]="s.soft"
            [class.active]="isActive(s.char)"
            (click)="toggle(s.char)"
          >{{ s.char }}</button>
        }
      </div>
    </article>
  }
</div>
```

- [ ] **Step 3: Создать `sound-picker.component.scss`**

```scss
.sound-groups {
  display: grid; gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr));
}
.sound-group {
  border: 2px solid var(--ink); border-radius: var(--radius);
  background: var(--paper); padding: 0.9rem;
  h3 { margin: 0 0 0.6rem; font-family: var(--font-display); font-size: 1rem; }
}
.sound-grid { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.sound-chip {
  min-width: 44px; min-height: 44px; padding: 0.3rem 0.5rem;
  border: 2px solid var(--ink); border-radius: 12px;
  background: var(--cream); font-family: var(--font-display);
  font-weight: 800; font-size: 1.05rem; cursor: pointer; color: var(--ink);
  &.soft { border-style: dashed; }
  &.active { background: var(--tomato); color: var(--paper); }
}
```

- [ ] **Step 4: Создать `sound-pair-picker.component.ts`**

```ts
import { Component, model } from '@angular/core';
import { SOUND_PAIRS } from '../custom-game.model';

@Component({
  selector: 'app-sound-pair-picker',
  standalone: true,
  imports: [],
  templateUrl: './sound-pair-picker.component.html',
  styleUrl: './sound-picker.component.scss',
})
export class SoundPairPickerComponent {
  /** id выбранной пары из SOUND_PAIRS. */
  selected = model<string | null>(null);
  pairs = SOUND_PAIRS;

  pick(id: string): void {
    this.selected.set(this.selected() === id ? null : id);
  }
}
```

- [ ] **Step 5: Создать `sound-pair-picker.component.html`**

```html
<div class="sound-group">
  <h3>Группы парных звуков</h3>
  <div class="sound-grid">
    @for (p of pairs; track p.id) {
      <button
        type="button"
        class="sound-chip"
        [class.soft]="p.soft"
        [class.active]="selected() === p.id"
        (click)="pick(p.id)"
      >{{ p.label }}</button>
    }
  </div>
</div>
```

- [ ] **Step 6: Проверить сборку**

Run: `npm run build`
Expected: BUILD SUCCESS.

- [ ] **Step 7: Коммит**

```bash
git add src/app/constructor/shared/sound-picker.component.ts src/app/constructor/shared/sound-picker.component.html src/app/constructor/shared/sound-picker.component.scss src/app/constructor/shared/sound-pair-picker.component.ts src/app/constructor/shared/sound-pair-picker.component.html
git commit -m "feat: SoundPicker and SoundPairPicker shared components"
```

---

### Task 5: Чистая логика — `word-utils.ts` (TDD)

**Files:**
- Create: `src/app/constructor/word-utils.ts`
- Test: `src/app/constructor/word-utils.spec.ts`

Эти функции нужны Плану 2 (тип 7) и Плану 3 (типы 6, 7). Реализуются здесь
с тестами, чтобы зафиксировать поведение заранее.

- [ ] **Step 1: Написать падающие тесты `word-utils.spec.ts`**

```ts
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
```

- [ ] **Step 2: Запустить — убедиться, что падает**

Run: `npm test -- --watch=false --browsers=ChromeHeadless`
Expected: FAIL — модуль `word-utils` не найден.

- [ ] **Step 3: Реализовать `word-utils.ts`**

```ts
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
```

- [ ] **Step 4: Запустить — убедиться, что проходит**

Run: `npm test -- --watch=false --browsers=ChromeHeadless`
Expected: PASS (все тесты `word-utils` + `isLegacyGame`).

- [ ] **Step 5: Коммит**

```bash
git add src/app/constructor/word-utils.ts src/app/constructor/word-utils.spec.ts
git commit -m "feat: word-utils (split, shuffle by difficulty, relative question)"
```

---

### Task 6: Адаптив встроенных игр с выбором картинки

`what-sound`, `phonemic-awareness`, `phoneme-analysis`, `first-or-last-char` —
все показывают 2 карточки выбора. Заводим общие классы в `src/styles.scss` и
переводим шаблоны на CSS Grid вместо Bootstrap-сетки.

**Files:**
- Modify: `src/styles.scss` (добавить блок в конец)
- Modify: `src/app/games/what-sound/what-sound.component.html`, `.scss`
- Modify: `src/app/games/phonemic-awareness/phonemic-awareness.component.html`, `.scss`
- Modify: `src/app/games/phoneme-analysis/phoneme-analysis.component.html`
- Modify: `src/app/games/first-or-last-char/first-or-last-char.component.html`, `.scss`

- [ ] **Step 1: Добавить общие игровые классы в `src/styles.scss`**

В конец файла:

```scss
/* === Общая адаптивная вёрстка встроенных игр === */
.game-replay {
  display: flex; justify-content: center; margin-bottom: 1rem;
}
.game-replay__btn {
  display: inline-flex; align-items: center; gap: 0.5rem;
  min-height: 48px; padding: 0.7rem 1.6rem;
  border: 2px solid var(--ink); border-radius: var(--radius-pill);
  background: var(--sun); color: var(--ink);
  font-family: var(--font-display); font-weight: 800;
  font-size: clamp(1rem, 2.5vw, 1.2rem); cursor: pointer;
  box-shadow: var(--shadow-sticker-sm);
}
.game-choices {
  display: grid; gap: clamp(0.6rem, 2vw, 1.2rem);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
}
.game-choice {
  display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
  padding: clamp(0.6rem, 2vw, 1rem);
  border: 2px solid var(--ink); border-radius: var(--radius);
  background: var(--paper); cursor: pointer;
  box-shadow: var(--shadow-sticker-sm); transition: transform 0.16s ease;
  &:hover { transform: translate(-2px, -2px); box-shadow: var(--shadow-sticker); }
}
.game-choice__img {
  width: 100%; aspect-ratio: 1 / 1; object-fit: cover;
  border-radius: 12px; border: 2px solid var(--ink);
}
.game-choice__label {
  font-family: var(--font-display); font-weight: 800;
  font-size: clamp(1.1rem, 3vw, 1.6rem); text-align: center; margin: 0;
}
```

- [ ] **Step 2: Переписать `what-sound.component.html`**

```html
<div class="game-replay">
  <button type="button" class="game-replay__btn" (click)="play()">
    <i class="fi fi-rr-volume"></i> Повтор
  </button>
</div>

<div class="game-choices">
  @for (sound of currentSounds; track sound.id) {
    <button type="button" class="game-choice" (click)="answer(sound)">
      <img class="game-choice__img" [src]="sound.image" alt="">
      <p class="game-choice__label">{{ sound.text }}</p>
    </button>
  }
</div>
```

- [ ] **Step 3: Заменить `what-sound.component.scss` на пустой комментарий**

```scss
/* Вёрстка вынесена в общие классы .game-* в src/styles.scss */
```

- [ ] **Step 4: Переписать `phonemic-awareness.component.html`**

```html
<div class="game-replay">
  <button type="button" class="game-replay__btn" (click)="play()">
    <i class="fi fi-rr-volume"></i> Повтор
  </button>
</div>

<div class="game-choices">
  @for (answer of currentAnswers; track answer.word) {
    <button type="button" class="game-choice" (click)="checkAnswer(answer)">
      @if (answer.image) {
        <img class="game-choice__img" [src]="answer.image" alt="">
      }
      <p class="game-choice__label">{{ answer.word }}</p>
    </button>
  }
</div>
```

- [ ] **Step 5: Заменить `phonemic-awareness.component.scss` на пустой комментарий**

```scss
/* Вёрстка вынесена в общие классы .game-* в src/styles.scss */
```

- [ ] **Step 6: Переписать `phoneme-analysis.component.html`**

```html
<div class="game-replay">
  <button type="button" class="game-replay__btn" (click)="play()">
    <i class="fi fi-rr-volume"></i> Повтор
  </button>
</div>

<div class="game-choices">
  @for (answer of answers; track $index) {
    <button type="button" class="game-choice" (click)="sendAnswer($index)">
      <img class="game-choice__img" [src]="answer" alt="">
    </button>
  }
</div>
```

- [ ] **Step 7: Переписать `first-or-last-char.component.html`**

```html
<div class="game-replay">
  <button type="button" class="game-replay__btn" (click)="play()">
    <i class="fi fi-rr-volume"></i> Повтор
  </button>
</div>

<div class="game-choices">
  @for (answer of currentAnswers; track answer.answer) {
    <button type="button" class="game-choice" (click)="sendAnswer(answer)">
      <img class="game-choice__img" [src]="answer.image" alt="">
      <p class="game-choice__label">{{ answer.answer }}</p>
    </button>
  }
</div>
```

- [ ] **Step 8: Заменить `first-or-last-char.component.scss` на пустой комментарий**

```scss
/* Вёрстка вынесена в общие классы .game-* в src/styles.scss */
```

- [ ] **Step 9: Проверить сборку**

Run: `npm run build`
Expected: BUILD SUCCESS.

- [ ] **Step 10: Коммит**

```bash
git add src/styles.scss src/app/games/what-sound src/app/games/phonemic-awareness src/app/games/phoneme-analysis src/app/games/first-or-last-char
git commit -m "fix: responsive layout for image-choice built-in games"
```

---

### Task 7: Адаптив `sound-position` и `make-word-by-sounds`

**Files:**
- Modify: `src/app/games/sound-position/sound-position.component.html`, `.scss`
- Modify: `src/app/games/make-word-by-sounds/make-word-by-sounds.component.html`, `.scss`

- [ ] **Step 1: Переписать `sound-position.component.html`**

```html
<div class="game-replay">
  <button type="button" class="game-replay__btn" (click)="play()">
    <i class="fi fi-rr-volume"></i> Повтор
  </button>
</div>

<div class="position-options">
  @for (answer of answerOptions; track answer.position) {
    <button type="button" class="position-btn" (click)="sendAnswer(answer.position)">
      {{ answer.name }}
    </button>
  }
</div>
```

- [ ] **Step 2: Заменить `sound-position.component.scss`**

```scss
.position-options {
  display: grid; gap: clamp(0.6rem, 2vw, 1rem);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 160px), 1fr));
}
.position-btn {
  min-height: 64px; padding: 0.8rem 1rem;
  border: 2px solid var(--ink); border-radius: var(--radius);
  background: var(--paper); color: var(--ink);
  font-family: var(--font-display); font-weight: 800;
  font-size: clamp(1.1rem, 3vw, 1.6rem); cursor: pointer;
  box-shadow: var(--shadow-sticker-sm); transition: transform 0.16s ease;
  &:hover { transform: translate(-2px, -2px); box-shadow: var(--shadow-sticker); }
}
```

- [ ] **Step 3: Переписать `make-word-by-sounds.component.html`**

```html
<div class="game-replay">
  <button type="button" class="game-replay__btn" (click)="play()">
    <i class="fi fi-rr-volume"></i> Повтор
  </button>
</div>

<div class="tiles-block">
  <p class="tiles-caption">Буквы:</p>
  <div class="tiles">
    @for (syllable of currentSyllables; track $index) {
      <button type="button" class="tile" [class.tile--empty]="!syllable" (click)="selectSyllable($index)">
        {{ syllable ?? '·' }}
      </button>
    }
  </div>
</div>

<div class="tiles-block">
  <p class="tiles-caption">Слово:</p>
  <div class="tiles">
    @for (syllable of currentSyllables; track $index) {
      <button type="button" class="tile tile--slot" (click)="removeSyllable(answer[$index], $index)">
        {{ answer[$index]?.char ?? '_' }}
      </button>
    }
  </div>
</div>
```

- [ ] **Step 4: Заменить `make-word-by-sounds.component.scss`**

```scss
.tiles-block { margin-bottom: 1.4rem; }
.tiles-caption {
  margin: 0 0 0.5rem; font-weight: 700; color: var(--text-muted);
}
.tiles {
  display: flex; flex-wrap: wrap; gap: clamp(0.4rem, 1.5vw, 0.7rem);
  justify-content: center;
}
.tile {
  width: clamp(48px, 12vw, 64px); height: clamp(48px, 12vw, 64px);
  display: grid; place-items: center;
  border: 2px solid var(--ink); border-radius: 12px;
  background: var(--sky); color: var(--paper);
  font-family: var(--font-display); font-weight: 800;
  font-size: clamp(1.4rem, 5vw, 2rem); cursor: pointer;
  box-shadow: var(--shadow-sticker-sm);
}
.tile--empty { background: var(--cream-deep); color: var(--text-muted); cursor: default; }
.tile--slot { background: var(--paper); color: var(--ink); border-style: dashed; }
```

- [ ] **Step 5: Проверить сборку**

Run: `npm run build`
Expected: BUILD SUCCESS.

- [ ] **Step 6: Ручная проверка адаптива**

Run: `npm start`
Открыть `http://localhost:4200`, в DevTools включить мобильный вид (~360px).
Пройти по темам в раздел игр, открыть игры типов 1–5 и 7. Ожидается:
- нет горизонтального скролла;
- картинки выбора занимают ширину колонки, не обрезаются жёстко по 180px;
- кнопки «Повтор», «Начало/Середина/Конец», плитки букв — крупные, не наезжают.

- [ ] **Step 7: Коммит**

```bash
git add src/app/games/sound-position src/app/games/make-word-by-sounds
git commit -m "fix: responsive layout for sound-position and make-word-by-sounds"
```

---

## Self-Review

- **Покрытие спеки:** модель-объединение (Task 1), `SOUND_PAIRS` (Task 1),
  legacy-guard (Task 1, используется в Task 2 my-games + плеер), общие блоки
  `AssetDrop`/`SoundPicker`/`SoundPairPicker` (Tasks 3–4), `ConstructorPicker`
  + `ConstructorHost` + роуты + плеер-хост (Task 2), интерфейсы `ConstructorType`
  / `CustomPlayerMode` (Task 2), `word-utils` для типов 6/7 (Task 5), адаптив 8
  встроенных игр (Tasks 6–7, `sound-sequence`/`word-conversion` — заглушки, вне
  объёма по спеке). Per-type конструкторы и плееры — Планы 2 и 3.
- **Плейсхолдеры:** нет — каждый шаг содержит полный код или точную команду.
- **Согласованность типов:** `ConstructorType`, `CustomPlayerMode`,
  `CUSTOM_GAME_SCHEMA`, `isLegacyGame`, `GAME_TYPES`, `SOUND_PAIRS`,
  `splitWord`/`shuffleByDifficulty`/`buildRelativeQuestion` объявлены в Tasks 1,
  2, 5 и используются согласованно; Планы 2 и 3 опираются на эти же сигнатуры.
