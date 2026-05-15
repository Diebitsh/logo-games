import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseConstructor } from '../shared/base-constructor';
import { AssetDropComponent } from '../shared/asset-drop.component';
import { SoundPickerComponent } from '../shared/sound-picker.component';
import { ConstructorStep } from '../constructor-type';
import {
  CustomGameAsset, SOUND_GROUPS, WordChangeGame, WordChangeLevel,
} from '../custom-game.model';

const ALL_SOUNDS: string[] = SOUND_GROUPS.flatMap((g) => g.sounds.map((s) => s.char));

@Component({
  selector: 'app-type8-word-change-constructor',
  standalone: true,
  imports: [FormsModule, AssetDropComponent, SoundPickerComponent],
  templateUrl: './type8-word-change.constructor.html',
})
export class Type8WordChangeConstructor extends BaseConstructor {
  readonly steps: ConstructorStep[] = [
    { id: 'sound', label: 'Звук' },
    { id: 'levels', label: 'Контент' },
    { id: 'meta', label: 'Сохранение' },
  ];

  readonly allSounds = ALL_SOUNDS;

  sound = signal<string[]>([]);
  levels = signal<WordChangeLevel[]>([{ id: 1, sourceWord: '', insertSound: '' }]);
  name = signal('');
  description = signal('');

  soundChar = computed(() => this.sound()[0] ?? '');

  stepValid(index: number): boolean {
    if (index === 0) return this.sound().length === 1;
    if (index === 1) {
      return this.levels().some(
        (l) => l.sourceWord.trim() && l.insertSound && l.resultImage,
      );
    }
    return this.name().trim().length > 0;
  }

  build(): Omit<WordChangeGame, 'id' | 'createdAt' | 'updatedAt' | 'schema'> {
    return {
      type: 8,
      name: this.name().trim(),
      description: this.description().trim() || undefined,
      sound: this.soundChar(),
      levels: this.levels()
        .filter((l) => l.sourceWord.trim() && l.insertSound && l.resultImage)
        .map((l) => ({ ...l, sourceWord: l.sourceWord.trim() })),
    };
  }

  addLevel(): void {
    this.levels.update((arr) => [
      ...arr,
      { id: this.nextLevelId(arr), sourceWord: '', insertSound: '' },
    ]);
  }
  removeLevel(id: number): void {
    this.levels.update((arr) => arr.filter((l) => l.id !== id));
  }
  setWord(id: number, sourceWord: string): void {
    this.levels.update((arr) =>
      arr.map((l) => (l.id === id ? { ...l, sourceWord } : l)),
    );
  }
  setInsertSound(id: number, insertSound: string): void {
    this.levels.update((arr) =>
      arr.map((l) => (l.id === id ? { ...l, insertSound } : l)),
    );
  }
  setImage(id: number, asset: CustomGameAsset): void {
    this.levels.update((arr) =>
      arr.map((l) => (l.id === id ? { ...l, resultImage: asset } : l)),
    );
  }
}
