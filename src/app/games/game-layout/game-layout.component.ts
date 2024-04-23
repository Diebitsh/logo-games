import { AfterViewInit, Component, ComponentFactoryResolver, ComponentRef, ElementRef, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PhonemeAnalysisComponent } from '../phoneme-analysis/phoneme-analysis.component';
import { GameModel } from '../models/game.model';
import { GamesService } from '../services/games.service';
import { MakeWordBySoundsComponent } from '../make-word-by-sounds/make-word-by-sounds.component';
import { PhonemicAwarenessComponent } from '../phonemic-awareness/phonemic-awareness.component';
import Typewriter from 't-writer.js';
import { WhatSoundComponent } from '../what-sound/what-sound.component';
import { Subject, from, of, takeUntil } from 'rxjs';
import { play } from '../../../common/functions/sounds.functions';
import { FirstOrLastCharComponent } from '../first-or-last-char/first-or-last-char.component';
import { SoundPositionComponent } from '../sound-position/sound-position.component';
import { SoundSequenceComponent } from '../sound-sequence/sound-sequence.component';
import { WordConversionComponent } from '../word-conversion/word-conversion.component';

@Component({
	selector: 'app-game-layout',
	templateUrl: './game-layout.component.html',
	styleUrl: './game-layout.component.scss',
	animations: [

	]
})
export class GameLayoutComponent implements OnInit, AfterViewInit, OnDestroy {
	gameFinished: boolean = false;
	levelComplete: boolean = false;
	isInstructionsShow: boolean = false;
	instrcutionEnded: Subject<void> = new Subject<void>();
	isShowNestedThemes: boolean = false;

	constructor(
		private gamesService: GamesService,
		private activatedRoute: ActivatedRoute,
		private router: Router) { }

		
	@ViewChild('gameContent', { read: ViewContainerRef }) private viewRef: ViewContainerRef;
	private componentRef: ComponentRef<PhonemeAnalysisComponent | MakeWordBySoundsComponent | PhonemicAwarenessComponent | any>;

	@ViewChild('gameContainer') private gameContainer: ElementRef;

	@ViewChild("messageWindow") private messageWindow: ElementRef;

	typeWriter!: Typewriter;

	private readonly breakSound: Subject<void> = new Subject<void>();

	private gameId: number;
	game: GameModel;
	showedMessage: string;
	background: string;

	character: string;

	player: HTMLAudioElement = new Audio()

	private nextLevelEvent: Subject<void> = new Subject<void>;

	ngOnDestroy(): void {
		console.log(1)
		this.breakSound.next();
		this.breakSound.complete();
	}

	ngAfterViewInit(): void {
		let value = (this.activatedRoute.snapshot.queryParamMap.get("showNested"));
		this.isShowNestedThemes = value ? value.toLocaleLowerCase() === 'true' : false;
		console.log(13, this.isShowNestedThemes)
		this.createComp();
		// this.typeWriter

		this.componentRef.instance.onAnswer.subscribe(isCorrect => {
			if (isCorrect) {
				this.showedMessage = this.game.correctAnswerText;
				play(this.game.correctAnswerSpeech)
				this.levelComplete = true;
			}
			else {
				this.showedMessage = this.game.incorrectAnswerText;
				play(this.game.incorrectAnswerSpeech);
			}

		});

		this.componentRef.instance.onGameFinish.subscribe(() => {
			this.gameFinished = true;
			this.showedMessage = this.game.finishText;
			play(this.game.finishSpeech);
			console.log("игра кончилась")
		});

		this.componentRef.instance.setTextAsActiveMsg?.subscribe((text) => {

			this.showedMessage = text;
		});

		setTimeout(() => {
			this.gameContainer.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });
		}, 300);
		
	}

	audioPlayer: HTMLAudioElement = new Audio();


	ngOnInit(): void {
		const gameId = Number(this.activatedRoute.snapshot.queryParamMap.get("game"));
		this.game = this.gamesService.getGameById(gameId);
		this.background = this.game.backgroundImage
		this.character = this.game.character;
		this.gameId = Number(this.activatedRoute.snapshot.queryParamMap.get("game"));
		this.player.src = this.game.welcomeSpeech;
		play(this.game.welcomeSpeech).then(() => {
			this.showedMessage = this.game.instructionsText;
			play(this.game.instructionsSpeech).then(() => this.instrcutionEnded.next())
			this.isInstructionsShow = true;
		})

		this.showedMessage = this.game.welcomeText;
	}

	goToNextLevel() {
		this.nextLevelEvent.next();
		this.levelComplete = false;
	}

	setNext() {
		this.showedMessage = this.game.instructionsText;
	}

	createComp() {
		switch (this.game.type) {
			case 1: {
				this.componentRef = this.viewRef.createComponent(WhatSoundComponent);

				this.componentRef.setInput("game", this.game);
				this.componentRef.setInput("nextLevelEvent", this.nextLevelEvent);
				break;
			}
			case 2: {
				this.componentRef = this.viewRef.createComponent(PhonemicAwarenessComponent);

				this.componentRef.instance.game = this.game;
				this.componentRef.instance.nextLevelEvent = this.nextLevelEvent;
				this.componentRef.instance.init();

				break;
			}
			case 3: {
				this.componentRef = this.viewRef.createComponent(PhonemeAnalysisComponent);
				this.componentRef.setInput("nextLevelEvent", this.nextLevelEvent);
				this.componentRef.setInput("onInstrcutionEnded", this.instrcutionEnded);
				this.componentRef.setInput("game", this.game);
				break;
			}
			case 4: {
				this.componentRef = this.viewRef.createComponent(SoundPositionComponent);
				this.componentRef.setInput("game", this.game);
				this.componentRef.setInput("onInstrcutionEnded", this.instrcutionEnded);
				this.componentRef.setInput("nextLevelEvent", this.nextLevelEvent);
				break;
			}
			case 5: {
				this.componentRef = this.viewRef.createComponent(FirstOrLastCharComponent);
				this.componentRef.setInput("game", this.game);
				this.componentRef.setInput("onInstrcutionEnded", this.instrcutionEnded);
				this.componentRef.setInput("nextLevelEvent", this.nextLevelEvent);
				break;
			}
			case 6: {
				this.componentRef = this.viewRef.createComponent(SoundSequenceComponent);
				this.componentRef.setInput("game", this.game);
				break;
			}
			case 7: {
				this.componentRef = this.viewRef.createComponent(MakeWordBySoundsComponent);
				this.componentRef.instance.game = this.game;
				this.componentRef.instance.nextLevelEvent = this.nextLevelEvent;
				this.componentRef.instance.init();
				break;
			}
			case 8: {
				this.componentRef = this.viewRef.createComponent(WordConversionComponent);
				this.componentRef.setInput("game", this.game);
				break;
			}
			default: {
				alert("Ошибка")
			}
		};

	}

	goToList(queryParams?: any) {
		this.router.navigate(['../games'], {
			relativeTo: this.activatedRoute,
			queryParams: queryParams
		})
	}

}
