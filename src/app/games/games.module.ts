import { NgModule } from "@angular/core";
import { GamesListComponent } from "./list/games-list.component";
import { RouterModule } from "@angular/router";
import { gameRoutes } from "./games.routes";
import { GamesService } from "./services/games.service";
import { CommonModule } from "@angular/common";
import { GameLayoutModule } from "./game-layout/game-layout.module";
import { MakeWordBySoundsModule } from "./make-word-by-sounds/make-word-by-sounds.module";
import { WhatSoundModule } from "./what-sound/what-sound.module";
import { FirstOrLastCharModule } from "./first-or-last-char/first-or-last-char.module";
import { PhonemeAnalysisModule } from "./phoneme-analysis/phoneme-analysis.module";
import { SoundPositionModule } from "./sound-position/sound-position.module";
import { SoundSequenceModule } from "./sound-sequence/sound-sequence.module";
import { WordConversionModule } from "./word-conversion/word-conversion.module";

@NgModule({
    imports: [
        CommonModule,
        GameLayoutModule,
        MakeWordBySoundsModule,
        WhatSoundModule,
        RouterModule.forChild(gameRoutes),
        FirstOrLastCharModule,
        PhonemeAnalysisModule,
        SoundPositionModule,
        SoundSequenceModule,
        WordConversionModule
    ],
    exports: [],
    declarations: [],
    providers: [GamesService],
})
export class GamesModule {}