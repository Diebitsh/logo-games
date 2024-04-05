export class GameModel {
    id: number;
    icon?: string;
    name: string;
    description?: string;
    type: number;
    theme: number;
    backgroundImage: string;
    welcomeText: string;
    instructionsText: string;
    instructionsSpeech?: string;
    finishText: string;
    finishSpeech?: string;
    character: string;
    correctAnswerText: string;
    correctAnswerSpeech?: string;
    incorrectAnswerText: string;
    incorrectAnswerSpeech?: string;
    content: any;
    welcomeSpeech?: string;
}