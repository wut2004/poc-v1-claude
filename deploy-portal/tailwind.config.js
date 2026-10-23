/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      keyframes: {
        pop: { from: { opacity: 0, transform: 'translateY(-4px) scale(.98)' }, to: { opacity: 1, transform: 'none' } },
        rise: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } },
        ring: { '0%': { transform: 'scale(.9)', opacity: 0.7 }, '100%': { transform: 'scale(2.1)', opacity: 0 } },
        shimmer: { from: { backgroundPosition: '200% 0' }, to: { backgroundPosition: '-200% 0' } },
      },
      animation: {
        pop: 'pop .14s ease-out',
        rise: 'rise .35s ease-out both',
        ring: 'ring 1.6s ease-out infinite',
        shimmer: 'shimmer 2.4s linear infinite',
      },
    },
  },
  plugins: [],
};
