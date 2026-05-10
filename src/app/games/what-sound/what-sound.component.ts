import { Component, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { GameModel } from '../models/game.model';
import { getRandom, shuffle } from '../../../common/functions/array.functions';
import { play } from '../../../common/functions/sounds.functions';

@Component({
	selector: 'app-what-sound',
	standalone: true,
	imports: [CommonModule],
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
		void play(`assets/sounds/${this.correctAnswer.sound}`);
	}

	answer(answer: any) {
		const isCorrect = answer.id == this.correctAnswer.id;
		if (isCorrect){
			this.completedLevels.push(this.correctAnswer.id)
			if (this.completedLevels.length == this.game.content.length) {
				this.onGameFinish.next();
				return;
			}
		}
		this.onAnswer.next(isCorrect);
	}

}
