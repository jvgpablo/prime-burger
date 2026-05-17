import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { productCategories as initialCategories } from '../data/initialProducts'
import { isFirebaseConfigured } from '../firebase/config'
import {
  createCategory,
  deleteCategory,
  subscribeToCategories,
  updateCategory,
} from '../services/firestore.service'

const CategoriesContext = createContext(null)

function normalizeCategory(category) {
  return {
    id: category.id,
    name: category.name.trim(),
  }
}

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState(initialCategories)

  useEffect(() => {
    let unsubscribe = () => {}
    let isActive = true

    subscribeToCategories((nextCategories) => {
      if (isActive) {
        setCategories(nextCategories)
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
        console.error('No se pudieron cargar las categorias.', error)
      })

    return () => {
      isActive = false
      unsubscribe()
    }
  }, [])

  async function addCategory(category) {
    const normalized = normalizeCategory(category)

    if (categories.some((c) => c.name.toLowerCase() === normalized.name.toLowerCase())) {
      throw new Error('Esta categoria ya existe.')
    }

    const createdCategory = await createCategory(normalized)

    if (!isFirebaseConfigured) {
      setCategories((prev) => [...prev, createdCategory])
    }
  }

  async function updateExistingCategory(updatedCategory) {
    const normalized = normalizeCategory(updatedCategory)

    if (categories.some((c) => c.id !== updatedCategory.id && c.name.toLowerCase() === normalized.name.toLowerCase())) {
      throw new Error('Ya existe una categoria con este nombre.')
    }

    const nextCategory = await updateCategory(updatedCategory)

    if (!isFirebaseConfigured) {
      setCategories((prev) => prev.map((category) => (category.id === nextCategory.id ? nextCategory : category)))
    }
  }

  async function removeCategory(categoryId) {
    await deleteCategory(categoryId)

    if (!isFirebaseConfigured) {
      setCategories((prev) => prev.filter((category) => category.id !== categoryId))
    }
  }

  const value = useMemo(
    () => ({ categories, addCategory, updateCategory: updateExistingCategory, deleteCategory: removeCategory }),
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
