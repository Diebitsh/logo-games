import { Component, Input, Output } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { GameModel } from '../models/game.model';

@Component({
	selector: 'app-word-conversion',
	templateUrl: './word-conversion.component.html',
	styleUrl: './word-conversion.component.scss'
})
export class WordConversionComponent {
	@Input() game: GameModel;
	@Input() nextLevelEvent: Observable<void>;
	@Output() onAnswer: Subject<boolean> = new Subject<boolean>();
	@Output() onGameFinish: Subject<void> = new Subject<void>();
}
