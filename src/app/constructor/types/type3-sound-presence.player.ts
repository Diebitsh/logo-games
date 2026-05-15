import { Component, OnInit } from '@angular/core';
import { BasePlayerMode } from '../shared/base-player-mode';
import { SoundPresenceGame, SoundPresenceLevel } from '../custom-game.model';
import { play } from '../../../common/functions/sounds.functions';

@Component({
  selector: 'app-type3-sound-presence-player',
  standalone: true,
  imports: [],
  templateUrl: './type3-sound-presence.player.html',
})
export class Type3SoundPresencePlayer extends BasePlayerMode<SoundPresenceLevel> implements OnInit {
  feedback = '';

  get g(): SoundPresenceGame { return this.game as SoundPresenceGame; }

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

  answer(value: boolean): void {
    if (value === this.current.hasSound) {
      this.correct();
    } else {
      this.feedback = 'Послушай слово ещё раз.';
      this.wrong();
      this.playSound();
    }
  }
}
