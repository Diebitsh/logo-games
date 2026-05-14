import { Component, input, model } from '@angular/core';
import { SOUND_GROUPS } from '../custom-game.model';

@Component({
  selector: 'app-sound-picker',
  standalone: true,
  imports: [],
  templateUrl: './sound-picker.component.html',
  styleUrl: './sound-picker.component.scss',
})
export class SoundPickerComponent {
  /** 'single' — один звук (string), 'multi' — массив строк. */
  mode = input<'single' | 'multi'>('single');
  /** Выбранные звуки. Для single — массив из 0–1 элемента. */
  selected = model<string[]>([]);

  groups = SOUND_GROUPS;

  isActive(char: string): boolean {
    return this.selected().includes(char);
  }

  toggle(char: string): void {
    if (this.mode() === 'single') {
      this.selected.set(this.isActive(char) ? [] : [char]);
      return;
    }
    this.selected.update((arr) =>
      arr.includes(char) ? arr.filter((c) => c !== char) : [...arr, char],
    );
  }
}
