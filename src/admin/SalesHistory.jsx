import { useState } from 'react'
import { useOrders } from '../context/OrdersContext'

const monthFormatter = new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' })
const dayFormatter = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' })
const timeFormatter = new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit' })

function getDateKey(value) {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getMonthKey(value) {
  return getDateKey(value).slice(0, 7)
}

function groupOrdersByMonthAndDay(orders) {
  const months = new Map()

  orders
    .slice()
    .sort((left, right) => right.createdAt - left.createdAt)
    .forEach((order) => {
      const date = new Date(order.createdAt)
      const monthKey = getMonthKey(order.createdAt)
      const dayKey = getDateKey(order.createdAt)

      if (!months.has(monthKey)) {
        months.set(monthKey, {
          key: monthKey,
          label: monthFormatter.format(date),
          total: 0,
          days: new Map(),
        })
      }

      const month = months.get(monthKey)
      if (!month.days.has(dayKey)) {
        month.days.set(dayKey, {
          key: dayKey,
          label: dayFormatter.format(date),
          subtotal: 0,
          orders: [],
        })
      }

      const day = month.days.get(dayKey)
      day.orders.push(order)
      day.subtotal += order.total
      month.total += order.total
    })

  return Array.from(months.values()).map((month) => ({
    ...month,
    days: Array.from(month.days.values()),
  }))
}

function formatTime(value) {
  return timeFormatter.format(new Date(value))
}

function formatMonthLabel(value) {
  const label = value.charAt(0).toUpperCase() + value.slice(1)
  return label
}

function formatDayLabel(value) {
  const label = value.charAt(0).toUpperCase() + value.slice(1)
  return label
}

function getDaySummary(day) {
  const productTotals = new Map()

  day.orders.forEach((order) => {
    order.items.forEach((item) => {
      productTotals.set(item.title, (productTotals.get(item.title) || 0) + item.quantity)
    })
  })

  const topProduct = Array.from(productTotals.entries()).sort((left, right) => right[1] - left[1])[0]

  return {
    total: day.subtotal,
    orderCount: day.orders.length,
    topProduct: topProduct ? `${topProduct[0]} (${topProduct[1]})` : 'Sin productos',
  }
}

export function SalesHistory() {
  const { orders } = useOrders()
  const [activeDaysByMonth, setActiveDaysByMonth] = useState({})
  const [currentDayKey] = useState(() => getDateKey(Date.now()))
  const groupedOrders = groupOrdersByMonthAndDay(orders)

  return (
    <section className="admin-list sales-history">
      <h3>Historial de ventas</h3>
      {orders.length === 0 ? <p>No hay ventas registradas.</p> : null}
      <div className="admin-items sales-history-groups">
        {groupedOrders.map((month) => (
          <details className="sales-month-group" key={month.key} open={month.key === currentDayKey.slice(0, 7)}>
            <summary>
              <span>{formatMonthLabel(month.label)}</span>
              <strong>
                {month.days.reduce((count, day) => count + day.orders.length, 0)} ventas · ${month.total.toFixed(2)}
              </strong>
            </summary>
            <div className="sales-day-groups">
              {month.days.map((day) => {
                const defaultDayKey = month.key === currentDayKey.slice(0, 7) && day.key === currentDayKey
                const activeDayKey = activeDaysByMonth[month.key] ?? (defaultDayKey ? day.key : '')
                const isOpen = activeDayKey === day.key
                const daySummary = getDaySummary(day)

                return (
                  <section className={`sales-day-group ${isOpen ? 'is-open' : ''}`} key={day.key}>
                    <button
                      type="button"
                      className="sales-day-header"
                      aria-expanded={isOpen}
                      onClick={() => setActiveDaysByMonth((prev) => ({ ...prev, [month.key]: isOpen ? '' : day.key }))}
                    >
                      <span>
                        <strong>{formatDayLabel(day.label)}</strong>
                        <small>{day.orders.length} venta{day.orders.length === 1 ? '' : 's'}</small>
                      </span>
                      <strong>Subtotal: ${day.subtotal.toFixed(2)}</strong>
                    </button>
                    {isOpen ? (
                      <div className="sales-day-content">
                        <div className="sales-day-summary">
                          <span>Total del dia: ${daySummary.total.toFixed(2)}</span>
                          <span>{daySummary.orderCount} ventas</span>
                          <span>Mas vendido: {daySummary.topProduct}</span>
                        </div>
                        <div className="admin-items">
                          {day.orders.map((order) => (
                            <article className="sales-order" key={order.id}>
                              <div className="sales-order-header">
                                <div>
                                  <h4>{order.customer || 'Venta sin cliente'}</h4>
                                  <p>{formatTime(order.createdAt)} · {order.paymentMethod}</p>
                                </div>
                                <strong>{`$${order.total.toFixed(2)}`}</strong>
                              </div>
                              <ul>
                                {order.items.map((item) => (
                                  <li key={`${order.id}-${item.productId}`}>
                                    {item.quantity} x {item.title} ({`$${item.unitPrice.toFixed(2)}`})
                                  </li>
                                ))}
                              </ul>
                              {order.note ? <p className="sales-order-note">Nota: {order.note}</p> : null}
                            </article>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </section>
                )
              })}
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}