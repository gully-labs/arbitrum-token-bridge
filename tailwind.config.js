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
        // GullyChain kit gradient (tokens.json chainGradient) and derived fades
        gcChain: 'linear-gradient(90deg,#00B2FA,#46FB04)',
        gcMascotFade:
          'linear-gradient(90deg, #05080D 40%, rgba(5,8,13,.6) 58%, transparent 80%)',
        gradient:
          'linear-gradient(90deg, rgba(0, 178, 250, 0.5) 0%, rgba(70, 251, 4, 0.5) 100%)',
        gradientCctp: 'linear-gradient(95deg, #77E8CB 0%, #A199F7 100%)',
        gradientCelebration: 'linear-gradient(to right, #00B2FA6F, #46FB046F)',
        highlight:
          'linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.1) 25%, rgba(255, 255, 255, 0.1) 75%, rgba(255, 255, 255, 0))'
      },
      colors: {
        // GULLYCHAIN BRAND (brand-kit/tokens.json). Re-skins the upstream palette below in place; every
        // upstream colour name is kept so merges stay conflict-light.
        black: '#05080D', // night: page ground
        white: '#F2F5F7',
        'gc-night': '#05080D',
        'gc-ink': '#0A1018',
        'gc-blue': '#2563FF',
        'gc-cyan': '#00B2FA',
        'gc-green': '#46FB04',
        'gc-white': '#F2F5F7',
        'gc-muted': '#8A97A8',
        // derived (not in tokens.json): hairlines and the one "down" state
        'gc-line': 'rgba(138, 151, 168, 0.18)',
        'gc-down': '#FF8A80',

        // ACTION
        error: '#FF8A80',
        'blue-link': '#00B2FA',

        // PRIMARY
        cyan: '#DDEAFA',
        brick: '#FFDDD6',
        orange: '#FFEED3',
        lime: '#E8FFE4',
        lilac: '#754562',
        blue: '#00B2FA',

        // SECONDARY
        'cyan-dark': '#0E1726',
        'brick-dark': '#762716',
        'orange-dark': '#60461F',
        'lime-dark': '#1F5A23',

        // TRANSACTION STATUS COLORS
        claim: '#46FB04',
        retry: '#FF8A80',
        pending: '#CCB069',

        // NEUTRAL (GRAYS)
        'gray-1': '#0A1018',
        'gray-2': '#E5E5E5',
        'gray-3': '#DADADA',
        'gray-4': '#CCCCCC',
        'gray-5': '#8A97A8',
        'gray-6': '#999999',
        'gray-7': '#BDBDBD',
        'gray-8': 'rgba(138, 151, 168, 0.18)',
        'gray-dark': '#6D6D6D',
        'line-gray': '#F4F4F4',
        dark: '#0A1018', // (or default-black)
        'dark-hover': '#111A26', // (or default-black-hover)

        'bg-gray-1': '#0A1018',

        // BRAND
        'eth-dark': '#0A1018',
        'ocl-blue': '#111A26',
        'atmosphere-blue': '#0E1726',
        'widget-background': 'var(--color-widget-background, #0A1018)',
        'primary-cta': 'var(--color-primary-cta, #00B2FA)'
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
        // GullyChain: one face, Exo 2 (kit tokens.json), 600 for UI and 800 for headlines; see Font.ts
        gullyDisplay: ['var(--font-unica77)', 'Exo 2', 'sans-serif'],
        gullyLabel: ['var(--font-unica77)', 'Exo 2', 'sans-serif'],
        gullyNumbers: ['var(--font-unica77)', 'Exo 2', 'sans-serif'],
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
        // Gully: the transfers ticker tape slides left (motion-safe only, paused on hover)
        'gc-tape': {
          to: { transform: 'translateX(-100%)' }
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
        'gc-tape': 'gc-tape 60s linear infinite',
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
