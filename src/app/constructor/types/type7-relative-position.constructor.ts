import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseConstructor } from '../shared/base-constructor';
import { AssetDropComponent } from '../shared/asset-drop.component';
import { SoundPickerComponent } from '../shared/sound-picker.component';
import { ConstructorStep } from '../constructor-type';
import {
  CustomGameAsset, RelativePositionGame, RelativePositionLevel,
} from '../custom-game.model';
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

  /** Содержит ли слово хотя бы один выбранный звук, у которого есть сосед. */
  private hasUsableSound(level: RelativePositionLevel): boolean {
    return this.sounds().some((s) => {
      const idx = level.letters.indexOf(s.toUpperCase());
      return idx > 0 || (idx >= 0 && idx < level.letters.length - 1);
    });
  }

  stepValid(index: number): boolean {
    if (index === 0) return this.sounds().length > 0;
    if (index === 1) {
      return this.levels().some(
        (l) => l.image && l.letters.length > 1 && this.hasUsableSound(l),
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
        (l) => l.image && l.letters.length > 1 && this.hasUsableSound(l),
      ),
    };
  }

  addLevel(): void {
    this.levels.update((arr) => [
      ...arr,
      { id: this.nextLevelId(arr), word: '', letters: [] },
    ]);
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

  trackLetter = (index: number) => index;
}
