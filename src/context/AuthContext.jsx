import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from '../firebase/config'

const AuthContext = createContext(null)

const LOCAL_AUTH_SESSION_KEY = 'prime-burger-auth-session'
const LOCAL_ADMIN_EMAIL = 'admin@primeburger.com'
const LOCAL_ADMIN_PASSWORD = 'Pb2026!Admin#Secure'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      const savedEmail = localStorage.getItem(LOCAL_AUTH_SESSION_KEY)
      setUser(savedEmail ? { email: savedEmail } : null)
      setAuthLoading(false)
      return undefined
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setAuthLoading(false)
    })

    return unsubscribe
  }, [])

  async function login(email, password) {
    if (!auth) {
      if (email === LOCAL_ADMIN_EMAIL && password === LOCAL_ADMIN_PASSWORD) {
        const nextUser = { email: LOCAL_ADMIN_EMAIL }
        setUser(nextUser)
        localStorage.setItem(LOCAL_AUTH_SESSION_KEY, LOCAL_ADMIN_EMAIL)
        return nextUser
      }

      throw new Error('Credenciales invalidas')
    }

    return signInWithEmailAndPassword(auth, email, password)
  }

  async function logout() {
    if (!auth) {
      setUser(null)
      localStorage.removeItem(LOCAL_AUTH_SESSION_KEY)
      return undefined
    }

    return signOut(auth)
  }

  const value = useMemo(
    () => ({ user, authLoading, login, logout }),
    [user, authLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }

  return context
}