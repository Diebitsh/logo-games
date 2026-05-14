import { afterNextRender, computed, inject, signal, Signal } from '@angular/core';
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
    // Регистрируемся в хосте после первого рендера: вызов в конструкторе
    // класса менял бы сигнал во время рендера хоста (ExpressionChangedAfterItHasBeenChecked).
    afterNextRender(() => this.host.register(this));
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
