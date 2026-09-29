export function ProductTable({ products, onEdit, onDelete, onToggleAvailability }) {
  if (products.length === 0) {
    return <p>No hay productos cargados.</p>
  }

  return (
    <section className="admin-list">
      <h3>Productos cargados</h3>
      <div className="admin-items">
        {products.map((product) => (
          <article key={product.id} className="admin-item">
            {product.image ? (
              <img src={product.image} alt={product.title} />
            ) : (
              <div className="image-placeholder" aria-hidden="true" />
            )}
            <div>
              <h4>{product.title}</h4>
              <p>{product.description}</p>
              <p>
                {product.hasPattyOptions
                  ? `Desde $${product.pattyPrices[1].toFixed(2)} (1 a 3 carnes)`
                  : `$${product.price.toFixed(2)}`} | {product.category}
              </p>
              <p className={product.available === false ? 'product-status is-hidden' : 'product-status'}>
                {product.available === false ? 'Oculto' : 'Disponible'}
              </p>
            </div>

            <div className="admin-actions">
              <button type="button" onClick={() => onEdit(product)}>
                Editar
              </button>
              <button type="button" onClick={() => onDelete(product.id)}>
                Eliminar
              </button>
              <button type="button" onClick={() => onToggleAvailability(product)}>
                {product.available === false ? 'Mostrar' : 'Ocultar'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}