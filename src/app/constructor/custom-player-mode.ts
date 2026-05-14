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
