// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'], // ✅ Tailwind scans files in /src
  theme: {
    extend: {
      keyframes: {
        floatLine: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '0.8' },
        },
      },
      animation: {
        floatLine: 'floatLine 6s ease-in-out infinite',
        twinkle: 'twinkle 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
