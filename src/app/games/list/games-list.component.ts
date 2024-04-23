import { Component, OnInit } from '@angular/core';
import { GamesService } from '../services/games.service';
import { GameThemeModel } from '../models/game-theme.model';
import { CommonModule } from '@angular/common';
import { GameModel } from '../models/game.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
	selector: 'app-games-list',
	standalone: true,
	imports: [
		CommonModule
	],
	templateUrl: './games-list.component.html',
	styleUrl: './games-list.component.scss'
})
export class GamesListComponent implements OnInit {
	isShowNestedThemes: boolean = false;

	constructor(private gamesService: GamesService, private router: Router, private activatedRoute: ActivatedRoute) { }

	themes: GameThemeModel[] = [];
	nestedThemes: GameThemeModel[] = [];
	games: GameModel[] = [];
	activeTheme: number;

	ngOnInit(): void {
		// document.body.className = "image-back";
		this.loadThemes();
		this.activeTheme = Number(this.activatedRoute.snapshot.queryParamMap.get("theme"));
		let value = (this.activatedRoute.snapshot.queryParamMap.get("showNested"));
		this.isShowNestedThemes = value ? value.toLocaleLowerCase() === 'true' : false;
		console.log(this.isShowNestedThemes)
		if (this.activeTheme != null) {
			const activeTheme = !this.isShowNestedThemes ? this.themes.find(x => x.id == this.activeTheme) : this.nestedThemes.find(x => x.id == this.activeTheme);
			this.showGamesByTheme(activeTheme);
		};
	}

	loadThemes() {
		this.themes = this.gamesService.getThemesList();
		this.nestedThemes = this.gamesService.getNestedThemesList();
	}

	showNestedThemes() {
		this.isShowNestedThemes = true;
		this.router.navigate([], {
			relativeTo: this.activatedRoute,
			queryParams: {
				showNested: true
			}
		})
	}

	hideNestedThemes() {
		this.isShowNestedThemes = false;
		this.router.navigate([], {
			relativeTo: this.activatedRoute,
			queryParams: {
				showNested: undefined
			}
		});
	}

	clearActiveTheme() {
		this.activeTheme = null;
		this.router.navigate([], {
			relativeTo: this.activatedRoute,
			queryParams: {
				theme: null,
				showNested: this.isShowNestedThemes
			}
		})
		this.games = [];
		this.themes.forEach(x => x.isActive = false);
		this.nestedThemes.forEach(x => x.isActive = false)
	}

	showGamesByTheme(theme: GameThemeModel) {
		this.activeTheme = theme.id;
		this.router.navigate([], {
			relativeTo: this.activatedRoute,
			queryParams: {
				theme: theme.id,
				showNested: this.isShowNestedThemes
			}
		})
		this.themes.forEach(t => t.isActive = false);
		theme.isActive = true;
		this.games =  this.gamesService.getGamesByTheme(theme.id);
	}

	goToGame(game: GameModel) {
		this.router.navigate(['../play'], {
			relativeTo: this.activatedRoute,
			queryParams: {
				'game': game.id,
				'showNested': this.isShowNestedThemes
			}
		})
	}
}
