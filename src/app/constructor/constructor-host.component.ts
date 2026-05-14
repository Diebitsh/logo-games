import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomGamesService } from './custom-games.service';
import { CustomGame, CUSTOM_GAME_SCHEMA, GAME_TYPES, CustomGameType } from './custom-game.model';
import { ConstructorType } from './constructor-type';
import { Type1NonspeechConstructor } from './types/type1-nonspeech.constructor';
import { Type2QuasiHomonymConstructor } from './types/type2-quasi-homonym.constructor';

@Component({
  selector: 'app-constructor-host',
  standalone: true,
  imports: [RouterLink, Type1NonspeechConstructor, Type2QuasiHomonymConstructor],
  templateUrl: './constructor-host.component.html',
  styleUrl: './constructor-host.component.scss',
})
export class ConstructorHostComponent {
  private store = inject(CustomGamesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  /** Per-type конструктор регистрирует себя здесь через `register()`. */
  private readonly _active = signal<ConstructorType | null>(null);
  readonly active = this._active.asReadonly();

  type = signal<CustomGameType>(
    Number(this.route.snapshot.paramMap.get('type')) as CustomGameType,
  );
  typeInfo = computed(() => GAME_TYPES.find((t) => t.id === this.type()));

  saving = signal(false);
  savedId = signal<string | null>(null);
  done = computed(() => this.savedId() !== null);

  steps = computed(() => this.active()?.steps ?? []);
  stepIndex = computed(() => this.active()?.stepIndex() ?? 0);
  canAdvance = computed(() => this.active()?.canAdvance() ?? false);
  readyToSave = computed(() => this.active()?.readyToSave() ?? false);

  progress = computed(() => {
    const total = this.steps().length + 1; // + экран «Готово»
    const done = this.done() ? total : this.stepIndex();
    return (done / total) * 100;
  });

  /** Вызывается per-type конструктором из его конструктора класса. */
  register(impl: ConstructorType): void {
    this._active.set(impl);
  }

  advance(): void {
    const impl = this.active();
    if (impl && impl.canAdvance()) impl.advance();
  }

  back(): void {
    const impl = this.active();
    if (impl && !impl.goBack()) {
      this.router.navigate(['/constructor']);
    }
  }

  async save(): Promise<void> {
    const impl = this.active();
    if (!impl || !impl.readyToSave() || this.saving()) return;
    this.saving.set(true);
    try {
      const id = crypto.randomUUID();
      const now = Date.now();
      const game = {
        ...impl.build(),
        id,
        schema: CUSTOM_GAME_SCHEMA,
        createdAt: now,
        updatedAt: now,
      } as CustomGame;
      await this.store.save(game);
      this.savedId.set(id);
    } finally {
      this.saving.set(false);
    }
  }
}
