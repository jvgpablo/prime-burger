import { useState } from 'react'

function normalizeUrl(value) {
  const trimmed = (value || '').trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function ProductCard({ product, contactPhone, contactWhatsappLink }) {
  const phone = contactPhone || 'el numero asociado en contacto'
  const whatsappUrl = normalizeUrl(contactWhatsappLink)
  const hasWhatsappLink = Boolean(whatsappUrl)
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpanded = () => setIsExpanded((prev) => !prev)

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleExpanded()
    }
  }

  return (
    <article
      className={`product-card product-card--list ${isExpanded ? 'is-expanded' : ''}`}
      onClick={toggleExpanded}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
    >
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
        <p className="product-order-note">
          Para agendar tu pedido escribenos al{' '}
          {hasWhatsappLink ? (
            <a
              className="product-order-note-link"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
            >
              {phone}
            </a>
          ) : (
            phone
          )}
          .
        </p>
      </div>

      <div className="product-card-meta">
        <strong>${product.price.toFixed(2)}</strong>
      </div>
    </article>
  )
}