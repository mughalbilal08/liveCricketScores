/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          DEFAULT: "#0B1F17", // deep night-pitch green-black
          light: "#123326",
        },
        floodlight: "#F5E6C8", // warm floodlight glow
        leather: "#B23A2E", // cricket ball red
        bail: "#C9A227", // stumps/bails gold
        chalk: "#F2EFE9", // off-white text
        linegray: "#3C5245",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "floodlight-glow":
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(245,230,200,0.18), rgba(11,31,23,0) 70%)",
        "stadium": "url('/bg.png')",
      },
    },
  },
  plugins: [],
};
