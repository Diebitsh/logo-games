import { Component, Input, OnInit, Output } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { GameModel } from '../models/game.model';

@Component({
	selector: 'app-sound-position',
	templateUrl: './sound-position.component.html',
	styleUrl: './sound-position.component.scss'
})
export class SoundPositionComponent implements OnInit {
	
	@Input() game: GameModel;
	@Input() nextLevelEvent: Observable<void>;
	@Output() onAnswer: Subject<boolean> = new Subject<boolean>();
	@Output() onGameFinish: Subject<void> = new Subject<void>();
	
	@Output() setTextAsActiveMsg: Subject<string> = new Subject<string>();
	@Input() onInstrcutionEnded: Observable<void>;

	currentQuestion: any;
	private currentIndex: number = 0;

	answerOptions: { name: string, position: number }[] = [
		{ name: "Начало", position: 0 },
		{ name: "Середина", position: 1 },
		{ name: "Конец", position: 2 }
	]

	ngOnInit(): void {
		this.currentQuestion = this.game.content[this.currentIndex];
		this.onInstrcutionEnded.subscribe(x => {
			this.setTextAsActiveMsg.next(this.currentQuestion.text);
			this.play();
		})
		
		this.nextLevelEvent.subscribe(() => this.nextLevel())
	}

	sendAnswer(position: number) {
		const isCorrect = this.currentQuestion.answer === position;
		this.onAnswer.next(isCorrect);
	}

	nextLevel() {
		if (this.currentIndex + 1 == this.game.content.length) {
			this.onGameFinish.next();
			return;
		}
		this.currentIndex++;
		this.currentQuestion = this.game.content[this.currentIndex];
		this.setTextAsActiveMsg.next(this.currentQuestion.text);
	}

	
	play() {
		var audio = new Audio(this.currentQuestion.speech)
		audio.play();
	}
}
