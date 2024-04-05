import { Component, Input, OnInit, Output } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { GameModel } from '../models/game.model';
import { getRandom, shuffle } from '../../../common/functions/array.functions';

@Component({
	selector: 'app-what-sound',
	templateUrl: './what-sound.component.html',
	styleUrl: './what-sound.component.scss'
})
export class WhatSoundComponent implements OnInit {

	@Input() game: GameModel;
	@Output() onAnswer: Subject<boolean> = new Subject<boolean>();
	@Output() onGameFinish: Subject<void> = new Subject<void>();

	currentSound: any;
	currentSounds: any[] = [];

	private correctAnswer: any;

	@Input() nextLevelEvent: Observable<void>;

	private completedLevels: number[] = []

	ngOnInit(): void {
		this.chooseLevel();
		this.nextLevelEvent.subscribe(() => this.chooseLevel())
	}

	chooseLevel() {
		this.correctAnswer = getRandom(this.game.content.filter(c => !this.completedLevels.includes(c.id)));
		this.currentSounds = shuffle(
			[
				this.correctAnswer,
				getRandom(this.game.content.filter(x => x.id != this.correctAnswer.id))
			]
		);
	}

	play() {
		var audio = new Audio(`assets/sounds/${this.correctAnswer.sound}`)
		audio.play();
	}

	answer(answer: any) {
		const isCorrect = answer.id == this.correctAnswer.id;
		this.onAnswer.next(isCorrect);
		if (isCorrect){
			this.completedLevels.push(this.correctAnswer.id)
			if (this.completedLevels.length == this.game.content.length)
				this.onGameFinish.next();
		}
	}

}
