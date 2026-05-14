import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'main',
    loadComponent: () =>
      import('./get-started/get-started.component').then((m) => m.GetStartedComponent),
  },
  {
    path: 'games',
    loadComponent: () =>
      import('./games/list/games-list.component').then((m) => m.GamesListComponent),
  },
  {
    path: 'play',
    loadComponent: () =>
      import('./games/game-layout/game-layout.component').then((m) => m.GameLayoutComponent),
  },
  {
    path: 'constructor',
    loadComponent: () =>
      import('./constructor/constructor-picker.component').then((m) => m.ConstructorPickerComponent),
  },
  {
    path: 'constructor/:type',
    loadComponent: () =>
      import('./constructor/constructor-host.component').then((m) => m.ConstructorHostComponent),
  },
  {
    path: 'my-games',
    loadComponent: () =>
      import('./constructor/my-games.component').then((m) => m.MyGamesComponent),
  },
  {
    path: 'custom-play',
    loadComponent: () =>
      import('./constructor/custom-player.component').then((m) => m.CustomPlayerComponent),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'main',
  },
];
