export interface CustomGameAsset {
  name: string;
  mime: string;
  data: string;
}

export interface CustomGameLevel {
  id: number;
  word?: string;
  correctImage?: CustomGameAsset;
  correctAudio?: CustomGameAsset;
  incorrectImage?: CustomGameAsset;
  incorrectAudio?: CustomGameAsset;
}

export interface CustomGame {
  id: string;
  name: string;
  description?: string;
  type: number;
  sound: string;
  soundGroup?: string;
  createdAt: number;
  updatedAt: number;
  cover?: CustomGameAsset;
  levels: CustomGameLevel[];
}

export const GAME_TYPES: Array<{ id: number; name: string; description: string; icon: string }> = [
  {
    id: 1,
    name: 'Различение неречевых звуков',
    description: 'Ребёнок угадывает источник звука: машина, вертолёт и др.',
    icon: 'fi-rr-volume',
  },
  {
    id: 2,
    name: 'Слова-квазиомонимы',
    description: 'Выбрать слово, отличающееся от пары одной фонемой (коза — коса).',
    icon: 'fi-rr-comment',
  },
  {
    id: 8,
    name: 'Замена/перестановка звука',
    description: 'Преобразование слов: кот — ток.',
    icon: 'fi-rr-shuffle',
  },
  {
    id: 3,
    name: 'Есть ли звук в слове',
    description: 'Определить наличие заданного звука в слове.',
    icon: 'fi-rr-search',
  },
  {
    id: 4,
    name: 'Место звука в слове',
    description: 'Начало, середина или конец.',
    icon: 'fi-rr-marker',
  },
  {
    id: 5,
    name: 'Первый/последний звук',
    description: 'Выбрать слово, начинающееся/заканчивающееся на звук.',
    icon: 'fi-rr-arrow-right',
  },
  {
    id: 7,
    name: 'Место по отношению к другим',
    description: 'Считать звуки, определять порядок.',
    icon: 'fi-rr-list',
  },
  {
    id: 6,
    name: 'Составление слова из звуков',
    description: 'Собрать слово из перепутанной последовательности.',
    icon: 'fi-rr-puzzle-alt',
  },
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
