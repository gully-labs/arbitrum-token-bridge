import useSWRImmutable from 'swr/immutable'
import { useArbQueryParams } from './useArbQueryParams'
import { unica } from '../components/common/Font'
import { ThemeConfig } from '../util/queryParamUtils'

export const defaultTheme: ThemeConfig = {
  borderRadius: '22px', // GullyChain kit: 22px cards; 44px-high controls become pills
  borderWidth: '1px',
  widgetBackgroundColor: '#0A1018', // GullyChain kit: ink (cards, surfaces)
  fontFamily: `${unica.style.fontFamily}, Roboto, sans-serif`
}

// Map theme properties to CSS variables
const themeVariableMap: Record<keyof ThemeConfig, string> = {
  borderRadius: '--border-radius',
  borderWidth: '--border-width',
  widgetBackgroundColor: '--color-widget-background',
  networkThemeOverrideColor: '--color-network-theme-override',
  primaryCtaColor: '--color-primary-cta',
  fontFamily: '--font-family'
}

function applyThemeToCSS(theme: ThemeConfig): void {
  // Clean up previous theme variables first
  Object.values(themeVariableMap).forEach(cssVariable => {
    document.documentElement.style.removeProperty(cssVariable)
  })

  // Apply new theme properties to CSS variables
  Object.entries(theme).forEach(([key, value]) => {
    const cssVariable = themeVariableMap[key as keyof ThemeConfig]
    if (cssVariable && value) {
      document.documentElement.style.setProperty(cssVariable, value.toString())
    }
  })
}

export function useTheme() {
  const [{ theme }] = useArbQueryParams()

  useSWRImmutable([theme, 'useTheme'], ([theme]) => {
    applyThemeToCSS(theme)
    return null
  })
}
