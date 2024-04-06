import { ChangeDetectorRef, Component, Input, OnInit, Output } from '@angular/core';
import { getRandom, shuffle } from '../../../common/functions/array.functions';
import { play } from '../../../common/functions/sounds.functions';
import { GameBaseComponent } from '../game-base/game-base.component';
import { MakeWordBySoundsGameContent, MakeWordBySoundsGameModel } from '../models/make-word-by-sounds-game.model';

@Component({
	selector: 'app-make-word-by-sounds',
	templateUrl: './make-word-by-sounds.component.html',
	styleUrl: './make-word-by-sounds.component.scss'
})
export class MakeWordBySoundsComponent extends GameBaseComponent<MakeWordBySoundsGameModel, MakeWordBySoundsGameContent> implements OnInit {
	override setNextLevel(): void {
		this.currentWord = this.game.content.find(x => x.id === this.currentLevel);
		this.currentSyllables = shuffle(this.currentWord.word.split(""));
		this.answer = []
	}

	constructor(private cdRef: ChangeDetectorRef) {
		super();
	}

	currentWord: { word: string, speech: string, id: number };
	currentSyllables: string[] = [];

	answer: { char: string, origIndex: number }[] = [];


	ngOnInit(): void {
		
	}

	selectSyllable(syllbableIndex: number) {
		if (this.currentSyllables[syllbableIndex] == undefined)
			return

		const firstEmptyIndex = this.answer.findIndex(x => x.char == undefined);
		if (firstEmptyIndex < 0) {
			this.answer.push(({ char: `${this.currentSyllables[syllbableIndex]}`, origIndex: syllbableIndex }))
		}
		else
			this.answer[firstEmptyIndex] = ({ char: `${this.currentSyllables[syllbableIndex]}`, origIndex: syllbableIndex })
		this.currentSyllables[syllbableIndex] = undefined;

		if (this.answer.length == this.currentSyllables.length && !this.answer.some(x => x.char === undefined)) {
			this.checkAnswer();
		}
	}

	checkAnswer() {
		const isCorrect = this.answer.map(a => a.char).join("").toLowerCase() == this.currentWord.word.toLowerCase();
		this.sendAnswer(isCorrect);

		if (!isCorrect) {
			this.answer.forEach((a, index) => {
				if (a.char.toLowerCase() != this.currentWord.word.toLowerCase().split("")[index]) {
					this.currentSyllables[a.origIndex] = `${a.char}`;
					a.char = undefined;
				}
			});
			return;
		}
	}

	removeSyllable(charInfo: { char: string, origIndex: number }, index: number) {
		this.currentSyllables[charInfo.origIndex] = `${charInfo.char}`;
		this.answer[index].char = undefined;
		this.cdRef.detectChanges()
	}

	play() {
		play(this.currentWord.speech)
	}

}
