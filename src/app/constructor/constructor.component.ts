import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CustomGamesService } from './custom-games.service';
import {
  CustomGame,
  CustomGameAsset,
  CustomGameLevel,
  GAME_TYPES,
  SOUND_GROUPS,
} from './custom-game.model';
import { DropFileDirective } from './drop-file.directive';

type Step = 'type' | 'sound' | 'levels' | 'meta' | 'done';

@Component({
  selector: 'app-constructor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DropFileDirective],
  templateUrl: './constructor.component.html',
  styleUrl: './constructor.component.scss',
})
export class ConstructorComponent {
  private store = inject(CustomGamesService);
  private router = inject(Router);

  gameTypes = GAME_TYPES;
  soundGroups = SOUND_GROUPS;

  step = signal<Step>('type');
  selectedType = signal<number | null>(null);
  selectedSound = signal<string | null>(null);
  selectedGroup = signal<string | null>(null);
  name = signal('');
  description = signal('');
  levels = signal<CustomGameLevel[]>([this.createLevel()]);
  saving = signal(false);
  savedId = signal<string | null>(null);

  selectedTypeInfo = computed(() =>
    this.gameTypes.find((t) => t.id === this.selectedType()),
  );

  progress = computed(() => {
    const order: Step[] = ['type', 'sound', 'levels', 'meta', 'done'];
    return ((order.indexOf(this.step()) + 1) / order.length) * 100;
  });

  steps: Array<{ id: Step; label: string }> = [
    { id: 'type', label: 'Направление' },
    { id: 'sound', label: 'Звук' },
    { id: 'levels', label: 'Контент' },
    { id: 'meta', label: 'Сохранение' },
  ];

  selectType(id: number): void {
    this.selectedType.set(id);
    this.step.set('sound');
  }

  selectSound(group: string, sound: string): void {
    this.selectedGroup.set(group);
    this.selectedSound.set(sound);
    this.step.set('levels');
  }

  back(): void {
    const order: Step[] = ['type', 'sound', 'levels', 'meta'];
    const i = order.indexOf(this.step());
    if (i > 0) this.step.set(order[i - 1]);
  }

  goToMeta(): void {
    if (!this.hasValidLevels()) return;
    this.step.set('meta');
  }

  hasValidLevels(): boolean {
    return this.levels().some(
      (l) => l.correctImage && l.correctAudio,
    );
  }

  addLevel(): void {
    this.levels.update((arr) => [...arr, this.createLevel(arr.length + 1)]);
  }

  removeLevel(id: number): void {
    this.levels.update((arr) => arr.filter((l) => l.id !== id));
  }

  async onAsset(
    levelId: number,
    key: 'correctImage' | 'correctAudio' | 'incorrectImage' | 'incorrectAudio',
    file: File,
  ): Promise<void> {
    const asset = await this.store.fileToAsset(file);
    this.levels.update((arr) =>
      arr.map((l) => (l.id === levelId ? { ...l, [key]: asset } : l)),
    );
  }

  setWord(levelId: number, word: string): void {
    this.levels.update((arr) =>
      arr.map((l) => (l.id === levelId ? { ...l, word } : l)),
    );
  }

  async save(): Promise<void> {
    const type = this.selectedType();
    const sound = this.selectedSound();
    if (!type || !sound || !this.name().trim()) return;

    this.saving.set(true);
    try {
      const id = crypto.randomUUID();
      const game: CustomGame = {
        id,
        name: this.name().trim(),
        description: this.description().trim(),
        type,
        sound,
        soundGroup: this.selectedGroup() ?? undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        levels: this.levels().filter((l) => l.correctImage && l.correctAudio),
      };
      await this.store.save(game);
      this.savedId.set(id);
      this.step.set('done');
    } finally {
      this.saving.set(false);
    }
  }

  reset(): void {
    this.step.set('type');
    this.selectedType.set(null);
    this.selectedSound.set(null);
    this.selectedGroup.set(null);
    this.name.set('');
    this.description.set('');
    this.levels.set([this.createLevel()]);
    this.savedId.set(null);
  }

  private createLevel(id = 1): CustomGameLevel {
    return { id };
  }

  assetPreview(asset?: CustomGameAsset): string | null {
    return asset?.data ?? null;
  }
}
