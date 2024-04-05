import { Injectable } from "@angular/core";
import data from '../data/source.json';
import { GameThemeModel } from "../models/game-theme.model";
import { GameModel } from "../models/game.model";

@Injectable()
export class GamesService {


    getThemesList(): GameThemeModel[] {
        return data.themes as GameThemeModel[];
    }

    getGamesByTheme(themeId: number): GameModel[] {
        return data.games.filter(game => game.theme == themeId) as GameModel[];
    }

    getGameById(gameId: number): GameModel {
        return data.games.find(game => game.id == gameId);
    }
}