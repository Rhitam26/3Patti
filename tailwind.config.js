/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'game-dark': '#0a0e1a',
        'game-blue': '#0d1b3e',
        'game-purple': '#1a0533',
        'game-gold': '#f5c518',
        'game-green': '#1a4a2e',
        'table-felt': '#1a5c35',
        'table-border': '#2d8a50',
        'neon-pink': '#ff2d78',
        'neon-purple': '#9d00ff',
        'neon-blue': '#00d4ff',
      },
      fontFamily: {
        game: ['Orbitron', 'sans-serif'],
        display: ['Exo 2', 'sans-serif'],
      },
      backgroundImage: {
        'game-gradient': 'linear-gradient(135deg, #0a0e1a 0%, #0d1b3e 50%, #1a0533 100%)',
        'gold-gradient': 'linear-gradient(135deg, #f5c518 0%, #ff9500 100%)',
        'purple-gradient': 'linear-gradient(135deg, #9d00ff 0%, #4400cc 100%)',
        'table-gradient': 'radial-gradient(ellipse at center, #1a6b3c 0%, #0d3d20 100%)',
      },
      animation: {
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'card-flip': 'cardFlip 0.6s ease-in-out',
        'chip-toss': 'chipToss 0.8s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 5px #9d00ff, 0 0 20px #9d00ff' },
          '50%': { boxShadow: '0 0 20px #9d00ff, 0 0 60px #9d00ff, 0 0 80px #9d00ff' },
        },
        cardFlip: {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};