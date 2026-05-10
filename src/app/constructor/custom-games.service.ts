import { Injectable, signal } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';
import { CustomGame, CustomGameAsset } from './custom-game.model';

const DB_NAME = 'logo-games';
const STORE = 'custom-games';
const VERSION = 1;

@Injectable({ providedIn: 'root' })
export class CustomGamesService {
  private dbPromise: Promise<IDBPDatabase> | null = null;
  readonly games = signal<CustomGame[]>([]);

  constructor() {
    void this.refresh();
  }

  private db(): Promise<IDBPDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = openDB(DB_NAME, VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE)) {
            db.createObjectStore(STORE, { keyPath: 'id' });
          }
        },
      });
    }
    return this.dbPromise;
  }

  async refresh(): Promise<CustomGame[]> {
    const db = await this.db();
    const all = (await db.getAll(STORE)) as CustomGame[];
    all.sort((a, b) => b.updatedAt - a.updatedAt);
    this.games.set(all);
    return all;
  }

  async save(game: CustomGame): Promise<void> {
    const db = await this.db();
    game.updatedAt = Date.now();
    if (!game.createdAt) game.createdAt = game.updatedAt;
    await db.put(STORE, game);
    await this.refresh();
  }

  async remove(id: string): Promise<void> {
    const db = await this.db();
    await db.delete(STORE, id);
    await this.refresh();
  }

  async get(id: string): Promise<CustomGame | undefined> {
    const db = await this.db();
    return (await db.get(STORE, id)) as CustomGame | undefined;
  }

  async fileToAsset(file: File): Promise<CustomGameAsset> {
    const data = await readAsDataUrl(file);
    return { name: file.name, mime: file.type, data };
  }

  async exportToFile(game: CustomGame): Promise<void> {
    const blob = new Blob([JSON.stringify(game, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slugify(game.name)}.logogame.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async importFromFile(file: File): Promise<CustomGame> {
    const text = await file.text();
    const data = JSON.parse(text) as CustomGame;
    if (!data.id) data.id = crypto.randomUUID();
    data.id = `${data.id}-${Date.now().toString(36)}`;
    await this.save(data);
    return data;
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-zа-я0-9-]+/gi, '-')
    .replace(/^-+|-+$/g, '') || 'logo-game';
}
