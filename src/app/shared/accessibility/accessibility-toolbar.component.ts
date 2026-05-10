import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { setGlobalVolume } from '../../../common/functions/sounds.functions';

interface A11ySettings {
  enabled: boolean;
  fontScale: number;
  bold: boolean;
  letterSpacing: number;
  lineHeight: number;
  volume: number;
  filter: 'none' | 'grayscale' | 'invert' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

const DEFAULTS: A11ySettings = {
  enabled: false,
  fontScale: 1,
  bold: false,
  letterSpacing: 0,
  lineHeight: 1.55,
  volume: 1,
  filter: 'none',
};

const STORAGE_KEY = 'lg-a11y';

@Component({
  selector: 'app-accessibility-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accessibility-toolbar.component.html',
  styleUrl: './accessibility-toolbar.component.scss',
})
export class AccessibilityToolbarComponent {
  settings = signal<A11ySettings>(this.loadInitial());
  panelOpen = signal(false);

  filters: A11ySettings['filter'][] = [
    'none',
    'grayscale',
    'invert',
    'protanopia',
    'deuteranopia',
    'tritanopia',
  ];

  filterLabels: Record<A11ySettings['filter'], string> = {
    none: 'Обычные цвета',
    grayscale: 'Чёрно-белый',
    invert: 'Инверсия',
    protanopia: 'Протанопия',
    deuteranopia: 'Дейтеранопия',
    tritanopia: 'Тританопия',
  };

  constructor() {
    effect(() => this.apply(this.settings()));
  }

  private apply(s: A11ySettings): void {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    const body = document.body;

    const active = s.enabled;

    // Font size — change <html> font-size so all rem-based sizes scale.
    html.style.fontSize = active ? `${16 * s.fontScale}px` : '';

    // Line height, letter spacing, weight — drive shared classes via CSS vars.
    html.style.setProperty('--lg-font-scale', active ? String(s.fontScale) : '1');
    html.style.setProperty('--lg-line-height', active ? String(s.lineHeight) : '1.55');
    html.style.setProperty('--lg-letter-spacing', active ? `${s.letterSpacing}px` : '0');
    html.style.setProperty('--lg-font-weight', active && s.bold ? '700' : '400');

    body.classList.toggle('a11y-mode', active);
    body.classList.toggle('a11y-bold', active && s.bold);
    body.classList.toggle('a11y-leading', active);
    body.classList.toggle('a11y-spacing', active && s.letterSpacing > 0);

    for (const f of this.filters) {
      body.classList.toggle(
        `a11y-filter-${f}`,
        active && s.filter === f && f !== 'none',
      );
    }

    // Audio volume — applied to the global singleton player used by all games.
    setGlobalVolume(active ? s.volume : 1);

    this.save(s);
  }

  togglePanel(): void { this.panelOpen.update((v) => !v); }
  toggleEnabled(): void { this.update({ enabled: !this.settings().enabled }); }
  reset(): void { this.settings.set({ ...DEFAULTS, enabled: this.settings().enabled }); }

  setFilter(f: A11ySettings['filter']): void { this.update({ filter: f }); }
  setFontScale(v: number): void { this.update({ fontScale: v }); }
  setLetterSpacing(v: number): void { this.update({ letterSpacing: v }); }
  setLineHeight(v: number): void { this.update({ lineHeight: v }); }
  setVolume(v: number): void { this.update({ volume: v }); }
  toggleBold(): void { this.update({ bold: !this.settings().bold }); }

  onRange(setter: (v: number) => void, ev: Event): void {
    setter(parseFloat((ev.target as HTMLInputElement).value));
  }

  private update(partial: Partial<A11ySettings>): void {
    this.settings.update((s) => ({ ...s, ...partial }));
  }

  private loadInitial(): A11ySettings {
    if (typeof localStorage === 'undefined') return { ...DEFAULTS };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULTS };
      return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULTS };
    }
  }

  private save(s: A11ySettings): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      /* ignore */
    }
  }
}
