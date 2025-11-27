const colors = require('tailwindcss/colors');

const dark_blue = { // Renamed for clarity, but still mapped to 'gray'/'neutral'
    50: 'hsl(215, 10%, 80%)', // Lighter background for the login card
    100: 'hsl(215, 10%, 70%)',
    200: 'hsl(215, 10%, 60%)',
    300: 'hsl(210, 13%, 65%)',
    400: 'hsl(210, 10%, 53%)',
    500: 'hsl(210, 12%, 43%)',
    600: 'hsl(210, 14%, 37%)',
    700: 'hsl(215, 18%, 20%)',
    800: 'hsl(218, 20%, 15%)',
    900: 'hsl(220, 25%, 10%)', // Near Black/Deepest Navy for background
};


module.exports = {
    content: [
        './resources/scripts/**/*.{js,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                header: ['"IBM Plex Sans"', '"Roboto"', 'system-ui', 'sans-serif'],
            },
            colors: {
                black: '#131a20',
                
                primary: {
                    '50': '#E6FBFF',
                    '100': '#D4F7FF',
                    '200': '#A5F0FF',
                    '300': '#76E9FF',
                    '400': '#47E2FF',
                    '500': '#18DBFF', // Your main action color (Electric Blue)
                    '600': '#00C7E6',
                    '700': '#00B1CC',
                    '800': '#009BA3',
                    '900': '#00858A',
                },

                gray: dark_blue,
                neutral: dark_blue,

                cyan: colors.cyan,
            },
            boxShadow: {
                // This creates a custom utility class named 'primary-glow'
                // The color is the RGB equivalent of your electric blue (18, 219, 255)
                'primary-glow': '0 0 10px 0 rgba(18, 219, 255, 0.6), 0 0 20px 0 rgba(18, 219, 255, 0.4)',
            },
            fontSize: {
                '2xs': '0.625rem',
            },
            transitionDuration: {
                250: '250ms',
            },
            borderColor: theme => ({
                default: theme('colors.neutral.400', 'currentColor'),
            }),
        },
    },
    plugins: [
        require('@tailwindcss/line-clamp'),
        require('@tailwindcss/forms')({
            strategy: 'class',
        }),
    ]
};
