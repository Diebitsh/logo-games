import { Component, OnInit } from '@angular/core';
import { BasePlayerMode } from '../shared/base-player-mode';
import { QuasiHomonymLevel } from '../custom-game.model';
import { play } from '../../../common/functions/sounds.functions';
import { shuffle } from '../../../common/functions/array.functions';

interface Choice { img: string; correct: boolean; }

@Component({
  selector: 'app-type2-quasi-homonym-player',
  standalone: true,
  imports: [],
  templateUrl: './type2-quasi-homonym.player.html',
})
export class Type2QuasiHomonymPlayer extends BasePlayerMode<QuasiHomonymLevel> implements OnInit {
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
      { img: l.correctImage!.data, correct: true },
      { img: l.incorrectImage!.data, correct: false },
    ]);
  }

  playSound(): void {
    void play(this.current.correctAudio?.data);
  }

  pick(choice: Choice): void {
    if (choice.correct) {
      this.correct();
    } else {
      this.feedback = 'Послушай слово внимательнее.';
      this.wrong();
      this.playSound();
    }
  }
}
