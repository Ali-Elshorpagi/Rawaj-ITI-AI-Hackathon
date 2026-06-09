import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerComponent } from 'ngx-spinner';
import { ThemeService } from './core/theme.service';

@Component({
  selector: 'gd-root',
  standalone: true,
  imports: [RouterOutlet, NgxSpinnerComponent],
  template: `
    <router-outlet />
    <ngx-spinner bdColor="rgba(0,0,0,0.4)" color="#5B77BC" type="ball-scale-multiple" />
  `,
})
export class AppComponent implements OnInit {
  private readonly translate = inject(TranslateService);
  private readonly themeService = inject(ThemeService);

  ngOnInit(): void {
    this.translate.addLangs(['en', 'ar']);
    this.translate.setDefaultLang('en');
    const savedLang = localStorage.getItem('language') ?? 'en';
    this.translate.use(savedLang);
  }
}
