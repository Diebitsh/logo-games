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
