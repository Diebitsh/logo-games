export class BaseGameModel<TContent> {
    id: number;
    name: string;

    icon?: string;

    type: number;
    theme: number;

    backgroundImage: string;

    welcomeText: string;
    welcomeSpeech?: string;

    instructionsText: string;
    instructionsSpeech?: string;

    finishText: string;

    character: string;

    correctAnswerText: string;
    incorrectAnswerText: string;

    content: TContent[];
}

export interface IGameContentModel {
    id: number;
}