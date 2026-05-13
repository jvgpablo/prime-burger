import { createContext, useContext, useMemo, useState } from 'react'

const STORAGE_KEY = 'prime-burger-site-settings'

const defaultSettings = {
  contact: {
    phone: '+57 300 000 0000',
    email: 'contacto@primeburger.com',
    address: 'Calle 123 #45-67',
    instagram: {
      name: '@primeburger',
      link: 'https://instagram.com/primeburger',
    },
  },
}

const SiteSettingsContext = createContext(null)

function getSavedSettings() {
  const raw = localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return defaultSettings
  }

  try {
    const parsed = JSON.parse(raw)
    return {
      ...defaultSettings,
      ...parsed,
      contact: {
        ...defaultSettings.contact,
        ...(parsed.contact || {}),
      },
    }
  } catch {
    return defaultSettings
  }
}

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(getSavedSettings)

  function updateContact(contact) {
    const nextSettings = {
      ...settings,
      contact: {
        ...settings.contact,
        ...contact,
      },
    }

    setSettings(nextSettings)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSettings))
  }

  const value = useMemo(
    () => ({ settings, updateContact }),
    [settings],
  )

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext)

  if (!context) {
    throw new Error('useSiteSettings debe usarse dentro de SiteSettingsProvider')
  }

  return context
}
