import { Component, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameModel } from '../models/game.model';
import { Observable, Subject } from 'rxjs';
import { play } from '../../../common/functions/sounds.functions';

@Component({
	selector: 'app-phoneme-analysis',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './phoneme-analysis.component.html',
	styleUrl: './phoneme-analysis.component.scss'
})
export class PhonemeAnalysisComponent implements OnInit {


	@Output() onAnswer: Subject<boolean> = new Subject<boolean>();
	@Output() onGameFinish: Subject<void> = new Subject<void>();
	@Output() setTextAsActiveMsg: Subject<string> = new Subject<string>();
	@Input() game: GameModel;
	@Input() nextLevelEvent: Observable<void>;
	@Input() onInstrcutionEnded: Observable<void>;

	private currentLevelIndex: number = 0;
	currentWord: any;
	
	answers: string[] = [];

	ngOnInit(): void {
		this.answers = [
			this.game.content.textures.no,
			this.game.content.textures.yes
		]
		this.currentWord = (this.game.content.data as any[])[this.currentLevelIndex];
		console.log(this.currentWord);
		this.nextLevelEvent.subscribe(() => {
			this.currentLevelIndex++;
			this.currentWord = (this.game.content.data as any[])[this.currentLevelIndex];
			
			this.setTextAsActiveMsg.next(this.currentWord.taskText);
		});
		this.onInstrcutionEnded.subscribe(() => {
			this.setTextAsActiveMsg.next(this.currentWord.taskText);
			this.play();
		})
	}

	sendAnswer(answer: number) {
		const isCorrect = answer == this.currentWord.correctAnswer;
		if (isCorrect && this.currentLevelIndex + 1 == this.game.content.data.length) {
			this.onGameFinish.next();
			return;
		}
		this.onAnswer.next(isCorrect);
	}

	play() {
		void play(this.currentWord.speechTask);
	}

}
