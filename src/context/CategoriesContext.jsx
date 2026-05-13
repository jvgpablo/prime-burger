import { createContext, useContext, useMemo, useState } from 'react'
import { productCategories as initialCategories } from '../data/initialProducts'

const STORAGE_KEY = 'prime-burger-categories'

const CategoriesContext = createContext(null)

function getSavedCategories() {
  const raw = localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return initialCategories
  }

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialCategories
  } catch {
    return initialCategories
  }
}

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function normalizeCategory(category) {
  return {
    id: category.id ?? generateId(),
    name: category.name.trim(),
  }
}

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState(getSavedCategories)

  function syncStorage(nextCategories) {
    setCategories(nextCategories)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCategories))
  }

  function addCategory(category) {
    const normalized = normalizeCategory(category)

    if (categories.some((c) => c.name.toLowerCase() === normalized.name.toLowerCase())) {
      throw new Error('Esta categoria ya existe.')
    }

    const nextCategories = [...categories, normalized]
    syncStorage(nextCategories)
  }

  function updateCategory(updatedCategory) {
    const normalized = normalizeCategory(updatedCategory)

    if (categories.some((c) => c.id !== normalized.id && c.name.toLowerCase() === normalized.name.toLowerCase())) {
      throw new Error('Ya existe una categoria con este nombre.')
    }

    const nextCategories = categories.map((category) =>
      category.id === normalized.id ? normalized : category,
    )
    syncStorage(nextCategories)
  }

  function deleteCategory(categoryId) {
    const nextCategories = categories.filter((category) => category.id !== categoryId)
    syncStorage(nextCategories)
  }

  const value = useMemo(
    () => ({ categories, addCategory, updateCategory, deleteCategory }),
    [categories],
  )

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>
}

export function useCategories() {
  const context = useContext(CategoriesContext)

  if (!context) {
    throw new Error('useCategories debe usarse dentro de CategoriesProvider')
  }

  return context
}
