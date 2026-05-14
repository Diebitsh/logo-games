import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomGamesService } from './custom-games.service';
import { CustomGame, GAME_TYPES, isLegacyGame } from './custom-game.model';
import { stop } from '../../common/functions/sounds.functions';

type Phase = 'intro' | 'play' | 'done';

@Component({
  selector: 'app-custom-player',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './custom-player.component.html',
  styleUrl: './custom-player.component.scss',
})
export class CustomPlayerComponent implements OnInit, OnDestroy {
  private store = inject(CustomGamesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  game = signal<CustomGame | null>(null);
  phase = signal<Phase>('intro');
  /** Сколько заданий пройдено верно — для прогресса. */
  solved = signal(0);

  typeName = computed(() => GAME_TYPES.find((t) => t.id === this.game()?.type)?.name ?? '');
  total = computed(() => this.game()?.levels.length ?? 0);
  progress = computed(() => {
    const t = this.total();
    return t === 0 ? 0 : (this.solved() / t) * 100;
  });

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (!id) { this.router.navigate(['/my-games']); return; }
    const g = await this.store.get(id);
    if (!g || isLegacyGame(g) || g.levels.length === 0) {
      this.router.navigate(['/my-games']);
      return;
    }
    this.game.set(g);
  }

  ngOnDestroy(): void { stop(); }

  start(): void { this.phase.set('play'); }

  onAnswered(correct: boolean): void {
    if (correct) this.solved.update((n) => n + 1);
  }

  onFinished(): void {
    this.solved.set(this.total());
    this.phase.set('done');
  }

  restart(): void {
    this.solved.set(0);
    this.phase.set('intro');
    // Обнуляем game на один цикл — это уничтожает per-type плеер в @if,
    // а через микротаску монтируем его заново с чистым состоянием.
    const g = this.game();
    this.game.set(null);
    queueMicrotask(() => this.game.set(g));
  }
}
