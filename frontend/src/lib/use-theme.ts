import { useState, useEffect, useCallback } from 'react'

type Theme = 'dark' | 'light'

const STORAGE_KEY = 'app-theme'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('dark')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (stored === 'light') {
      setThemeState('light')
      document.documentElement.setAttribute('data-theme', 'light')
    } else {
      setThemeState('dark')
      document.documentElement.removeAttribute('data-theme')
    }
  }, [])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    if (newTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
      localStorage.setItem(STORAGE_KEY, 'light')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem(STORAGE_KEY, 'dark')
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  return { theme, setTheme, toggleTheme }
}
