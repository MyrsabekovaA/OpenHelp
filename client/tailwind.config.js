/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./pages/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                bg: "#0b0f1a",
                card: "#111827",
                brand: "#7c3aed"
            },
            boxShadow: {
                glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
            },
            backdropBlur: {
                xs: '2px',
            }
        }
    },
    plugins: []
};