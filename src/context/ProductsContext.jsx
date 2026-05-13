import { createContext, useContext, useMemo, useState } from 'react'
import { initialProducts } from '../data/initialProducts'

const STORAGE_KEY = 'prime-burger-products'

const ProductsContext = createContext(null)

function getSavedProducts() {
  const raw = localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return initialProducts
  }

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : initialProducts
  } catch {
    return initialProducts
  }
}

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function normalizeProduct(product) {
  return {
    id: product.id ?? generateId(),
    title: product.title.trim(),
    description: product.description.trim(),
    price: Number(product.price),
    image: product.image.trim(),
    category: product.category,
  }
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(getSavedProducts)

  function syncStorage(nextProducts) {
    setProducts(nextProducts)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProducts))
  }

  function addProduct(product) {
    const nextProducts = [...products, normalizeProduct(product)]
    syncStorage(nextProducts)
  }

  function updateProduct(updatedProduct) {
    const normalized = normalizeProduct(updatedProduct)
    const nextProducts = products.map((product) =>
      product.id === normalized.id ? normalized : product,
    )
    syncStorage(nextProducts)
  }

  function deleteProduct(productId) {
    const nextProducts = products.filter((product) => product.id !== productId)
    syncStorage(nextProducts)
  }

  const value = useMemo(
    () => ({ products, addProduct, updateProduct, deleteProduct }),
    [products],
  )

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts() {
  const context = useContext(ProductsContext)

  if (!context) {
    throw new Error('useProducts debe usarse dentro de ProductsProvider')
  }

  return context
}