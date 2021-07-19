module.exports = {
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      black: "#000",
      white: "#FFF",
      gray: "rgba(0, 0, 0, 0.6)",
      lightGray: "rgba(0, 0, 0, 0.2)",
      washedGray: "rgba(0, 0, 0, 0.05)",
      wall: "rgba(244, 243, 241, 1)",
      deepWall: "#E8E4DD",
      ultraDeepWall: "#32302D",
      washedWall: "rgba(240, 239, 236, .8)",
      yellow: "#fcce63",
      midYellow: "rgba(255, 199, 0, 0.6)",
      lightYellow: "rgba(255, 199, 0, 0.3)",
      washedYellow: "rgba(255, 199, 0, 0.05)",
      green: "rgba(0, 177, 113, 1)",
      midGreen: "rgba(0, 159, 101, 0.6)",
      lightGreen: "rgba(0, 159, 101, 0.3)",
      washedGreen: "rgba(0, 159, 101, 0.05)",
      blue: "#219DFF",
      purple: "rgba(157,82,255,0.8)",
      red: "#ff4136",
      transparent: "rgba(0,0,0,0)",
      washedWhite: "rgba(255,255,255, 0.5)",
      midWhite: "rgba(255,255,255, 0.7)",
      orange: '#ee5432',
      pink: '#ec6ff7'
    },
    backgroundColor: theme => theme('colors'),
    borderColor: theme => ({
      ...theme('colors'),
      DEFAULT: theme('colors.washedGray')
    }),
    fontFamily: {
      sans: ["Inter", "-apple-system", "sans-serif"],
      mono: ["Source Code Pro", "monospace"],
    },
    extend: {
      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem",
        "6xl": "4rem",
      },
      gridTemplateColumns: {
        'param': '128px 1fr'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};

