/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './packages/arb-token-bridge-ui/src/**/*.{js,ts,jsx,tsx}',
    './packages/app/pages/**/*.{js,ts,jsx,tsx}',
    './node_modules/@offchainlabs/cobalt/**/*.{js,ts,jsx,tsx}'
  ],
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require('@headlessui/tailwindcss')],
  theme: {
    extend: {
      backgroundImage: {
        // GullyChain kit gradients
        gcChain: 'linear-gradient(90deg,#1567F9 0%,#0F89F7 35%,#01D9FA 100%)',
        gcIcon: 'linear-gradient(180deg,#01D9F9 0%,#2E36F7 100%)',
        gcMascotFade:
          'linear-gradient(90deg, #000 40%, rgba(0,0,0,.6) 58%, transparent 80%)',
        gradient:
          'linear-gradient(90deg, rgba(21, 103, 249, 0.5) 0%, rgba(1, 217, 250, 0.5) 100%)',
        gradientCctp: 'linear-gradient(95deg, #77E8CB 0%, #A199F7 100%)',
        gradientCelebration: 'linear-gradient(to right, #1567F96F, #01D9FA6F)',
        highlight:
          'linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.1) 25%, rgba(255, 255, 255, 0.1) 75%, rgba(255, 255, 255, 0))'
      },
      colors: {
        // GULLYCHAIN BRAND (brand kit v2, CLAUDE_PROMPT.md section 2). Re-skins the upstream palette below
        // in place; every upstream colour name is kept so merges stay conflict-light.
        black: '#000000', // Void Black: page ground
        white: '#FFFFFF',
        'gc-black': '#000000',
        'gc-night': '#0A0F1A',
        'gc-line': '#16213A',
        'gc-royal': '#1567F9',
        'gc-electric': '#0F89F7',
        'gc-cyan': '#01D9FA',
        'gc-indigo': '#2E36F7',
        'gc-muted': '#9FB3CC',
        'gc-up': '#2E7D32',
        'gc-down': '#C0392B',

        // ACTION
        error: '#C0392B',
        'blue-link': '#01D9FA',

        // PRIMARY
        cyan: '#DDEAFA',
        brick: '#FFDDD6',
        orange: '#FFEED3',
        lime: '#E8FFE4',
        lilac: '#754562',
        blue: '#01D9FA',

        // SECONDARY
        'cyan-dark': '#0E1A33',
        'brick-dark': '#762716',
        'orange-dark': '#60461F',
        'lime-dark': '#1F5A23',

        // TRANSACTION STATUS COLORS
        claim: '#6AD28A',
        retry: '#C0392B',
        pending: '#CCB069',

        // NEUTRAL (GRAYS)
        'gray-1': '#0A0F1A',
        'gray-2': '#E5E5E5',
        'gray-3': '#DADADA',
        'gray-4': '#CCCCCC',
        'gray-5': '#9FB3CC',
        'gray-6': '#999999',
        'gray-7': '#BDBDBD',
        'gray-8': '#16213A',
        'gray-dark': '#6D6D6D',
        'line-gray': '#F4F4F4',
        dark: '#0A0F1A', // (or default-black)
        'dark-hover': '#111A2E', // (or default-black-hover)

        'bg-gray-1': '#0A0F1A',

        // BRAND
        'eth-dark': '#0A0F1A',
        'ocl-blue': '#16213A',
        'atmosphere-blue': '#0E1A33',
        'widget-background': 'var(--color-widget-background, #0A0F1A)',
        'primary-cta': 'var(--color-primary-cta, #01D9FA)'
      },
      spacing: {
        1: '5px',
        2: '10px',
        3: '15px',
        4: '20px',
        5: '25px',
        6: '30px',
        7: '35px',
        8: '40px',
        9: '45px',
        10: '50px',
        12: '60px',
        14: '70px',
        16: '80px',
        18: '90px',
        19: '95px',
        20: '100px',
        22: '110px',
        24: '120px',
        26: '130px',
        28: '140px',
        30: '150px',
        32: '160px',
        34: '170px',
        36: '180px',
        40: '200px',
        42: '210px',
        44: '220px',
        50: '250px',
        60: '300px',
        64: '320px',
        78: '380px',
        80: '400px'
      },
      fontFamily: {
        // GullyChain faces (see Font.ts): Poppins display, Barlow Condensed labels, IBM Plex Sans numbers,
        // Montserrat tagline. Body is Hanken Grotesk through `unica77`.
        gullyDisplay: ['var(--font-gully-display)', 'Poppins', 'sans-serif'],
        gullyLabel: [
          'var(--font-gully-label)',
          'Barlow Condensed',
          'sans-serif'
        ],
        gullyNumbers: [
          'var(--font-gully-numbers)',
          'IBM Plex Sans',
          'sans-serif'
        ],
        gullyTagline: ['var(--font-gully-tagline)', 'Montserrat', 'sans-serif'],
        unica77: ['var(--font-unica77)'],
        theme: ['var(--font-family, var(--font-unica77), Roboto, sans-serif)']
      },
      fontSize: {
        xl: '1.375rem'
      },
      lineHeight: {
        'extra-tight': '1.15'
      },
      maxWidth: {
        2: '0.5rem',
        4: '1rem',
        6: '1.5rem',
        8: '2rem'
      },
      borderRadius: {
        DEFAULT: 'var(--border-radius, 22px)',
        card: '22px',
        pill: '9999px'
      },
      borderWidth: {
        DEFAULT: 'var(--border-width, 1px)'
      },
      boxShadow: {
        // shadow used for input fields across the app
        input:
          '0px 2px 2px rgba(33,37,41,0.06), 0px 0px 1px rgba(33,37,41,0.08)',
        2: '0px 0px 1px 0px rgba(33, 37, 41, 0.08), 0px 2px 2px 0px rgba(33, 37, 41, 0.06)'
      },
      keyframes: {
        // Gully: a new row in the live transfers list slides in (motion-safe only)
        'gc-row-in': {
          '0%': { opacity: 0, transform: 'translateY(-6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        'blink-pulse': {
          '0%, 100%': {
            opacity: 1
          },
          '50%': {
            opacity: 0.5
          }
        }
      },
      animation: {
        'gc-row-in': 'gc-row-in 400ms ease-out 1',
        blink: 'blink-pulse 1s ease-in-out 1',
        blinkInfinite: 'blink-pulse 1s ease-in-out infinite'
      },
      transitionDuration: {
        400: '400ms',
        1000: '1000ms'
      }
    }
  }
}
