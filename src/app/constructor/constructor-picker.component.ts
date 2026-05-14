import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GAME_TYPES } from './custom-game.model';

@Component({
  selector: 'app-constructor-picker',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './constructor-picker.component.html',
  styleUrl: './constructor-picker.component.scss',
})
export class ConstructorPickerComponent {
  gameTypes = GAME_TYPES;
}
