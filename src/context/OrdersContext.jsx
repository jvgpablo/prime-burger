import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { isFirebaseConfigured } from '../firebase/config'
import { addOrder as createOrder, subscribeToOrders } from '../services/firestore.service'

const OrdersContext = createContext(null)

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    let unsubscribe = () => {}
    let isActive = true

    subscribeToOrders((nextOrders) => {
      if (isActive) {
        setOrders(nextOrders)
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
        console.error('No se pudieron cargar las ventas.', error)
      })

    return () => {
      isActive = false
      unsubscribe()
    }
  }, [])

  async function addOrder(order) {
    const createdOrder = await createOrder(order)

    if (!isFirebaseConfigured) {
      setOrders((prev) => [createdOrder, ...prev])
    }

    return createdOrder
  }

  const value = useMemo(() => ({ orders, addOrder }), [orders])

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}

export function useOrders() {
  const context = useContext(OrdersContext)

  if (!context) {
    throw new Error('useOrders debe usarse dentro de OrdersProvider')
  }

  return context
}