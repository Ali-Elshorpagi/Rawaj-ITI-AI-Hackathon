import { Component, signal, HostListener, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/auth.service';
import { ThemeService } from '../../core/theme.service';
import { SubscriptionPlan, GymClass, ApiResponse } from '../../models/interfaces';
import { environment } from '../../../environments/environment';

interface Program {
  icon: string;
  nameKey: string;
  descKey: string;
  color: string;
}

interface Stat {
  value: string;
  labelKey: string;
  icon: string;
}

@Component({
  selector: 'gd-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <!-- ── NAV ──────────────────────────────────────────────────────────────── -->
    <nav class="fixed top-0 inset-x-0 z-50 transition-all duration-300"
         [ngClass]="scrolled() ? 'bg-gym-dark/95 backdrop-blur-md border-b border-white/10' : ''">
      <div class="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">

        <!-- Logo -->
        <a routerLink="/" class="flex items-center gap-2.5 group flex-shrink-0">
          <div class="w-9 h-9 bg-gym-green rounded-lg flex items-center justify-center shadow-green-sm">
            <i class="fa-solid fa-dumbbell text-gym-dark text-sm"></i>
          </div>
          <span class="font-display font-black text-white text-lg tracking-tight">
            GYM<span class="text-gym-green">DESK</span>
          </span>
        </a>

        <!-- Desktop Links -->
        <div class="hidden md:flex items-center gap-8">
          <a href="#programs" class="text-gray-400 hover:text-white text-sm font-medium transition-colors">
            {{ 'landing.nav.programs' | translate }}
          </a>
          <a href="#facilities" class="text-gray-400 hover:text-white text-sm font-medium transition-colors">
            {{ 'landing.nav.facilities' | translate }}
          </a>
          <a href="#pricing" class="text-gray-400 hover:text-white text-sm font-medium transition-colors">
            {{ 'landing.nav.pricing' | translate }}
          </a>
          <a href="#about" class="text-gray-400 hover:text-white text-sm font-medium transition-colors">
            {{ 'landing.nav.about' | translate }}
          </a>
        </div>

        <!-- Right side controls -->
        <div class="flex items-center gap-2">
          <!-- Language toggle -->
          <button (click)="toggleLang()"
                  class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-gym-green/40 text-gray-400 hover:text-gym-green transition-all text-xs font-semibold tracking-wide">
            <i class="fa-solid fa-language text-sm"></i>
            <span>{{ theme.language() === 'en' ? 'عربي' : 'EN' }}</span>
          </button>

          @if (auth.isLoggedIn()) {
            <a routerLink="/dashboard"
               class="px-5 py-2 bg-gym-green text-gym-dark text-sm font-black rounded-lg hover:brightness-110 transition-all tracking-wide">
              {{ 'landing.nav.dashboard' | translate }}
            </a>
          } @else {
            <a routerLink="/auth/login"
               class="hidden sm:block text-gray-400 hover:text-white text-sm font-medium transition-colors px-3 py-2">
              {{ 'landing.nav.signIn' | translate }}
            </a>
            <a routerLink="/auth/register"
               class="px-5 py-2 bg-gym-green text-gym-dark text-sm font-black rounded-lg hover:brightness-110 transition-all tracking-wide shadow-green-sm">
              {{ 'landing.nav.joinNow' | translate }}
            </a>
          }

          <!-- Mobile hamburger -->
          <button (click)="toggleMobileMenu()"
                  class="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 text-gray-400 hover:text-white transition-colors ms-1">
            <i [class]="mobileMenuOpen() ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'"></i>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      @if (mobileMenuOpen()) {
        <div class="md:hidden bg-[#0a0a0a] border-b border-white/10 px-5 pb-5 space-y-1">
          <a href="#programs" (click)="mobileMenuOpen.set(false)"
             class="block py-3 text-gray-400 hover:text-white text-sm font-medium transition-colors border-b border-white/5">
            {{ 'landing.nav.programs' | translate }}
          </a>
          <a href="#facilities" (click)="mobileMenuOpen.set(false)"
             class="block py-3 text-gray-400 hover:text-white text-sm font-medium transition-colors border-b border-white/5">
            {{ 'landing.nav.facilities' | translate }}
          </a>
          <a href="#pricing" (click)="mobileMenuOpen.set(false)"
             class="block py-3 text-gray-400 hover:text-white text-sm font-medium transition-colors border-b border-white/5">
            {{ 'landing.nav.pricing' | translate }}
          </a>
          <a href="#about" (click)="mobileMenuOpen.set(false)"
             class="block py-3 text-gray-400 hover:text-white text-sm font-medium transition-colors border-b border-white/5">
            {{ 'landing.nav.about' | translate }}
          </a>
          <div class="flex items-center gap-3 pt-3">
            <button (click)="toggleLang(); mobileMenuOpen.set(false)"
                    class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-gray-400 text-xs font-semibold">
              <i class="fa-solid fa-language"></i>
              {{ theme.language() === 'en' ? 'عربي' : 'EN' }}
            </button>
            @if (!auth.isLoggedIn()) {
              <a routerLink="/auth/login" (click)="mobileMenuOpen.set(false)"
                 class="flex-1 text-center py-2 border border-white/20 text-white text-sm font-medium rounded-lg">
                {{ 'landing.nav.signIn' | translate }}
              </a>
            }
          </div>
        </div>
      }
    </nav>

    <!-- ── HERO ──────────────────────────────────────────────────────────────── -->
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden bg-gym-dark">
      <div class="absolute inset-0">
        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAa2vzOgRsHxCjgu5ULLZGPNl5tw-p2Tr4RCV_agmEk0WoiiRogYyZpW22DB7hxixLywgjDjFOE3JIhX154gPsGGxwxNMI3lBeCCgABrrg-7X7JICfCKEF4ZlkfWLeoUclIthHQYIh4uYIwD_SxsJzrszVvtk5M9kp14HSKGvumJFYanLwuu25fhvC-EwuuSiSq0a1iEd8z1SJnMxNfkLZJUKDS_hyI_Z563WIXb8wEpvTEBjyGGyarNkBaJmTa3vgLtrXXFgiGPeQn"
             alt="Elite Athlete Training"
             class="w-full h-full object-cover object-center">
        <div class="absolute inset-0 bg-gradient-to-b from-gym-dark/70 via-gym-dark/50 to-gym-dark"></div>
        <!-- Radial glow -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="w-96 h-96 rounded-full bg-gym-green/5 blur-3xl"></div>
        </div>
      </div>

      <div class="relative z-10 text-center px-5 max-w-5xl mx-auto pt-16">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 border border-gym-green/40 rounded-full bg-gym-green/5 mb-8">
          <i class="fa-solid fa-crown text-gym-green text-xs"></i>
          <span class="text-gym-green text-xs font-bold tracking-[0.2em] uppercase">
            {{ 'landing.hero.badge' | translate }}
          </span>
        </div>

        <h1 class="font-display font-black text-white leading-none tracking-tighter mb-6 uppercase text-5xl md:text-8xl">
          {{ 'landing.hero.title1' | translate }}<br>
          <span class="text-gym-green italic">{{ 'landing.hero.title2' | translate }}</span>
        </h1>

        <p class="text-gray-300 text-base md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          {{ 'landing.hero.subtitle' | translate }}
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a routerLink="/auth/register"
             class="w-full sm:w-auto px-8 py-4 bg-gym-green text-gym-dark font-black text-sm tracking-widest uppercase rounded-xl hover:brightness-110 transition-all shadow-green-md">
            {{ 'landing.hero.cta1' | translate }}
          </a>
          <a href="#facilities"
             class="w-full sm:w-auto px-8 py-4 border border-white/20 text-white font-bold text-sm tracking-widest uppercase rounded-xl hover:bg-white/5 hover:border-white/40 transition-all">
            {{ 'landing.hero.cta2' | translate }}
          </a>
        </div>

        <!-- Trust indicators -->
        <div class="flex items-center justify-center gap-8 mt-14 flex-wrap">
          <div class="flex items-center gap-2 text-gray-500 text-xs">
            <i class="fa-solid fa-shield-halved text-gym-green text-sm"></i>
            <span>No contracts</span>
          </div>
          <div class="flex items-center gap-2 text-gray-500 text-xs">
            <i class="fa-solid fa-clock text-gym-green text-sm"></i>
            <span>24/7 Access</span>
          </div>
          <div class="flex items-center gap-2 text-gray-500 text-xs">
            <i class="fa-solid fa-star text-gym-green text-sm"></i>
            <span>5-star rated</span>
          </div>
        </div>
      </div>

      <div class="absolute bottom-8 start-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-gray-600 animate-bounce">
        <span class="text-[10px] tracking-widest uppercase">{{ 'landing.hero.scroll' | translate }}</span>
        <i class="fa-solid fa-chevron-down text-xs"></i>
      </div>
    </section>

    <!-- ── STATS ──────────────────────────────────────────────────────────────── -->
    <section class="bg-[#0d0d0d] border-y border-white/5">
      <div class="max-w-7xl mx-auto px-5 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        @for (s of stats; track s.labelKey) {
          <div class="text-center group">
            <div class="w-12 h-12 bg-gym-green/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-gym-green/20 transition-colors">
              <i [class]="s.icon + ' text-gym-green text-lg'"></i>
            </div>
            <div class="font-display text-3xl md:text-4xl font-black text-white mb-1">{{ s.value }}</div>
            <div class="text-gym-green text-[11px] font-semibold tracking-widest uppercase">{{ s.labelKey | translate }}</div>
          </div>
        }
      </div>
    </section>

    <!-- ── PROGRAMS ──────────────────────────────────────────────────────────── -->
    <section id="programs" class="bg-gym-dark py-24 px-5 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <p class="text-gym-green text-xs font-bold tracking-widest uppercase mb-3 flex items-center gap-2">
              <i class="fa-solid fa-fire"></i>
              {{ 'landing.programs.badge' | translate }}
            </p>
            <h2 class="font-display text-3xl md:text-5xl font-black text-white leading-tight uppercase">
              {{ 'landing.programs.title' | translate }}
            </h2>
          </div>
          <a routerLink="/auth/register"
             class="inline-flex items-center gap-2 text-white font-semibold text-sm border-b border-gym-green pb-0.5 hover:text-gym-green transition-colors flex-shrink-0">
            {{ 'landing.programs.viewAll' | translate }}
            <i class="fa-solid fa-arrow-right text-xs"></i>
          </a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (p of programs; track p.nameKey) {
            <div class="bg-gym-card border border-gym-border rounded-2xl p-7 hover:border-gym-green/40 hover:shadow-green-sm transition-all group cursor-pointer">
              <div class="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-colors"
                   [class]="'bg-gym-green/10 group-hover:bg-gym-green/20'">
                <i [class]="p.icon + ' text-gym-green text-2xl'"></i>
              </div>
              <h3 class="font-display text-white font-black text-lg mb-2">{{ p.nameKey | translate }}</h3>
              <p class="text-gray-500 text-sm leading-relaxed mb-5">{{ p.descKey | translate }}</p>
              <span class="text-gym-green text-xs font-bold tracking-widest uppercase flex items-center gap-1.5">
                {{ 'landing.programs.learnMore' | translate }}
                <i class="fa-solid fa-arrow-right text-[10px]"></i>
              </span>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ── LIVE CLASSES ──────────────────────────────────────────────────────── -->
    <section id="classes" class="bg-[#080808] py-24 px-5 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-14">
          <p class="text-gym-green text-xs font-bold tracking-widest uppercase mb-3 flex items-center justify-center gap-2">
            <i class="fa-solid fa-calendar-check"></i>
            {{ 'landing.classes.badge' | translate }}
          </p>
          <h2 class="font-display text-3xl md:text-5xl font-black text-white uppercase mb-4">
            {{ 'landing.classes.title' | translate }}
          </h2>
          <p class="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
            {{ 'landing.classes.subtitle' | translate }}
          </p>
        </div>

        @if (classesLoading()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (_ of [1,2,3,4,5,6]; track $index) {
              <div class="bg-gym-card border border-gym-border rounded-2xl p-6 animate-pulse">
                <div class="h-4 bg-gym-border rounded mb-3 w-2/3"></div>
                <div class="h-3 bg-gym-border rounded mb-2 w-1/2"></div>
                <div class="h-3 bg-gym-border rounded w-1/3"></div>
              </div>
            }
          </div>
        } @else if (classes().length === 0) {
          <div class="text-center py-16">
            <i class="fa-solid fa-calendar-xmark text-gray-700 text-5xl mb-4"></i>
            <p class="text-gray-600">{{ 'landing.classes.noClasses' | translate }}</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (cls of classes(); track cls.id) {
              <div class="bg-gym-card border border-gym-border rounded-2xl p-6 hover:border-gym-green/40 transition-all group">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1 min-w-0">
                    <h3 class="font-display text-white font-bold text-base truncate mb-1">{{ cls.title }}</h3>
                    <p class="text-gray-500 text-xs flex items-center gap-1.5">
                      <i class="fa-solid fa-user-tie text-gym-green"></i>
                      <span class="truncate">{{ cls.trainer?.firstName }} {{ cls.trainer?.lastName }}</span>
                    </p>
                  </div>
                  <span [ngClass]="cls.isFull
                        ? 'flex-shrink-0 ms-3 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-red-500/10 text-red-400'
                        : 'flex-shrink-0 ms-3 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gym-green/10 text-gym-green'">
                    {{ cls.isFull ? ('landing.classes.full' | translate) : (cls.availableSpots + ' ' + ('landing.classes.spots' | translate)) }}
                  </span>
                </div>

                <div class="flex flex-wrap gap-3 mb-5 text-xs text-gray-500">
                  <span class="flex items-center gap-1.5">
                    <i class="fa-solid fa-clock text-gym-green"></i>
                    {{ cls.startTime ? (cls.startTime | date:'shortTime') : '—' }}
                  </span>
                  @if (cls.location) {
                    <span class="flex items-center gap-1.5">
                      <i class="fa-solid fa-location-dot text-gym-green"></i>
                      {{ cls.location }}
                    </span>
                  }
                  <span class="flex items-center gap-1.5">
                    <i class="fa-solid fa-users text-gym-green"></i>
                    {{ cls.participants?.length ?? 0 }}/{{ cls.capacity }}
                  </span>
                </div>

                @if (cls.tags?.length) {
                  <div class="flex flex-wrap gap-1.5 mb-4">
                    @for (tag of cls.tags!.slice(0,3); track tag) {
                      <span class="px-2 py-0.5 bg-gym-border rounded-full text-[10px] text-gray-400 font-medium">{{ tag }}</span>
                    }
                  </div>
                }

                <a routerLink="/auth/register"
                   [ngClass]="cls.isFull
                     ? 'block text-center py-2.5 rounded-xl border transition-all text-xs font-bold uppercase tracking-wider border-gray-700 text-gray-600 cursor-not-allowed'
                     : 'block text-center py-2.5 rounded-xl border transition-all text-xs font-bold uppercase tracking-wider border-gym-green/40 text-gym-green hover:bg-gym-green hover:text-gym-dark'">
                  {{ cls.isFull ? ('landing.classes.full' | translate) : ('landing.classes.enroll' | translate) }}
                </a>
              </div>
            }
          </div>

          <div class="text-center mt-10">
            <a routerLink="/auth/login"
               class="inline-flex items-center gap-2 px-8 py-3.5 border border-gym-green/40 text-gym-green rounded-xl font-bold text-sm hover:bg-gym-green hover:text-gym-dark transition-all tracking-wide">
              <i class="fa-solid fa-calendar-days"></i>
              {{ 'landing.classes.viewAll' | translate }}
            </a>
          </div>
        }
      </div>
    </section>

    <!-- ── FACILITIES ────────────────────────────────────────────────────────── -->
    <section id="facilities" class="bg-gym-dark py-24 px-5 lg:px-8 overflow-hidden">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-14">
          <p class="text-gym-green text-xs font-bold tracking-widest uppercase mb-3 flex items-center justify-center gap-2">
            <i class="fa-solid fa-building-columns"></i>
            {{ 'landing.facilities.badge' | translate }}
          </p>
          <h2 class="font-display text-3xl md:text-5xl font-black text-white uppercase mb-4">
            {{ 'landing.facilities.title' | translate }}
          </h2>
          <p class="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
            {{ 'landing.facilities.subtitle' | translate }}
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
          <!-- Main large image -->
          <div class="md:col-span-8 group relative overflow-hidden rounded-2xl h-64 md:h-auto min-h-[300px]">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7Tmy5ZPFZ6Ka5rDscOrDICM4SC8OmJtAzW5c-svkfnB0RInnhmVfmpXmxRSD8HTQDXpeUxxr5mDDA-AfymaMC56BBqZ4KhovNA7eSOvboeYu82TtuBSpGqlkYb7iirIMJmz1Qnm1Stp6td7gpOoWSrL5TCHns2IWqEzoQ6RJhHED37MUjdhtTBPwMnbSOWmq4gfKMcfsmyVlyx1uWJm1cRKeXcKz7R3Ip9Nd89ageYZInj13PXmVWM0jURMewM0AO-Dix7SgG2iJr"
                 alt="Main Training Floor"
                 class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
            <div class="absolute inset-0 bg-gradient-to-t from-gym-dark/90 via-transparent to-transparent flex flex-col justify-end p-7">
              <p class="text-gym-green text-xs font-bold tracking-widest uppercase mb-1">
                {{ 'landing.facilities.floor' | translate }}
              </p>
              <p class="text-white font-black text-xl font-display">{{ 'landing.facilities.floorDesc' | translate }}</p>
            </div>
          </div>

          <!-- Right column -->
          <div class="md:col-span-4 grid grid-rows-2 gap-4">
            <div class="group relative overflow-hidden rounded-2xl h-48 md:h-auto">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMt060sjEVOamHVmWAdO4HrSrJrygS7D26OSZVtIuwSzUYJwDWA5GzhAWjrg9RcQw1Rj8LUYPFnrNGenIvK43wmTpYO0_EPt2RSmaN7Ai5l_gDCAc81TYuGW7-o8DInyjwYxFxxdaHt7PuyO6GHhVw845Gq4zdli-VRHUdc7_rj7C8WrazhuSAYctZUB0i87PSmhGKVKhLW1byDycRBbrnSGCsPyRucphT-Wq2iuzurdvOrhVKf3twOUF0WvbQjOGXTqDW7BL5S4Pk"
                   alt="Recovery Suite"
                   class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
              <div class="absolute inset-0 bg-gradient-to-t from-gym-dark/90 via-transparent to-transparent flex flex-col justify-end p-5">
                <p class="text-gym-green text-[10px] font-bold tracking-widest uppercase mb-1">
                  {{ 'landing.facilities.recovery' | translate }}
                </p>
                <p class="text-white font-bold text-sm">{{ 'landing.facilities.recoveryDesc' | translate }}</p>
              </div>
            </div>
            <div class="group relative overflow-hidden rounded-2xl h-48 md:h-auto">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZal3i7Rx7WjcmveE_cib8HTNmBhdGbjrACZOJT6Ru3lTppOfg3blbCS5Htqg0p0e5IfjBuO6d1z5VbGy-hWVEmDUu2u2QEHcqmSg93qXSe9fhUvZiLNzmBqugq2Z-nYzxzakcyUlQ6vN3QE4-q33YxtyC95qSOYKZfLMCka9ecbnIVZvyjHGssXJehRfv9v-R8nAV9OM7R9j7TdDT2WRavf6WreNGj3xklDLfWsOBGXtTnQiUZcu0REKqte4M8JNwMvCRue7P4w9S"
                   alt="Cardio Deck"
                   class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
              <div class="absolute inset-0 bg-gradient-to-t from-gym-dark/90 via-transparent to-transparent flex flex-col justify-end p-5">
                <p class="text-gym-green text-[10px] font-bold tracking-widest uppercase mb-1">
                  {{ 'landing.facilities.cardio' | translate }}
                </p>
                <p class="text-white font-bold text-sm">{{ 'landing.facilities.cardioDesc' | translate }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── PRICING ────────────────────────────────────────────────────────────── -->
    <section id="pricing" class="bg-[#080808] py-24 px-5 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-14">
          <p class="text-gym-green text-xs font-bold tracking-widest uppercase mb-3 flex items-center justify-center gap-2">
            <i class="fa-solid fa-tag"></i>
            {{ 'landing.pricing.badge' | translate }}
          </p>
          <h2 class="font-display text-3xl md:text-5xl font-black text-white uppercase mb-4">
            {{ 'landing.pricing.title' | translate }}
          </h2>
          <p class="text-gray-500 text-sm">{{ 'landing.pricing.subtitle' | translate }}</p>
        </div>

        @if (plansLoading()) {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            @for (_ of [1,2,3]; track $index) {
              <div class="bg-gym-card border border-gym-border rounded-2xl p-8 animate-pulse">
                <div class="h-5 bg-gym-border rounded mb-4 w-1/2"></div>
                <div class="h-10 bg-gym-border rounded mb-2 w-2/3"></div>
                <div class="h-3 bg-gym-border rounded mb-6 w-1/3"></div>
                <div class="space-y-3">
                  @for (_ of [1,2,3,4]; track $index) {
                    <div class="h-3 bg-gym-border rounded w-full"></div>
                  }
                </div>
              </div>
            }
          </div>
        } @else if (plans().length === 0) {
          <div class="text-center py-16">
            <i class="fa-solid fa-tags text-gray-700 text-5xl mb-4"></i>
            <p class="text-gray-500 mb-6">{{ 'landing.pricing.noPlans' | translate }}</p>
            <a routerLink="/auth/register"
               class="inline-flex items-center gap-2 px-8 py-3.5 bg-gym-green text-gym-dark rounded-xl font-black text-sm hover:brightness-110 transition-all">
              <i class="fa-solid fa-envelope"></i>
              {{ 'landing.pricing.contact' | translate }}
            </a>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            @for (plan of plans(); track plan.id) {
              <div class="relative rounded-2xl p-7 border transition-all hover:-translate-y-1"
                   [ngClass]="plan.isPopular
                     ? 'bg-gym-green border-transparent shadow-green-md'
                     : 'bg-gym-card border-gym-border hover:border-gym-green/40'">

                @if (plan.isPopular) {
                  <div class="absolute -top-3.5 start-1/2 -translate-x-1/2 px-4 py-1 bg-gym-dark text-gym-green text-[10px] font-black rounded-full border border-gym-green tracking-widest uppercase whitespace-nowrap">
                    {{ 'landing.pricing.popular' | translate }}
                  </div>
                }

                <div class="mb-5">
                  <div class="flex items-start justify-between mb-3">
                    <h3 class="font-display text-lg font-black" [class.text-gym-dark]="plan.isPopular" [class.text-white]="!plan.isPopular">
                      {{ plan.name }}
                    </h3>
                    <span [ngClass]="plan.isPopular
                          ? 'text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gym-dark/20 text-gym-dark'
                          : 'text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gym-green/10 text-gym-green'">
                      {{ plan.durationDays }} {{ 'landing.pricing.days' | translate }}
                    </span>
                  </div>
                  <div class="flex items-end gap-1">
                    <span class="font-display text-4xl font-black"
                          [class.text-gym-dark]="plan.isPopular"
                          [class.text-white]="!plan.isPopular">
                      {{ plan.price | currency:plan.currency:'symbol':'1.0-0' }}
                    </span>
                    <span class="text-sm pb-1.5" [class.text-gym-dark]="plan.isPopular" [class.text-gray-400]="!plan.isPopular">
                      {{ 'landing.pricing.perMonth' | translate }}
                    </span>
                  </div>
                  @if (plan.description) {
                    <p class="text-xs mt-2" [ngClass]="plan.isPopular ? 'text-gym-dark/70' : 'text-gray-500'">
                      {{ plan.description }}
                    </p>
                  }
                </div>

                <ul class="space-y-2.5 mb-7">
                  @for (f of plan.features; track $index) {
                    <li class="flex items-start gap-2.5 text-sm">
                      <i class="fa-solid fa-circle-check text-xs mt-0.5 flex-shrink-0"
                         [class.text-gym-dark]="plan.isPopular"
                         [class.text-gym-green]="!plan.isPopular"></i>
                      <span [class.text-gym-dark]="plan.isPopular" [class.text-gray-300]="!plan.isPopular">{{ f }}</span>
                    </li>
                  }
                </ul>

                <a routerLink="/auth/register"
                   [ngClass]="plan.isPopular
                     ? 'block text-center py-3.5 rounded-xl font-black text-sm tracking-wider transition-all uppercase bg-gym-dark text-gym-green hover:bg-gym-dark/90'
                     : 'block text-center py-3.5 rounded-xl font-black text-sm tracking-wider transition-all uppercase bg-gym-green text-gym-dark hover:brightness-110'">
                  {{ 'landing.pricing.getStarted' | translate }}
                </a>
              </div>
            }
          </div>
        }
      </div>
    </section>

    <!-- ── CTA ────────────────────────────────────────────────────────────────── -->
    <section id="about" class="relative py-32 px-5 lg:px-8 overflow-hidden bg-gym-dark">
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div class="w-[700px] h-[700px] rounded-full bg-gym-green/5 blur-3xl"></div>
      </div>
      <!-- Skewed accent -->
      <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-48 bg-gym-green/5 -skew-y-2 pointer-events-none"></div>

      <div class="relative max-w-3xl mx-auto text-center">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 border border-gym-green/30 rounded-full bg-gym-green/5 mb-8">
          <i class="fa-solid fa-bolt text-gym-green text-xs"></i>
          <span class="text-gym-green text-xs font-bold tracking-widest uppercase">Limited Time Offer</span>
        </div>

        <h2 class="font-display font-black text-white leading-none mb-6 uppercase tracking-tighter"
            style="font-size: clamp(2.5rem, 7vw, 5rem)">
          {{ 'landing.cta.title1' | translate }}<br>
          <span class="text-gym-green underline underline-offset-4 decoration-2">{{ 'landing.cta.title2' | translate }}</span>
        </h2>

        <p class="text-gray-400 text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          {{ 'landing.cta.subtitle' | translate }}
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-5">
          <a routerLink="/auth/register"
             class="w-full sm:w-auto px-10 py-4 bg-gym-green text-gym-dark font-black text-sm tracking-widest uppercase rounded-xl hover:brightness-110 transition-all shadow-green-lg">
            {{ 'landing.cta.button' | translate }}
          </a>
          <div class="flex items-center gap-3">
            <div class="flex -space-x-2">
              <div class="w-9 h-9 rounded-full bg-gray-700 border-2 border-gym-dark flex items-center justify-center text-xs text-white font-bold">J</div>
              <div class="w-9 h-9 rounded-full bg-gym-green/20 border-2 border-gym-dark flex items-center justify-center text-xs text-gym-green font-bold">M</div>
              <div class="w-9 h-9 rounded-full bg-gray-600 border-2 border-gym-dark flex items-center justify-center text-xs text-white font-bold">A</div>
            </div>
            <span class="text-gray-400 text-sm">{{ 'landing.cta.social' | translate }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── FOOTER ─────────────────────────────────────────────────────────────── -->
    <footer class="bg-[#050505] border-t border-white/5 pt-16 pb-8">
      <div class="max-w-7xl mx-auto px-5 lg:px-8">
        <!-- Top row -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
          <!-- Brand -->
          <div class="md:col-span-2">
            <a routerLink="/" class="flex items-center gap-2.5 mb-5 group w-fit">
              <div class="w-9 h-9 bg-gym-green rounded-lg flex items-center justify-center">
                <i class="fa-solid fa-dumbbell text-gym-dark text-sm"></i>
              </div>
              <span class="font-display font-black text-white text-lg tracking-tight">
                GYM<span class="text-gym-green">DESK</span>
              </span>
            </a>
            <p class="text-gray-500 text-sm leading-relaxed max-w-xs mb-7">
              {{ 'landing.footer.about' | translate }}
            </p>
            <div class="flex gap-3">
              <a href="#" class="w-9 h-9 rounded-full border border-gym-border flex items-center justify-center text-gray-500 hover:bg-gym-green hover:text-gym-dark hover:border-gym-green transition-all">
                <i class="fa-brands fa-instagram text-sm"></i>
              </a>
              <a href="#" class="w-9 h-9 rounded-full border border-gym-border flex items-center justify-center text-gray-500 hover:bg-gym-green hover:text-gym-dark hover:border-gym-green transition-all">
                <i class="fa-brands fa-x-twitter text-sm"></i>
              </a>
              <a href="#" class="w-9 h-9 rounded-full border border-gym-border flex items-center justify-center text-gray-500 hover:bg-gym-green hover:text-gym-dark hover:border-gym-green transition-all">
                <i class="fa-brands fa-youtube text-sm"></i>
              </a>
              <a href="#" class="w-9 h-9 rounded-full border border-gym-border flex items-center justify-center text-gray-500 hover:bg-gym-green hover:text-gym-dark hover:border-gym-green transition-all">
                <i class="fa-brands fa-facebook text-sm"></i>
              </a>
            </div>
          </div>

          <!-- Platform -->
          <div>
            <p class="text-white font-bold text-sm mb-5 uppercase tracking-wider">{{ 'landing.footer.platform' | translate }}</p>
            <ul class="space-y-3 text-sm text-gray-500">
              <li><a href="#programs" class="hover:text-gym-green transition-colors flex items-center gap-2"><i class="fa-solid fa-dumbbell text-xs text-gym-green/60"></i>{{ 'landing.nav.programs' | translate }}</a></li>
              <li><a href="#facilities" class="hover:text-gym-green transition-colors flex items-center gap-2"><i class="fa-solid fa-building text-xs text-gym-green/60"></i>{{ 'landing.nav.facilities' | translate }}</a></li>
              <li><a href="#pricing" class="hover:text-gym-green transition-colors flex items-center gap-2"><i class="fa-solid fa-tag text-xs text-gym-green/60"></i>{{ 'landing.nav.pricing' | translate }}</a></li>
              <li><a href="#classes" class="hover:text-gym-green transition-colors flex items-center gap-2"><i class="fa-solid fa-calendar text-xs text-gym-green/60"></i>{{ 'landing.classes.title' | translate }}</a></li>
            </ul>
          </div>

          <!-- Account & Contact -->
          <div>
            <p class="text-white font-bold text-sm mb-5 uppercase tracking-wider">{{ 'landing.footer.account' | translate }}</p>
            <ul class="space-y-3 text-sm text-gray-500 mb-7">
              <li><a routerLink="/auth/login" class="hover:text-gym-green transition-colors flex items-center gap-2"><i class="fa-solid fa-right-to-bracket text-xs text-gym-green/60"></i>{{ 'landing.footer.signIn' | translate }}</a></li>
              <li><a routerLink="/auth/register" class="hover:text-gym-green transition-colors flex items-center gap-2"><i class="fa-solid fa-user-plus text-xs text-gym-green/60"></i>{{ 'landing.footer.register' | translate }}</a></li>
              <li><a routerLink="/auth/forgot-password" class="hover:text-gym-green transition-colors flex items-center gap-2"><i class="fa-solid fa-key text-xs text-gym-green/60"></i>{{ 'landing.footer.resetPwd' | translate }}</a></li>
            </ul>
            <ul class="space-y-2 text-sm text-gray-500">
              <li class="flex items-center gap-2"><i class="fa-solid fa-envelope text-xs text-gym-green"></i> info&#64;gymdesk.com</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-phone text-xs text-gym-green"></i> +1 (800) GYM-DESK</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-location-dot text-xs text-gym-green"></i> 12 Locations Worldwide</li>
            </ul>
          </div>
        </div>

        <!-- Bottom row -->
        <div class="border-t border-white/5 pt-7 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p class="text-gray-600 text-xs">&copy; 2026 GymDesk. {{ 'landing.footer.rights' | translate }}</p>
          <div class="flex items-center gap-5 text-xs text-gray-600">
            <a href="#" class="hover:text-gray-400 transition-colors">{{ 'landing.footer.privacy' | translate }}</a>
            <a href="#" class="hover:text-gray-400 transition-colors">{{ 'landing.footer.terms' | translate }}</a>
            <button (click)="toggleLang()"
                    class="flex items-center gap-1.5 hover:text-gym-green transition-colors">
              <i class="fa-solid fa-language"></i>
              {{ theme.language() === 'en' ? 'عربي' : 'EN' }}
            </button>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host { display: block; background: #0a0a0a; }

    .font-display {
      font-family: 'Space Grotesk', Inter, sans-serif;
    }

    /* Tailwind doesn't generate font-display class by default with preflight off */
    h1, h2, h3 { font-family: 'Space Grotesk', Inter, sans-serif; }

    /* Smooth card hovers */
    .card-hover:hover {
      border-color: #22C55E;
      transform: translateY(-4px);
    }

    /* Fix Tailwind animate-bounce for this dark page */
    @keyframes landing-bounce {
      0%, 100% { transform: translateY(-20%) translateX(-50%); }
      50% { transform: translateY(0) translateX(-50%); }
    }

    /* RTL adjustments for pricing "most popular" badge */
    :host-context([dir="rtl"]) .font-display {
      font-family: 'IBM Plex Sans Arabic', 'Space Grotesk', sans-serif;
    }
  `],
})
export class LandingComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  private readonly http = inject(HttpClient);
  private readonly translate = inject(TranslateService);

  readonly scrolled = signal(false);
  readonly mobileMenuOpen = signal(false);
  readonly plans = signal<SubscriptionPlan[]>([]);
  readonly classes = signal<GymClass[]>([]);
  readonly plansLoading = signal(true);
  readonly classesLoading = signal(true);

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 40);
  }

  ngOnInit(): void {
    this.loadPlans();
    this.loadClasses();
  }

  toggleMobileMenu(): void { this.mobileMenuOpen.update(v => !v); }

  toggleLang(): void {
    this.theme.toggleLanguage();
    const newLang = this.theme.language();
    this.translate.use(newLang);
  }

  private loadPlans(): void {
    this.http.get<ApiResponse<SubscriptionPlan[]>>(`${environment.apiUrl}/plans`).subscribe({
      next: (res) => {
        const plans = res.data.filter(p => p.isActive).map(p => ({
          ...p,
          durationDays: p.durationMonths * 30,
          currency: 'USD',
          features: p.features ?? [],
        }));
        this.plans.set(plans);
        this.plansLoading.set(false);
      },
      error: () => this.plansLoading.set(false),
    });
  }

  private loadClasses(): void {
    this.http.get<ApiResponse<GymClass[]>>(`${environment.apiUrl}/classes`).subscribe({
      next: (res) => {
        const classes = (res.data as any[]).slice(0, 6).map((cls: any) => {
          const trainerObj = cls.trainerId as any;
          const trainerName = trainerObj?.userId?.firstName
            ? `${trainerObj.userId.firstName} ${trainerObj.userId.lastName ?? ''}`.trim()
            : trainerObj?.specialization ?? 'Trainer';
          return {
            ...cls,
            id: cls._id ?? cls.id,
            title: cls.name,
            startTime: cls.schedule?.[0]?.startTime ?? null,
            endTime: cls.schedule?.[0]?.endTime ?? null,
            participants: [],
            tags: cls.tags ?? [],
            isFull: (cls.enrollmentCount ?? 0) >= cls.capacity,
            availableSpots: cls.capacity - (cls.enrollmentCount ?? 0),
            trainer: { firstName: trainerName, lastName: '', specialization: trainerObj?.specialization ?? '' },
          } as GymClass;
        });
        this.classes.set(classes);
        this.classesLoading.set(false);
      },
      error: () => this.classesLoading.set(false),
    });
  }

  readonly stats: Stat[] = [
    { value: '15k+', labelKey: 'landing.stats.members',  icon: 'fa-solid fa-users' },
    { value: '50+',  labelKey: 'landing.stats.trainers', icon: 'fa-solid fa-person-running' },
    { value: '24/7', labelKey: 'landing.stats.access',   icon: 'fa-solid fa-door-open' },
    { value: '12',   labelKey: 'landing.stats.locations', icon: 'fa-solid fa-location-dot' },
  ];

  readonly programs: Program[] = [
    { icon: 'fa-solid fa-dumbbell',       nameKey: 'landing.programs.strength.name', descKey: 'landing.programs.strength.desc', color: '#22C55E' },
    { icon: 'fa-solid fa-stopwatch',      nameKey: 'landing.programs.hiit.name',     descKey: 'landing.programs.hiit.desc',     color: '#22C55E' },
    { icon: 'fa-solid fa-person-praying', nameKey: 'landing.programs.yoga.name',     descKey: 'landing.programs.yoga.desc',     color: '#22C55E' },
    { icon: 'fa-solid fa-user-tie',       nameKey: 'landing.programs.pt.name',       descKey: 'landing.programs.pt.desc',       color: '#22C55E' },
    { icon: 'fa-solid fa-hand-fist',      nameKey: 'landing.programs.boxing.name',   descKey: 'landing.programs.boxing.desc',   color: '#22C55E' },
    { icon: 'fa-solid fa-heart-pulse',    nameKey: 'landing.programs.cardio.name',   descKey: 'landing.programs.cardio.desc',   color: '#22C55E' },
  ];
}
