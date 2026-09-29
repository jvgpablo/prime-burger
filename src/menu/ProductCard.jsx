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
  const [selectedPatties, setSelectedPatties] = useState(1)
  const [isPattyMenuOpen, setIsPattyMenuOpen] = useState(false)
  const [priceAnimationKey, setPriceAnimationKey] = useState(0)

  const toggleExpanded = () => setIsExpanded((prev) => !prev)

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleExpanded()
    }
  }

  function handlePattyMenuToggle(event) {
    event.stopPropagation()
    setIsPattyMenuOpen((prev) => !prev)
  }

  function handlePattySelect(event, pattyCount) {
    event.stopPropagation()
    setSelectedPatties(pattyCount)
    setIsPattyMenuOpen(false)
    setPriceAnimationKey((prev) => prev + 1)
  }

  function handlePattyKeyDown(event) {
    event.stopPropagation()
  }

  return (
    <article
      className={`product-card product-card--list ${isExpanded ? 'is-expanded' : ''} ${isPattyMenuOpen ? 'patty-menu-open' : ''}`}
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

      <div className={`product-card-meta ${product.hasPattyOptions ? 'product-card-meta--variable' : ''}`}>
        {product.hasPattyOptions ? (
          <>
            <div className="patty-selector" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                className="patty-selector-trigger"
                aria-expanded={isPattyMenuOpen}
                onClick={handlePattyMenuToggle}
                onKeyDown={handlePattyKeyDown}
              >
                {selectedPatties} carne{selectedPatties === 1 ? '' : 's'} <span aria-hidden="true">▾</span>
              </button>
              <div className={`patty-selector-menu ${isPattyMenuOpen ? 'is-open' : ''}`}>
                {[1, 2, 3].map((pattyCount) => (
                  <button
                    type="button"
                    className={selectedPatties === pattyCount ? 'is-selected' : ''}
                    key={pattyCount}
                    onClick={(event) => handlePattySelect(event, pattyCount)}
                    onKeyDown={handlePattyKeyDown}
                    tabIndex={isPattyMenuOpen ? 0 : -1}
                  >
                    {pattyCount} carne{pattyCount === 1 ? '' : 's'}
                  </button>
                ))}
              </div>
            </div>
            <strong className="product-price product-price--animated" key={priceAnimationKey}>
              ${(product.pattyPrices?.[selectedPatties] ?? product.price).toFixed(2)}
            </strong>
          </>
        ) : (
          <strong>${product.price.toFixed(2)}</strong>
        )}
      </div>
    </article>
  )
}