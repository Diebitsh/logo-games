import { BaseGameModel, IGameContentModel } from "./base-game.model";

export class PhonemicAwarenessGameModel extends BaseGameModel<PhonemicAwarenessGameContent> {
    
}

export class PhonemicAwarenessGameContent implements IGameContentModel {
    id: number;

    correctAnswer: { word: string, image: string };
    incorrectAnswer: { word: string, image: string };
    wordSpeech: string;
}