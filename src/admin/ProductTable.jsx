export function ProductTable({ products, onEdit, onDelete }) {
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
                ${product.price.toFixed(2)} | {product.category}
              </p>
            </div>

            <div className="admin-actions">
              <button type="button" onClick={() => onEdit(product)}>
                Editar
              </button>
              <button type="button" onClick={() => onDelete(product.id)}>
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}