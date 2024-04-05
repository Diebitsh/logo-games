import { BaseGameModel, IGameContentModel } from "./base-game.model";

export class MakeWordBySoundsGameModel extends BaseGameModel<MakeWordBySoundsGameContent> {
    
}

export class MakeWordBySoundsGameContent implements IGameContentModel {
    id: number;

    word: string;
    speech: string;
    image: string;
}