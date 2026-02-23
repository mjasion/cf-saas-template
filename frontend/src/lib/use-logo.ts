import { useState, useEffect, useCallback } from 'react'
import {
  getLogoConfig,
  setLogoConfig as persistLogoConfig,
  clearLogoConfig,
  DEFAULT_LOGO_CONFIG,
  type LogoConfig,
} from './logo-config'

const LOGO_CHANGE_EVENT = 'logo-config-change'

export function useLogo() {
  const [config, setConfigState] = useState<LogoConfig>(DEFAULT_LOGO_CONFIG)

  useEffect(() => {
    setConfigState(getLogoConfig())

    const handler = () => setConfigState(getLogoConfig())
    window.addEventListener(LOGO_CHANGE_EVENT, handler)
    return () => window.removeEventListener(LOGO_CHANGE_EVENT, handler)
  }, [])

  const setConfig = useCallback((newConfig: LogoConfig) => {
    setConfigState(newConfig)
    persistLogoConfig(newConfig)
    window.dispatchEvent(new Event(LOGO_CHANGE_EVENT))
  }, [])

  const resetConfig = useCallback(() => {
    clearLogoConfig()
    setConfigState(DEFAULT_LOGO_CONFIG)
    window.dispatchEvent(new Event(LOGO_CHANGE_EVENT))
  }, [])

  return { config, setConfig, resetConfig }
}
