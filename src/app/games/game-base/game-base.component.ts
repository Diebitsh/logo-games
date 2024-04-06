import { Component, Input, OnInit, Output } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { MakeWordBySoundsGameModel } from '../models/make-word-by-sounds-game.model';
import { getRandom } from '../../../common/functions/array.functions';
import { BaseGameModel, IGameContentModel } from '../models/base-game.model';

@Component({
  selector: 'app-game-base',
  template: '',
  styleUrl: './game-base.component.scss'
})
export abstract class GameBaseComponent<TGame extends BaseGameModel<TContent>, TContent extends IGameContentModel> {


	init(): void {
		this.goToNextLevel();
		this.nextLevelEvent.subscribe(_ => this.goToNextLevel());
	}

	@Input() protected readonly game: TGame;
	
	@Output() onAnswer: Subject<boolean> = new Subject<boolean>();
	@Output() onGameFinish: Subject<void> = new Subject<void>();
	@Input() nextLevelEvent: Observable<void> = new Observable<void>();

	protected completedLevels: number[] = [];
	protected currentLevel: number;

	abstract checkAnswer(answer?): void;
	abstract setNextLevel(): void;

	protected goToNextLevel(): void {
		this.currentLevel = getRandom(this.game.content.filter(x => !this.completedLevels.includes(x.id))).id;
		this.setNextLevel();
	}

	protected sendAnswer(isCorrect: boolean): void {
		if (isCorrect) {

			this.completedLevels.push(this.currentLevel);

			if (this.completedLevels.length == this.game.content.length) {
				this.onGameFinish.next();
				return
			}
		}

		this.onAnswer.next(isCorrect);

	}

	protected get currentLevelInfo(): TContent {
		return this.game.content.find(x => x.id == this.currentLevel);
	}
}
