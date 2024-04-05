import { NgModule } from "@angular/core";
import { GameLayoutComponent } from "./game-layout.component";
import { PhonemicAwarenessModule } from "../phonemic-awareness/phonemic-awareness.module";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

@NgModule({
    imports: [PhonemicAwarenessModule, CommonModule, RouterModule],
    exports: [GameLayoutComponent],
    declarations: [GameLayoutComponent],
    providers: []
})
export class GameLayoutModule {}