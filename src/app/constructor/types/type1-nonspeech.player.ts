import { Component, OnInit } from '@angular/core';
import { BasePlayerMode } from '../shared/base-player-mode';
import { NonSpeechLevel } from '../custom-game.model';
import { play } from '../../../common/functions/sounds.functions';
import { shuffle } from '../../../common/functions/array.functions';

interface Choice { img: string; correct: boolean; }

@Component({
  selector: 'app-type1-nonspeech-player',
  standalone: true,
  imports: [],
  templateUrl: './type1-nonspeech.player.html',
})
export class Type1NonspeechPlayer extends BasePlayerMode<NonSpeechLevel> implements OnInit {
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
      { img: l.image!.data, correct: true },
      { img: l.distractorImage!.data, correct: false },
    ]);
  }

  playSound(): void {
    void play(this.current.audio?.data);
  }

  pick(choice: Choice): void {
    if (choice.correct) {
      this.correct();
    } else {
      this.feedback = 'Послушай ещё раз и попробуй снова.';
      this.wrong();
      this.playSound();
    }
  }
}
