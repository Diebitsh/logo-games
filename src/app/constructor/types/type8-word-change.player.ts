import { Component, OnInit } from '@angular/core';
import { BasePlayerMode } from '../shared/base-player-mode';
import { SOUND_GROUPS, WordChangeLevel } from '../custom-game.model';
import { shuffle } from '../../../common/functions/array.functions';

const ALL_SOUNDS: string[] = SOUND_GROUPS.flatMap((g) => g.sounds.map((s) => s.char));

@Component({
  selector: 'app-type8-word-change-player',
  standalone: true,
  imports: [],
  templateUrl: './type8-word-change.player.html',
})
export class Type8WordChangePlayer extends BasePlayerMode<WordChangeLevel> implements OnInit {
  options: string[] = [];
  feedback = '';

  ngOnInit(): void {
    this.buildOptions();
  }

  protected override onLevelChange(): void {
    this.feedback = '';
    this.buildOptions();
  }

  private buildOptions(): void {
    const correct = this.current.insertSound;
    const distractors = shuffle(ALL_SOUNDS.filter((s) => s !== correct)).slice(0, 2);
    this.options = shuffle([correct, ...distractors]);
  }

  pick(sound: string): void {
    if (sound === this.current.insertSound) {
      this.correct();
    } else {
      this.feedback = 'Не тот звук — посмотри на картинку ещё раз.';
      this.wrong();
    }
  }
}
