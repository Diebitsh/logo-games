import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { CommonModule } from "@angular/common";
import { BrowserAnimationsModule, NoopAnimationsModule } from "@angular/platform-browser/animations";
import { RouterOutlet, RouterModule } from "@angular/router";
import { GamesModule } from "./games/games.module";
import { routes } from "./app.routes";
import { BrowserModule } from "@angular/platform-browser";
import { GameLayoutModule } from "./games/game-layout/game-layout.module";
import { GetStartedModule } from "./get-started/get-started.module";

@NgModule({
    imports: [
        CommonModule, 
        BrowserModule, 
        RouterOutlet, 
        RouterModule.forRoot(routes), 
        GamesModule, 
        GetStartedModule,
        BrowserAnimationsModule,
        NoopAnimationsModule
    ],
    exports: [],
    declarations: [AppComponent],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }