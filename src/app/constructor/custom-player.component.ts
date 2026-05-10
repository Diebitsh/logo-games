import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomGamesService } from './custom-games.service';
import { CustomGame, CustomGameLevel, GAME_TYPES } from './custom-game.model';
import { shuffle } from '../../common/functions/array.functions';
import { play, stop } from '../../common/functions/sounds.functions';

type AnswerOption = {
  asset: { data: string };
  audio?: { data: string };
  label?: string;
  correct: boolean;
};

type Phase = 'intro' | 'task' | 'feedback' | 'done';

@Component({
  selector: 'app-custom-player',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './custom-player.component.html',
  styleUrl: './custom-player.component.scss',
})
export class CustomPlayerComponent implements OnInit, OnDestroy {
  private store = inject(CustomGamesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  game = signal<CustomGame | null>(null);
  levelIndex = signal(0);
  options = signal<AnswerOption[]>([]);
  phase = signal<Phase>('intro');
  feedback = signal<{ ok: boolean; text: string } | null>(null);

  current = computed<CustomGameLevel | null>(() => {
    const g = this.game();
    if (!g) return null;
    return g.levels[this.levelIndex()] ?? null;
  });

  typeName = computed(() => {
    const g = this.game();
    return GAME_TYPES.find((t) => t.id === g?.type)?.name ?? '';
  });

  progress = computed(() => {
    const g = this.game();
    if (!g || g.levels.length === 0) return 0;
    return ((this.levelIndex() + (this.phase() === 'done' ? 1 : 0)) / g.levels.length) * 100;
  });

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (!id) {
      this.router.navigate(['/my-games']);
      return;
    }
    const g = await this.store.get(id);
    if (!g || g.levels.length === 0) {
      this.router.navigate(['/my-games']);
      return;
    }
    this.game.set(g);
    this.prepareLevel(0);
  }

  ngOnDestroy(): void {
    stop();
  }

  start(): void {
    this.phase.set('task');
    this.playWord();
  }

  playWord(): void {
    const level = this.current();
    if (!level?.correctAudio) return;
    void play(level.correctAudio.data);
  }

  pickOption(opt: AnswerOption): void {
    if (this.phase() !== 'task') return;
    if (opt.correct) {
      this.feedback.set({ ok: true, text: 'Молодец! Так держать.' });
      this.phase.set('feedback');
    } else {
      this.feedback.set({ ok: false, text: 'Попробуй ещё раз.' });
      this.playWord();
    }
  }

  next(): void {
    const g = this.game();
    if (!g) return;
    const nextIdx = this.levelIndex() + 1;
    if (nextIdx >= g.levels.length) {
      this.phase.set('done');
      return;
    }
    this.prepareLevel(nextIdx);
    this.phase.set('task');
    setTimeout(() => this.playWord(), 200);
  }

  restart(): void {
    this.prepareLevel(0);
    this.phase.set('intro');
    this.feedback.set(null);
  }

  private prepareLevel(idx: number): void {
    this.levelIndex.set(idx);
    this.feedback.set(null);
    const g = this.game();
    const level = g?.levels[idx];
    if (!level) return;

    const opts: AnswerOption[] = [];
    if (level.correctImage) {
      opts.push({
        asset: level.correctImage,
        audio: level.correctAudio,
        label: level.word,
        correct: true,
      });
    }
    if (level.incorrectImage) {
      opts.push({
        asset: level.incorrectImage,
        audio: level.incorrectAudio,
        correct: false,
      });
    }
    this.options.set(shuffle(opts));
  }
}
