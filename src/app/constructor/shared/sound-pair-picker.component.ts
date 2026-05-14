import { Component, model } from '@angular/core';
import { SOUND_PAIRS } from '../custom-game.model';

@Component({
  selector: 'app-sound-pair-picker',
  standalone: true,
  imports: [],
  templateUrl: './sound-pair-picker.component.html',
  styleUrl: './sound-picker.component.scss',
})
export class SoundPairPickerComponent {
  /** id выбранной пары из SOUND_PAIRS. */
  selected = model<string | null>(null);
  pairs = SOUND_PAIRS;

  pick(id: string): void {
    this.selected.set(this.selected() === id ? null : id);
  }
}
