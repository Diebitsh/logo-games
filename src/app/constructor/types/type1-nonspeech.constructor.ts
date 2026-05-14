import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseConstructor } from '../shared/base-constructor';
import { AssetDropComponent } from '../shared/asset-drop.component';
import { ConstructorStep } from '../constructor-type';
import { CustomGameAsset, NonSpeechGame, NonSpeechLevel } from '../custom-game.model';

@Component({
  selector: 'app-type1-nonspeech-constructor',
  standalone: true,
  imports: [FormsModule, AssetDropComponent],
  templateUrl: './type1-nonspeech.constructor.html',
})
export class Type1NonspeechConstructor extends BaseConstructor {
  readonly steps: ConstructorStep[] = [
    { id: 'levels', label: 'Контент' },
    { id: 'meta', label: 'Сохранение' },
  ];

  levels = signal<NonSpeechLevel[]>([{ id: 1 }]);
  name = signal('');
  description = signal('');

  stepValid(index: number): boolean {
    if (index === 0) {
      return this.levels().some((l) => l.image && l.audio && l.distractorImage);
    }
    return this.name().trim().length > 0;
  }

  build(): Omit<NonSpeechGame, 'id' | 'createdAt' | 'updatedAt' | 'schema'> {
    return {
      type: 1,
      name: this.name().trim(),
      description: this.description().trim() || undefined,
      levels: this.levels().filter((l) => l.image && l.audio && l.distractorImage),
    };
  }

  addLevel(): void {
    this.levels.update((arr) => [...arr, { id: this.nextLevelId(arr) }]);
  }
  removeLevel(id: number): void {
    this.levels.update((arr) => arr.filter((l) => l.id !== id));
  }
  setAsset(id: number, key: keyof NonSpeechLevel, asset: CustomGameAsset): void {
    this.levels.update((arr) =>
      arr.map((l) => (l.id === id ? { ...l, [key]: asset } : l)),
    );
  }
}
