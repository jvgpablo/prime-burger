import { ProductCard } from './ProductCard'

export function ProductGrid({ products, contactPhone, contactWhatsappLink }) {
  if (products.length === 0) {
    return <p>No hay productos para esta categoria.</p>
  }

  return (
    <section className="products-list">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          contactPhone={contactPhone}
          contactWhatsappLink={contactWhatsappLink}
        />
      ))}
    </section>
  )
}