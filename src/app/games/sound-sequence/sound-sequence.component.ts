import { Component, Input, Output } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { GameModel } from '../models/game.model';

@Component({
	selector: 'app-sound-sequence',
	templateUrl: './sound-sequence.component.html',
	styleUrl: './sound-sequence.component.scss'
})
export class SoundSequenceComponent {
	@Input() game: GameModel;
	@Input() nextLevelEvent: Observable<void>;
	@Output() onAnswer: Subject<boolean> = new Subject<boolean>();
	@Output() onGameFinish: Subject<void> = new Subject<void>();
}
