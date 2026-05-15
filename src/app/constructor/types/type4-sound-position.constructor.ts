import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseConstructor } from '../shared/base-constructor';
import { AssetDropComponent } from '../shared/asset-drop.component';
import { SoundPickerComponent } from '../shared/sound-picker.component';
import { ConstructorStep } from '../constructor-type';
import {
  CustomGameAsset, SoundPositionGame, SoundPositionLevel, SoundSpot,
} from '../custom-game.model';

@Component({
  selector: 'app-type4-sound-position-constructor',
  standalone: true,
  imports: [FormsModule, AssetDropComponent, SoundPickerComponent],
  templateUrl: './type4-sound-position.constructor.html',
})
export class Type4SoundPositionConstructor extends BaseConstructor {
  readonly steps: ConstructorStep[] = [
    { id: 'sound', label: 'Звук' },
    { id: 'levels', label: 'Контент' },
    { id: 'meta', label: 'Сохранение' },
  ];

  readonly spots: Array<{ id: SoundSpot; label: string }> = [
    { id: 'start', label: 'Начало' },
    { id: 'middle', label: 'Середина' },
    { id: 'end', label: 'Конец' },
  ];

  sound = signal<string[]>([]);
  levels = signal<SoundPositionLevel[]>([{ id: 1, position: 'start' }]);
  name = signal('');
  description = signal('');

  soundChar = computed(() => this.sound()[0] ?? '');
  audioHint = computed(
    () => `Звук должен звучать так: где находится звук [${this.soundChar()}] в слове (слово на картинке)?`,
  );

  stepValid(index: number): boolean {
    if (index === 0) return this.sound().length === 1;
    if (index === 1) return this.levels().some((l) => l.image && l.audio);
    return this.name().trim().length > 0;
  }

  build(): Omit<SoundPositionGame, 'id' | 'createdAt' | 'updatedAt' | 'schema'> {
    return {
      type: 4,
      name: this.name().trim(),
      description: this.description().trim() || undefined,
      sound: this.soundChar(),
      levels: this.levels().filter((l) => l.image && l.audio),
    };
  }

  addLevel(): void {
    this.levels.update((arr) => [...arr, { id: this.nextLevelId(arr), position: 'start' }]);
  }
  removeLevel(id: number): void {
    this.levels.update((arr) => arr.filter((l) => l.id !== id));
  }
  setAsset(id: number, key: 'image' | 'audio', asset: CustomGameAsset): void {
    this.levels.update((arr) =>
      arr.map((l) => (l.id === id ? { ...l, [key]: asset } : l)),
    );
  }
  setPosition(id: number, position: SoundSpot): void {
    this.levels.update((arr) =>
      arr.map((l) => (l.id === id ? { ...l, position } : l)),
    );
  }
}
