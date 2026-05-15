import { Component, OnInit } from '@angular/core';
import { BasePlayerMode } from '../shared/base-player-mode';
import { FirstLastLevel } from '../custom-game.model';
import { play } from '../../../common/functions/sounds.functions';
import { shuffle } from '../../../common/functions/array.functions';

interface Choice { img: string; correct: boolean; }

@Component({
  selector: 'app-type5-first-last-player',
  standalone: true,
  imports: [],
  templateUrl: './type5-first-last.player.html',
})
export class Type5FirstLastPlayer extends BasePlayerMode<FirstLastLevel> implements OnInit {
  choices: Choice[] = [];
  feedback = '';

  ngOnInit(): void {
    this.buildChoices();
    setTimeout(() => this.playSound(), 200);
  }

  protected override onLevelChange(): void {
    this.feedback = '';
    this.buildChoices();
    setTimeout(() => this.playSound(), 200);
  }

  private buildChoices(): void {
    const l = this.current;
    this.choices = shuffle([
      { img: l.correctSoundImage!.data, correct: true },
      { img: l.incorrectSoundImage!.data, correct: false },
    ]);
  }

  get prompt(): string {
    return this.current.mode === 'first'
      ? 'Какой первый звук в слове?'
      : 'Какой последний звук в слове?';
  }

  playSound(): void {
    void play(this.current.audio?.data);
  }

  pick(choice: Choice): void {
    if (choice.correct) {
      this.correct();
    } else {
      this.feedback = 'Послушай слово ещё раз.';
      this.wrong();
      this.playSound();
    }
  }
}
