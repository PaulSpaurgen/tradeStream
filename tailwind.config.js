/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,vue,html}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'averta': ['Averta', 'sans-serif'],
      },
      colors: {
        'og-gray':'#111112',
        primary: {
          800: '#4C9077',
          700: '#54A184',
          500: '#65C49D',
        },
        red: {
          700: '#B4465A',
          600: '#C84E64',
          500: '#DE576F',
        },
        gray:{
          50:  '#C8C9C8',
          100: '#B6B7B6',
          200: '#A4A5A4',
          300: '#929292',
          400: '#7F807F',
          500: '#676768',
          600: '#545455',
          700: '#545455',
          750: '#374151',
          800: '#3D3D3E',
          850: '#323233',
          900: '#262627',
          950: '#1C1C1D',
          
        },
        black:{
          800:"#0A0A0B"
        },
        white:{
          800:"#FCFEFD"
        },
        blue: {
          800: '#4B71B7',
          700: '#557FCE',
          500: '#5F93F5',
        },
        orange: {
          700: '#C08853',
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