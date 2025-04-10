/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",],
    theme: {
      extend: {
        color:{
          purple:{
            200:"#e1e8ff",
            500:"#9492db",
            600:"#5447e6"
          },
          grey:{
            100:"eeeeef",
            200:"e6e9ed",
            600:"95989c"
          }
        }
      },
    },
    plugins: [],
  }
  