import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { initialProducts } from '../data/initialProducts'
import { isFirebaseConfigured } from '../firebase/config'
import { createProduct, deleteProduct, subscribeToProducts, updateProduct } from '../services/firestore.service'

const ProductsContext = createContext(null)

function normalizeProduct(product) {
  return {
    title: product.title.trim(),
    description: product.description.trim(),
    price: Number(product.price),
    image: product.image.trim(),
    category: product.category,
  }
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(initialProducts)

  useEffect(() => {
    let unsubscribe = () => {}
    let isActive = true

    subscribeToProducts((nextProducts) => {
      if (isActive) {
        setProducts(nextProducts)
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
        console.error('No se pudieron cargar los productos.', error)
      })

    return () => {
      isActive = false
      unsubscribe()
    }
  }, [])

  async function addProduct(product) {
    const createdProduct = await createProduct(normalizeProduct(product))

    if (!isFirebaseConfigured) {
      setProducts((prev) => [...prev, createdProduct])
    }
  }

  async function updateExistingProduct(updatedProduct) {
    const nextProduct = await updateProduct(updatedProduct)

    if (!isFirebaseConfigured) {
      setProducts((prev) => prev.map((product) => (product.id === nextProduct.id ? nextProduct : product)))
    }
  }

  async function removeProduct(productId) {
    await deleteProduct(productId)

    if (!isFirebaseConfigured) {
      setProducts((prev) => prev.filter((product) => product.id !== productId))
    }
  }

  const value = useMemo(
    () => ({ products, addProduct, updateProduct: updateExistingProduct, deleteProduct: removeProduct }),
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