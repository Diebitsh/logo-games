import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseConstructor } from '../shared/base-constructor';
import { AssetDropComponent } from '../shared/asset-drop.component';
import { SoundPairPickerComponent } from '../shared/sound-pair-picker.component';
import { ConstructorStep } from '../constructor-type';
import { CustomGameAsset, QuasiHomonymGame, QuasiHomonymLevel } from '../custom-game.model';

@Component({
  selector: 'app-type2-quasi-homonym-constructor',
  standalone: true,
  imports: [FormsModule, AssetDropComponent, SoundPairPickerComponent],
  templateUrl: './type2-quasi-homonym.constructor.html',
})
export class Type2QuasiHomonymConstructor extends BaseConstructor {
  readonly steps: ConstructorStep[] = [
    { id: 'sound', label: 'Звуки' },
    { id: 'levels', label: 'Контент' },
    { id: 'meta', label: 'Сохранение' },
  ];

  soundPair = signal<string | null>(null);
  levels = signal<QuasiHomonymLevel[]>([{ id: 1 }]);
  name = signal('');
  description = signal('');

  stepValid(index: number): boolean {
    if (index === 0) return this.soundPair() !== null;
    if (index === 1) {
      return this.levels().some((l) => l.correctImage && l.correctAudio && l.incorrectImage);
    }
    return this.name().trim().length > 0;
  }

  build(): Omit<QuasiHomonymGame, 'id' | 'createdAt' | 'updatedAt' | 'schema'> {
    return {
      type: 2,
      name: this.name().trim(),
      description: this.description().trim() || undefined,
      soundPair: this.soundPair()!,
      levels: this.levels().filter((l) => l.correctImage && l.correctAudio && l.incorrectImage),
    };
  }

  addLevel(): void {
    this.levels.update((arr) => [...arr, { id: this.nextLevelId(arr) }]);
  }
  removeLevel(id: number): void {
    this.levels.update((arr) => arr.filter((l) => l.id !== id));
  }
  setAsset(id: number, key: keyof QuasiHomonymLevel, asset: CustomGameAsset): void {
    this.levels.update((arr) =>
      arr.map((l) => (l.id === id ? { ...l, [key]: asset } : l)),
    );
  }
}
