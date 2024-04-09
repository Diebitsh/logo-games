import { Component, Input, OnInit, Output } from '@angular/core';
import { GameModel } from '../models/game.model';
import { Observable, Subject } from 'rxjs';
import { shuffle } from '../../../common/functions/array.functions';
import { play } from '../../../common/functions/sounds.functions';
import { GameBaseComponent } from '../game-base/game-base.component';
import { PhonemicAwarenessGameContent, PhonemicAwarenessGameModel } from '../models/phonemic-awareness-game.model';

@Component({
	selector: 'app-phonemic-awareness',
	standalone: false,
	templateUrl: './phonemic-awareness.component.html',
	styleUrl: './phonemic-awareness.component.scss'
})
export class PhonemicAwarenessComponent extends GameBaseComponent<PhonemicAwarenessGameModel, PhonemicAwarenessGameContent>{
	
	currentWord: string;
	override setNextLevel(): void {
		this.currentAnswers = shuffle([this.currentLevelInfo.correctAnswer, this.currentLevelInfo.incorrectAnswer]); 
		console.log(this.currentAnswers)
	}


	currentAnswers: { word: string, image?: string }[];


	override checkAnswer(answer: { word: string, image?: string }) {
		const isCorrectAnswer = answer.word == this.currentLevelInfo.correctAnswer.word;
		this.sendAnswer(isCorrectAnswer);
	}


	play() {
		play(this.currentLevelInfo.wordSpeech)
	}
}
