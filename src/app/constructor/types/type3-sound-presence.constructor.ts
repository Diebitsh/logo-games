import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseConstructor } from '../shared/base-constructor';
import { AssetDropComponent } from '../shared/asset-drop.component';
import { SoundPickerComponent } from '../shared/sound-picker.component';
import { ConstructorStep } from '../constructor-type';
import { CustomGameAsset, SoundPresenceGame, SoundPresenceLevel } from '../custom-game.model';

@Component({
  selector: 'app-type3-sound-presence-constructor',
  standalone: true,
  imports: [FormsModule, AssetDropComponent, SoundPickerComponent],
  templateUrl: './type3-sound-presence.constructor.html',
})
export class Type3SoundPresenceConstructor extends BaseConstructor {
  readonly steps: ConstructorStep[] = [
    { id: 'sound', label: 'Звук' },
    { id: 'levels', label: 'Контент' },
    { id: 'meta', label: 'Сохранение' },
  ];

  sound = signal<string[]>([]);
  levels = signal<SoundPresenceLevel[]>([{ id: 1, hasSound: true }]);
  name = signal('');
  description = signal('');

  soundChar = computed(() => this.sound()[0] ?? '');
  audioHint = computed(
    () => `Звук должен звучать так: есть ли звук [${this.soundChar()}] в слове (слово на картинке)?`,
  );

  stepValid(index: number): boolean {
    if (index === 0) return this.sound().length === 1;
    if (index === 1) return this.levels().some((l) => l.image && l.audio);
    return this.name().trim().length > 0;
  }

  build(): Omit<SoundPresenceGame, 'id' | 'createdAt' | 'updatedAt' | 'schema'> {
    return {
      type: 3,
      name: this.name().trim(),
      description: this.description().trim() || undefined,
      sound: this.soundChar(),
      levels: this.levels().filter((l) => l.image && l.audio),
    };
  }

  addLevel(): void {
    this.levels.update((arr) => [...arr, { id: this.nextLevelId(arr), hasSound: true }]);
  }
  removeLevel(id: number): void {
    this.levels.update((arr) => arr.filter((l) => l.id !== id));
  }
  setAsset(id: number, key: 'image' | 'audio', asset: CustomGameAsset): void {
    this.levels.update((arr) =>
      arr.map((l) => (l.id === id ? { ...l, [key]: asset } : l)),
    );
  }
  setHasSound(id: number, value: boolean): void {
    this.levels.update((arr) =>
      arr.map((l) => (l.id === id ? { ...l, hasSound: value } : l)),
    );
  }
}
