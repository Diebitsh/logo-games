import { Component, Input, OnInit, Output } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { GameModel } from '../models/game.model';
import { shuffle } from '../../../common/functions/array.functions';

@Component({
	selector: 'app-first-or-last-char',
	templateUrl: './first-or-last-char.component.html',
	styleUrl: './first-or-last-char.component.scss'
})
export class FirstOrLastCharComponent implements OnInit {
	

	@Input() game: GameModel;
	@Input() nextLevelEvent: Observable<void>;
	@Output() onAnswer: Subject<boolean> = new Subject<boolean>();
	@Output() onGameFinish: Subject<void> = new Subject<void>();
	
	@Output() setTextAsActiveMsg: Subject<string> = new Subject<string>();
	@Input() onInstrcutionEnded: Observable<void>;

	currentQuestion: any;
	private currentIndex: number = 0;

	currentAnswers: {answer: string, image: string}[] = [];

	ngOnInit(): void {
		this.currentQuestion = this.game.content[this.currentIndex];
		this.currentAnswers = shuffle([
			{answer: this.currentQuestion.correctAnswer, image: this.currentQuestion.correctImage},
			{answer:this.currentQuestion.incorrectAnswer, image: this.currentQuestion.incorrectImage},
		])
		this.onInstrcutionEnded.subscribe(x => {
			this.setTextAsActiveMsg.next(this.currentQuestion.text);
			this.play();
		})
		
		this.nextLevelEvent.subscribe(() => this.nextLevel())
	}

	sendAnswer(answer: {answer: string, image: string}) {
		const isCorrect = this.currentQuestion.correctAnswer === answer.answer;
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
		this.currentAnswers = shuffle([
			{answer: this.currentQuestion.correctAnswer, image: this.currentQuestion.correctImage},
			{answer:this.currentQuestion.incorrectAnswer, image: this.currentQuestion.incorrectImage},
		])
	}

	play() {
		var audio = new Audio(this.currentQuestion.speech)
		audio.play();
	}
}
