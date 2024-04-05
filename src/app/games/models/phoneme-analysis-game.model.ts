import { BaseGameModel, IGameContentModel } from "./base-game.model";

export class PhonemeAnalysisGameModel extends BaseGameModel<PhonemeAnalysisGameContent> {
    
}

export class PhonemeAnalysisGameContent implements IGameContentModel {
    id: number;

    word: string;
    speech: string;
    image: string;
}