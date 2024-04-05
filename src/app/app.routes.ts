import { Routes } from '@angular/router';
import { GamesListComponent } from './games/list/games-list.component';
import { GetStartedComponent } from './get-started/get-started.component';

export const routes: Routes = [
    {
        path: 'main',
        component: GetStartedComponent,
    },
    {
        path: "games",
        loadChildren: () => import("./games/games.module").then(m => m.GamesModule)
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'main'
    }
];
