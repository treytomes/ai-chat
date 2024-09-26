/* eslint-disable-next-line node/no-unpublished-import */
import type {Config} from 'tailwindcss';
import {nextui} from '@nextui-org/react';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        primary: '#373EE3',
        secondary: '#32334F',
        destructive: '#F8215B',
        gray: '#F3F3F5',
        white: '#ffffff',
      },
      maxWidth: {
        '50': '50%',
      },
    },
  },
  darkMode: 'class',
  plugins: [nextui()],
};
export default config;
