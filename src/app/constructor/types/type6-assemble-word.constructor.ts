import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseConstructor } from '../shared/base-constructor';
import { AssetDropComponent } from '../shared/asset-drop.component';
import { ConstructorStep } from '../constructor-type';
import {
  AssembleWordGame, AssembleWordLevel, CustomGameAsset, ShuffleDifficulty,
} from '../custom-game.model';

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
    { id: 'easy', label: 'Легко', hint: 'меняются две буквы' },
    { id: 'medium', label: 'Средне', hint: 'меняются три буквы' },
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
