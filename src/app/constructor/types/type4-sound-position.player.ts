import { Component, OnInit } from '@angular/core';
import { BasePlayerMode } from '../shared/base-player-mode';
import { SoundPositionGame, SoundPositionLevel, SoundSpot } from '../custom-game.model';
import { play } from '../../../common/functions/sounds.functions';

@Component({
  selector: 'app-type4-sound-position-player',
  standalone: true,
  imports: [],
  templateUrl: './type4-sound-position.player.html',
})
export class Type4SoundPositionPlayer extends BasePlayerMode<SoundPositionLevel> implements OnInit {
  feedback = '';

  readonly spots: Array<{ id: SoundSpot; label: string }> = [
    { id: 'start', label: 'Начало' },
    { id: 'middle', label: 'Середина' },
    { id: 'end', label: 'Конец' },
  ];

  get g(): SoundPositionGame { return this.game as SoundPositionGame; }

  ngOnInit(): void {
    setTimeout(() => this.playSound(), 200);
  }

  protected override onLevelChange(): void {
    this.feedback = '';
    setTimeout(() => this.playSound(), 200);
  }

  playSound(): void {
    void play(this.current.audio?.data);
  }

  answer(spot: SoundSpot): void {
    if (spot === this.current.position) {
      this.correct();
    } else {
      this.feedback = 'Послушай слово ещё раз.';
      this.wrong();
      this.playSound();
    }
  }
}
