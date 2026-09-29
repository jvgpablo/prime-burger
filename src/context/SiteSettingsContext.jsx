import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  saveContactSettings,
  subscribeToContactSettings,
} from '../services/firestore.service'

const defaultSettings = {
  contact: {
    phone: '+57 300 000 0000',
    whatsappLink: '',
    email: 'contacto@primeburger.com',
    address: 'Calle 123 #45-67',
    instagram: {
      name: '@primeburger',
      link: 'https://instagram.com/primeburger',
    },
  },
}

const SiteSettingsContext = createContext(null)

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings)

  useEffect(() => {
    let unsubscribe = () => {}
    let isActive = true

    subscribeToContactSettings((nextSettings) => {
      if (isActive) {
        setSettings(nextSettings)
      }
    })
      .then((nextUnsubscribe) => {
        if (!isActive) {
          nextUnsubscribe?.()
          return
        }

        unsubscribe = nextUnsubscribe || (() => {})
      })
      .catch((error) => {
        console.error('No se pudieron cargar los ajustes de contacto.', error)
      })

    return () => {
      isActive = false
      unsubscribe()
    }
  }, [])

  async function updateContact(contact) {
    const nextSettings = {
      ...settings,
      contact: {
        ...settings.contact,
        ...contact,
      },
    }

    await saveContactSettings(nextSettings.contact)
    setSettings(nextSettings)
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
