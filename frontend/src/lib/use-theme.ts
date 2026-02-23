import { useState, useEffect, useCallback } from 'react'
import { getThemeById, type ThemeColors } from './themes'

export type ThemeMode = 'dark' | 'light'

const THEME_KEY = 'app-theme'
const MODE_KEY = 'app-theme-mode'
const CSS_CACHE_KEY = 'app-theme-css'

/** Maps ThemeColors fields to CSS custom property names */
const CSS_VAR_MAP: [keyof ThemeColors, string][] = [
  ['background', '--color-background'],
  ['foreground', '--color-foreground'],
  ['card', '--color-card'],
  ['cardForeground', '--color-card-foreground'],
  ['border', '--color-border'],
  ['input', '--color-input'],
  ['muted', '--color-muted'],
  ['mutedForeground', '--color-muted-foreground'],
  ['primary', '--color-primary'],
  ['primaryForeground', '--color-primary-foreground'],
  ['destructive', '--color-destructive'],
  ['ring', '--color-ring'],
  ['accent', '--color-accent'],
  ['accentForeground', '--color-accent-foreground'],
  ['sidebar', '--color-sidebar'],
  ['sidebarForeground', '--color-sidebar-foreground'],
  ['sidebarAccent', '--color-sidebar-accent'],
  ['sidebarAccentForeground', '--color-sidebar-accent-foreground'],
  ['sidebarBorder', '--color-sidebar-border'],
  ['sidebarRing', '--color-sidebar-ring'],
  ['popover', '--color-popover'],
  ['popoverForeground', '--color-popover-foreground'],
  ['surfaceElevated', '--color-surface-elevated'],
  ['textSecondary', '--color-text-secondary'],
  ['textMuted', '--color-text-muted'],
  ['gradientPrimary', '--gradient-primary'],
  ['gradientHero', '--gradient-hero'],
  ['glassBackground', '--glass-background'],
  ['glassBorder', '--glass-border'],
  ['bentoShadow', '--bento-shadow'],
  ['bentoShadowHover', '--bento-shadow-hover'],
]

function buildCssString(colors: ThemeColors): string {
  return CSS_VAR_MAP.map(([key, prop]) => `${prop}:${colors[key]}`).join(';')
}

function applyThemeColors(colors: ThemeColors) {
  const root = document.documentElement
  for (const [key, prop] of CSS_VAR_MAP) {
    root.style.setProperty(prop, colors[key])
  }
}

function applyTheme(themeId: string, mode: ThemeMode) {
  const theme = getThemeById(themeId)
  const colors = mode === 'light' ? theme.light : theme.dark
  applyThemeColors(colors)

  // Cache CSS string for FOUC prevention script
  try { localStorage.setItem(CSS_CACHE_KEY, buildCssString(colors)) } catch {}

  // Set data attributes for CSS selectors and meta
  const root = document.documentElement
  root.setAttribute('data-theme', mode)
  root.setAttribute('data-theme-id', themeId)

  // Update meta theme-color for browser chrome / mobile status bar (WCAG / SEO best practice)
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', colors.background)
  }

  // Update color-scheme for native form controls accessibility
  const metaColorScheme = document.querySelector('meta[name="color-scheme"]')
  if (metaColorScheme) {
    metaColorScheme.setAttribute('content', mode === 'light' ? 'light' : 'dark')
  }
}

export function useTheme() {
  const [themeId, setThemeIdState] = useState<string>('default')
  const [mode, setModeState] = useState<ThemeMode>('dark')

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_KEY) || 'default'
    const storedMode = (localStorage.getItem(MODE_KEY) as ThemeMode) || 'dark'
    setThemeIdState(storedTheme)
    setModeState(storedMode)
    applyTheme(storedTheme, storedMode)
  }, [])

  const setThemeId = useCallback((id: string) => {
    setThemeIdState(id)
    localStorage.setItem(THEME_KEY, id)
    const currentMode = (localStorage.getItem(MODE_KEY) as ThemeMode) || 'dark'
    applyTheme(id, currentMode)
  }, [])

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode)
    localStorage.setItem(MODE_KEY, newMode)
    const currentTheme = localStorage.getItem(THEME_KEY) || 'default'
    applyTheme(currentTheme, newMode)
  }, [])

  const toggleMode = useCallback(() => {
    const newMode = mode === 'dark' ? 'light' : 'dark'
    setMode(newMode)
  }, [mode, setMode])

  // Backwards-compat aliases
  const theme = mode
  const setTheme = setMode
  const toggleTheme = toggleMode

  return { theme, setTheme, toggleTheme, themeId, setThemeId, mode, setMode, toggleMode }
}
