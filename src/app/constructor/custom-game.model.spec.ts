import { isLegacyGame, CUSTOM_GAME_SCHEMA } from './custom-game.model';

describe('isLegacyGame', () => {
  it('считает игру без поля schema устаревшей', () => {
    expect(isLegacyGame({})).toBe(true);
  });

  it('считает игру со schema=1 устаревшей', () => {
    expect(isLegacyGame({ schema: 1 })).toBe(true);
  });

  it('считает игру с текущей schema актуальной', () => {
    expect(isLegacyGame({ schema: CUSTOM_GAME_SCHEMA })).toBe(false);
  });
});
