import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { BasePlayerMode } from '../shared/base-player-mode';
import { AssembleWordGame, AssembleWordLevel } from '../custom-game.model';
import { splitWord, shuffleByDifficulty } from '../word-utils';
import { play } from '../../../common/functions/sounds.functions';

interface Tile { char: string; trayIndex: number; }

@Component({
  selector: 'app-type6-assemble-word-player',
  standalone: true,
  imports: [],
  templateUrl: './type6-assemble-word.player.html',
  styleUrl: './type6-assemble-word.player.scss',
})
export class Type6AssembleWordPlayer extends BasePlayerMode<AssembleWordLevel> implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  /** Ожидаемые буквы слова. */
  expected: string[] = [];
  /** Слоты под буквы (null — пусто). */
  slots: (Tile | null)[] = [];
  /** Лоток с перемешанными буквами (null — буква взята). */
  tray: (Tile | null)[] = [];
  feedback = '';

  get g(): AssembleWordGame { return this.game as AssembleWordGame; }

  ngOnInit(): void {
    this.setupLevel();
    setTimeout(() => this.playWord(), 200);
  }

  protected override onLevelChange(): void {
    this.feedback = '';
    this.setupLevel();
    setTimeout(() => this.playWord(), 200);
  }

  private setupLevel(): void {
    this.expected = splitWord(this.current.word);
    const shuffled = shuffleByDifficulty(this.expected, this.g.difficulty);
    this.tray = shuffled.map((char, trayIndex) => ({ char, trayIndex }));
    this.slots = this.expected.map(() => null);
  }

  playWord(): void {
    void play(this.current.wordAudio?.data);
  }

  /** Взять букву из лотка — встаёт в первый свободный слот. */
  takeTile(trayIndex: number): void {
    const tile = this.tray[trayIndex];
    if (!tile) return;
    const slot = this.slots.findIndex((s) => s === null);
    if (slot < 0) return;
    this.slots[slot] = tile;
    this.tray[trayIndex] = null;
    if (this.slots.every((s) => s !== null)) this.check();
  }

  /** Вернуть букву из слота обратно в лоток. */
  returnTile(slotIndex: number): void {
    const tile = this.slots[slotIndex];
    if (!tile) return;
    this.tray[tile.trayIndex] = tile;
    this.slots[slotIndex] = null;
    this.feedback = '';
  }

  private check(): void {
    const ok = this.slots.every((s, i) => s?.char === this.expected[i]);
    if (ok) {
      this.feedback = '';
      this.correct();
      return;
    }
    // Ошибка: неверно стоящие буквы возвращаются в лоток.
    this.feedback = 'Ошибка!';
    this.wrong();
    this.slots.forEach((tile, i) => {
      if (tile && tile.char !== this.expected[i]) {
        this.tray[tile.trayIndex] = tile;
        this.slots[i] = null;
      }
    });
    this.cdr.detectChanges();
  }
}
