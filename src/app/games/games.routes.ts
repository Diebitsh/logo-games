import { Routes } from "@angular/router";
import { GamesListComponent } from "./list/games-list.component";
import { GameLayoutComponent } from "./game-layout/game-layout.component";

export const gameRoutes: Routes = [
    {
        path: "games",
        component: GamesListComponent
    },
    {
        path: 'play',
        component: GameLayoutComponent,
    },
    {
        path: "games",
        redirectTo: "",
        pathMatch: "full"
    }
]