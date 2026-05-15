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
