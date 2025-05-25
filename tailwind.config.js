/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,vue,html}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          800: '#219E8B',
          700: '#43B39B',
          500: '#6FCF97',
        },
        neutral: {
          50:  '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          950: '#030712',
        },
        semantic: {
          red: {
            700: '#E57373',
            600: '#EF5350',
            500: '#F44336',
          },
          blue: {
            800: '#1976D2',
            700: '#2196F3',
            500: '#64B5F6',
          },
          orange: {
            700: '#FF9800',
          },
        },
        heatmap: {
          red: {
            500: '#F87171',
            400: '#FB7185',
            300: '#FCA5A5',
            200: '#FECACA',
            100: '#FFE4E6',
          },
          green: {
            500: '#6FCF97',
            400: '#43B39B',
            300: '#219E8B',
            200: '#1ABC9C',
            100: '#A7F3D0',
          },
        },
        // Add more as needed...
      },
    },
  },
  plugins: [],
}