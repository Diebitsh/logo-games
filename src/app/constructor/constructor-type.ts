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
