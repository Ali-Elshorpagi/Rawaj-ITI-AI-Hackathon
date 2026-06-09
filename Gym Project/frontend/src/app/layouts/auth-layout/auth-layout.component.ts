import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '../../core/theme.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'gd-auth-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink, TranslateModule],
  template: `
    <div class="min-h-screen flex bg-[#0a0a0a]">

      <!-- ── Left Panel (brand) ──────────────────────────────────────── -->
      <div class="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden flex-col">
        <div class="absolute inset-0 bg-cover bg-center"
             style="background-image: url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80')">
        </div>
        <div class="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0a0a0a]/80 to-[#0a0a0a]/40"></div>

        <div class="relative z-10 flex flex-col h-full p-12">
          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-3 group">
            <div class="w-10 h-10 bg-[#22C55E] rounded-lg flex items-center justify-center">
              <i class="fa-solid fa-dumbbell text-[#0a0a0a] text-base"></i>
            </div>
            <span class="text-white font-black text-xl tracking-tight" style="font-family:'Space Grotesk',Inter,sans-serif">
              GYM<span class="text-[#22C55E]">DESK</span>
            </span>
          </a>

          <!-- Center content -->
          <div class="flex-1 flex flex-col justify-center max-w-md">
            <p class="text-[#22C55E] text-xs font-semibold tracking-widest uppercase mb-4">
              Premium Management Platform
            </p>
            <h2 class="text-4xl xl:text-5xl font-black text-white leading-tight mb-6"
                style="font-family:'Space Grotesk',Inter,sans-serif">
              MANAGE YOUR<br>
              <span class="text-[#22C55E]">GYM SMARTER</span>
            </h2>
            <p class="text-gray-400 leading-relaxed mb-10">
              The all-in-one platform for modern gyms. Track members, manage classes,
              process payments, and grow your fitness business.
            </p>

            <ul class="space-y-4">
              <li class="flex items-center gap-3">
                <div class="w-8 h-8 bg-[#22C55E]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i class="fa-solid fa-users text-[#22C55E] text-sm"></i>
                </div>
                <span class="text-gray-300 text-sm">Complete member management & profiles</span>
              </li>
              <li class="flex items-center gap-3">
                <div class="w-8 h-8 bg-[#22C55E]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i class="fa-solid fa-qrcode text-[#22C55E] text-sm"></i>
                </div>
                <span class="text-gray-300 text-sm">QR code & smart check-in system</span>
              </li>
              <li class="flex items-center gap-3">
                <div class="w-8 h-8 bg-[#22C55E]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i class="fa-solid fa-chart-line text-[#22C55E] text-sm"></i>
                </div>
                <span class="text-gray-300 text-sm">Real-time analytics & revenue reports</span>
              </li>
              <li class="flex items-center gap-3">
                <div class="w-8 h-8 bg-[#22C55E]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i class="fa-solid fa-shield-halved text-[#22C55E] text-sm"></i>
                </div>
                <span class="text-gray-300 text-sm">Multi-role access control & security</span>
              </li>
            </ul>
          </div>

          <!-- Stats strip -->
          <div class="grid grid-cols-3 gap-4">
            <div class="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div class="text-2xl font-black text-white" style="font-family:'Space Grotesk',Inter,sans-serif">15k+</div>
              <div class="text-[#22C55E] text-xs font-semibold tracking-wider uppercase mt-0.5">Members</div>
            </div>
            <div class="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div class="text-2xl font-black text-white" style="font-family:'Space Grotesk',Inter,sans-serif">50+</div>
              <div class="text-[#22C55E] text-xs font-semibold tracking-wider uppercase mt-0.5">Trainers</div>
            </div>
            <div class="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div class="text-2xl font-black text-white" style="font-family:'Space Grotesk',Inter,sans-serif">24/7</div>
              <div class="text-[#22C55E] text-xs font-semibold tracking-wider uppercase mt-0.5">Support</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Right Panel (form) ─────────────────────────────────────── -->
      <div class="flex-1 flex items-center justify-center px-6 py-12 lg:px-12 overflow-y-auto">
        <div class="w-full max-w-[420px]">

          <!-- Mobile logo + language toggle -->
          <div class="flex lg:hidden items-center justify-between mb-10">
            <a routerLink="/" class="flex items-center gap-2">
              <div class="w-8 h-8 bg-[#22C55E] rounded flex items-center justify-center">
                <i class="fa-solid fa-dumbbell text-[#0a0a0a] text-sm"></i>
              </div>
              <span class="text-white font-black text-lg" style="font-family:'Space Grotesk',Inter,sans-serif">
                GYM<span class="text-[#22C55E]">DESK</span>
              </span>
            </a>
            <button (click)="toggleLang()"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 text-xs font-semibold hover:border-[#22C55E]/40 hover:text-[#22C55E] transition-all">
              <i class="fa-solid fa-language"></i>
              {{ theme.language() === 'en' ? 'عربي' : 'EN' }}
            </button>
          </div>

          <!-- Desktop language toggle -->
          <div class="hidden lg:flex justify-end mb-6">
            <button (click)="toggleLang()"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 text-xs font-semibold hover:border-[#22C55E]/40 hover:text-[#22C55E] transition-all">
              <i class="fa-solid fa-language"></i>
              {{ theme.language() === 'en' ? 'عربي' : 'EN' }}
            </button>
          </div>

          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* RTL: flip the layout */
    :host-context([dir="rtl"]) .lg\\:flex {
      flex-direction: row-reverse;
    }
  `],
})
export class AuthLayoutComponent {
  protected readonly theme = inject(ThemeService);
  private readonly translate = inject(TranslateService);

  toggleLang(): void {
    this.theme.toggleLanguage();
    this.translate.use(this.theme.language());
  }
}
