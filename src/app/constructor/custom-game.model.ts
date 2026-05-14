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
