import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          app: '#F4F7F3',
          surface: '#FFFFFF',
          input: '#F9FBF8',
          accentSoft: '#E9F0E8',
        },
        border: {
          DEFAULT: '#DCE5DD',
          strong: '#C9D6CB',
        },
        brand: {
          DEFAULT: '#1E6B4F',
          hover: '#185A42',
          soft: '#E9F0E8',
        },
        txt: {
          primary: '#14231C',
          muted: '#52645A',
        },
        status: {
          success: '#1E6B4F',
          pending: '#8A5A00',
          failed: '#A12A2A',
        },
      },
      borderRadius: {
        card: '14px',
        element: '10px',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
