/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'Pretendard Variable', 'Inter', '-apple-system', 'sans-serif'],
        display: ['Inter', 'Pretendard', 'sans-serif'],
      },
      colors: {
        base: {
          900: '#010102',
          850: '#0b0d10',
          800: '#0f1011',
          700: '#18191a',
          600: '#23252a',
          500: '#34343a',
          400: '#82868f',
          300: '#aab0bb',
          200: '#d0d6e0',
          100: '#f7f8f8',
        },
        gold: {
          DEFAULT: '#C9A84C',
          bright: '#E4C46A',
          deep: '#9a7d2e',
        },
        // 기존 indigo 액센트를 골드 톤으로 매핑 — 컴포넌트 코드 수정 없이 전체 골드화
        indigo: {
          100: '#f3e6c4',
          200: '#E4C46A',
          300: '#E4C46A',
          400: '#E4C46A',
          500: '#C9A84C',
          600: '#9a7d2e',
          700: '#7c6526',
        },
        quality: {
          uncommon: '#1eff00',
          rare: '#0070dd',
          epic: '#a335ee',
          legendary: '#ff8000',
        },
      },
    },
  },
  plugins: [],
};
