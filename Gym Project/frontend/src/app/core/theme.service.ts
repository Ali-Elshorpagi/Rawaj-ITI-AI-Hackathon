import { Injectable, signal, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type Theme = 'light' | 'dark';
export type Language = 'en' | 'ar';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  private readonly _theme = signal<Theme>(
    (localStorage.getItem('theme') as Theme) ?? 'light'
  );
  private readonly _language = signal<Language>(
    (localStorage.getItem('language') as Language) ?? 'en'
  );

  readonly theme = this._theme.asReadonly();
  readonly language = this._language.asReadonly();
  readonly isDark = () => this._theme() === 'dark';
  readonly isRTL = () => this._language() === 'ar';

  constructor() {
    effect(() => {
      const t = this._theme();
      const html = this.document.documentElement;
      html.setAttribute('data-theme', t);
      if (t === 'dark') {
        html.classList.add('dark-theme');
      } else {
        html.classList.remove('dark-theme');
      }
      localStorage.setItem('theme', t);
    });

    effect(() => {
      const lang = this._language();
      const html = this.document.documentElement;
      html.setAttribute('lang', lang);
      html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      document.body.classList.toggle('rtl', lang === 'ar');
      localStorage.setItem('language', lang);
    });

    this.applyInitial();
  }

  private applyInitial(): void {
    const html = this.document.documentElement;
    html.setAttribute('data-theme', this._theme());
    html.setAttribute('lang', this._language());
    html.setAttribute('dir', this._language() === 'ar' ? 'rtl' : 'ltr');
    if (this._theme() === 'dark') html.classList.add('dark-theme');
    document.body.classList.toggle('rtl', this._language() === 'ar');
  }

  setTheme(theme: Theme): void {
    this._theme.set(theme);
  }

  toggleTheme(): void {
    this._theme.update(t => t === 'light' ? 'dark' : 'light');
  }

  setLanguage(lang: Language): void {
    this._language.set(lang);
  }

  toggleLanguage(): void {
    this._language.update(l => l === 'en' ? 'ar' : 'en');
  }
}
