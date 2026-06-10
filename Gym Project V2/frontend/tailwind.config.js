/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  corePlugins: {
    // Disable Tailwind's base reset — Angular Material handles its own base styles
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        // ── Brand Blue (from Figma row 1) ─────────────────────────────────────
        'brand-50':   '#EAEDF7',
        'brand-100':  '#BAC4E6',
        'brand-200':  '#899DD6',
        'brand-300':  '#5B77BC',  // primary
        'brand-400':  '#3F5587',
        'brand-500':  '#263456',
        'brand-900':  '#0F172A',

        // ── Green (from Figma rows 3 & 4) ─────────────────────────────────────
        'gym-green':       '#22C55E',   // primary green
        'gym-green-light': '#2CF275',   // bright/neon green
        'gym-green-bright':'#28FB76',   // accent hover green
        'gym-green-dark':  '#16A34A',   // darker green
        'gym-green-deep':  '#0F7233',   // deepest green

        // ── Blue-Gray (from Figma row 5) ──────────────────────────────────────
        'slate-50':  '#F8FAFC',
        'slate-200': '#C0D4E5',
        'slate-300': '#88AFCD',
        'slate-400': '#6988A0',
        'slate-500': '#4C6476',
        'slate-700': '#31414E',
        'slate-900': '#182229',

        // ── Neutral (from Figma row 6) ────────────────────────────────────────
        'neutral-50':  '#ECECED',
        'neutral-200': '#C4C4C6',
        'neutral-400': '#78787D',
        'neutral-600': '#55555A',
        'neutral-800': '#353538',
        'neutral-900': '#171719',

        // ── Landing Page Dark Theme ───────────────────────────────────────────
        'gym-dark':    '#0a0a0a',    // page background
        'gym-surface': '#111111',    // card/panel surfaces
        'gym-card':    '#161616',    // card backgrounds
        'gym-border':  '#1f1f1f',    // subtle borders
        'gym-muted':   '#888888',    // muted text
      },
      fontFamily: {
        sans: ['Inter', 'IBM Plex Sans Arabic', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in':  'fadeIn 0.5s ease-out both',
        'slide-up': 'slideUp 0.4s ease-out both',
        'glow':     'glow 2s ease-in-out infinite alternate',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' },                              '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)'},'100%': { opacity: '1', transform: 'translateY(0)' } },
        glow:    { '0%': { boxShadow: '0 0 20px rgba(34,197,94,0.2)' },'100%': { boxShadow: '0 0 40px rgba(34,197,94,0.5)' } },
      },
      boxShadow: {
        'green-sm':  '0 0 15px rgba(34,197,94,0.2)',
        'green-md':  '0 0 30px rgba(34,197,94,0.3)',
        'green-lg':  '0 0 50px rgba(34,197,94,0.4)',
        'green-glow':'0 0 60px rgba(40,251,118,0.15)',
      },
    },
  },
  plugins: [],
};
