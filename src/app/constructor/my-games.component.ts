import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CustomGamesService } from './custom-games.service';
import { CustomGame, GAME_TYPES } from './custom-game.model';

@Component({
  selector: 'app-my-games',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './my-games.component.html',
  styleUrl: './my-games.component.scss',
})
export class MyGamesComponent {
  private store = inject(CustomGamesService);

  games = this.store.games;
  types = GAME_TYPES;

  typeName(id: number): string {
    return this.types.find((t) => t.id === id)?.name ?? 'Игра';
  }

  typeIcon(id: number): string {
    return this.types.find((t) => t.id === id)?.icon ?? 'fi-rr-puzzle-alt';
  }

  async export(game: CustomGame): Promise<void> {
    await this.store.exportToFile(game);
  }

  async remove(game: CustomGame): Promise<void> {
    if (confirm(`Удалить игру «${game.name}»?`)) {
      await this.store.remove(game.id);
    }
  }

  async onImport(ev: Event): Promise<void> {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (file) {
      await this.store.importFromFile(file);
    }
    (ev.target as HTMLInputElement).value = '';
  }
}
