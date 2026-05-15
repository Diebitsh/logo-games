import { Component, OnInit } from '@angular/core';
import { BasePlayerMode } from '../shared/base-player-mode';
import { RelativePositionGame, RelativePositionLevel } from '../custom-game.model';
import { buildRelativeQuestion, RelativeQuestion } from '../word-utils';
import { shuffle, getRandom } from '../../../common/functions/array.functions';

@Component({
  selector: 'app-type7-relative-position-player',
  standalone: true,
  imports: [],
  templateUrl: './type7-relative-position.player.html',
})
export class Type7RelativePositionPlayer extends BasePlayerMode<RelativePositionLevel> implements OnInit {
  question: RelativeQuestion | null = null;
  options: string[] = [];
  feedback = '';

  get g(): RelativePositionGame { return this.game as RelativePositionGame; }

  ngOnInit(): void {
    this.buildQuestion();
  }

  protected override onLevelChange(): void {
    this.feedback = '';
    this.buildQuestion();
  }

  private buildQuestion(): void {
    const letters = this.current.letters;
    // Звуки игры, реально встречающиеся в слове.
    const usable = this.g.sounds.filter((s) => letters.includes(s.toUpperCase()));
    const candidates: RelativeQuestion[] = [];
    for (const sound of usable) {
      for (const dir of ['before', 'after'] as const) {
        const q = buildRelativeQuestion(letters, sound, dir);
        if (q) candidates.push(q);
      }
    }
    if (candidates.length === 0) {
      // Нет валидного вопроса для этого слова — засчитываем уровень.
      this.question = null;
      this.correct();
      return;
    }
    this.question = getRandom(candidates);
    this.options = shuffle([...this.question.options]);
  }

  pick(option: string): void {
    if (!this.question) return;
    if (option === this.question.correct) {
      this.correct();
    } else {
      this.feedback = 'Посмотри на слово внимательнее.';
      this.wrong();
    }
  }
}
