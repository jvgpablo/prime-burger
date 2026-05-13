export function ProductCard({ product }) {
  return (
    <article className="product-card product-card--list">
      <div className="product-card-media">
        {product.image ? (
          <img src={product.image} alt={product.title} />
        ) : (
          <div className="image-placeholder" aria-hidden="true" />
        )}
      </div>

      <div className="product-card-body">
        <h3>{product.title}</h3>
        <p>{product.description}</p>
      </div>

      <div className="product-card-meta">
        <strong>${product.price.toFixed(2)}</strong>
      </div>
    </article>
  )
}