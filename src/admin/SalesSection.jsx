import { useMemo, useState } from 'react'
import { useProducts } from '../context/ProductsContext'
import { useOrders } from '../context/OrdersContext'

const emptyForm = { customer: '', note: '', paymentMethod: 'efectivo' }

function formatPrice(value) {
  return `$${value.toFixed(2)}`
}

export function SalesSection() {
  const { products } = useProducts()
  const { addOrder } = useOrders()
  const [quantities, setQuantities] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const selectedItems = useMemo(
    () => products
      .filter((product) => quantities[product.id] > 0)
      .map((product) => ({
        productId: product.id,
        title: product.title,
        quantity: quantities[product.id],
        unitPrice: Number(product.price),
      })),
    [products, quantities],
  )

  const visibleProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return products

    return products.filter((product) =>
      `${product.title} ${product.category || ''}`.toLowerCase().includes(query),
    )
  }, [products, searchQuery])

  const total = selectedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  function handleQuantityChange(productId, value) {
    const quantity = Math.max(0, Math.min(99, Number(value) || 0))
    setQuantities((prev) => ({ ...prev, [productId]: quantity }))
    setMessage('')
    setError('')
  }

  function handleFormChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setMessage('')
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setError('')

    if (selectedItems.length === 0) {
      setError('Selecciona al menos un producto.')
      return
    }

    try {
      setIsSubmitting(true)
      await addOrder({ ...form, items: selectedItems, total })
      setQuantities({})
      setForm(emptyForm)
      setMessage('Venta registrada correctamente.')
    } catch (submitError) {
      setError(submitError?.message || 'No se pudo registrar la venta.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="admin-list sales-section">
      <h3>Registrar venta</h3>
      <form className="sales-form" onSubmit={handleSubmit}>
        <label className="sales-search">
          Buscar producto
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Buscar por nombre o categoria..."
          />
        </label>
        <div className="sales-products">
          {products.length === 0 ? <p>No hay productos cargados.</p> : null}
          {products.length > 0 && visibleProducts.length === 0 ? <p>No se encontraron productos.</p> : null}
          {visibleProducts.map((product) => {
            const quantity = quantities[product.id] || 0
            return (
              <label className={`sales-product ${quantity > 0 ? 'is-selected' : ''}`} key={product.id}>
                <input
                  type="checkbox"
                  checked={quantity > 0}
                  onChange={(event) => handleQuantityChange(product.id, event.target.checked ? 1 : 0)}
                />
                <span className="sales-product-info">
                  <strong>{product.title}</strong>
                  <span>{formatPrice(Number(product.price))}</span>
                </span>
                <input
                  className="sales-quantity"
                  type="number"
                  min="1"
                  max="99"
                  value={quantity || ''}
                  placeholder="0"
                  onChange={(event) => handleQuantityChange(product.id, event.target.value)}
                  aria-label={`Cantidad de ${product.title}`}
                />
              </label>
            )
          })}
        </div>

        <div className="sales-extra-fields">
          <label>
            Cliente (opcional)
            <input name="customer" value={form.customer} onChange={handleFormChange} />
          </label>
          <label>
            Nota (opcional)
            <textarea name="note" value={form.note} onChange={handleFormChange} rows="3" />
          </label>
          <label>
            Metodo de pago
            <select name="paymentMethod" value={form.paymentMethod} onChange={handleFormChange}>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </label>
        </div>

        <div className="sales-submit-bar">
          <div className="sales-total">
            <span>{selectedItems.length} productos seleccionados</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          {message ? <p className="form-success">{message}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}
          <div className="admin-actions">
            <button type="submit" disabled={isSubmitting || products.length === 0}>
              {isSubmitting ? 'Registrando...' : 'Registrar venta'}
            </button>
          </div>
        </div>
      </form>
    </section>
  )
}