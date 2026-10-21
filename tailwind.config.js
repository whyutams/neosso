import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',

    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                'ung-maroon': {
                    DEFAULT: '#7B1113',
                    50: '#FDF6F6',
                    100: '#F9E8E9',
                    600: '#9C171A',
                    700: '#8B1416',
                    800: '#7B1113',
                    900: '#4A0708',
                    950: '#2D0405',
                },
                'ung-gold': {
                    DEFAULT: '#D4AF37',
                    light: '#FEF3C7',
                    hover: '#B59025',
                    dark: '#997300',
                },
            },
        },
    },

    plugins: [forms],
};
