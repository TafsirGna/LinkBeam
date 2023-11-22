/** @type {import('tailwindcss').Config} */
export default {
  // prefix: 'tw-',
  content: [
    "./src/webUI/**/*.{js,jsx,ts,tsx}",
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

