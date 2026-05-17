import { useMemo, useState } from 'react'
import { useProducts } from '../context/ProductsContext'
import { CategoryNav } from './CategoryNav'
import { ProductGrid } from './ProductGrid'
import { useSearch } from '../context/SearchContext'
import { useSiteSettings } from '../context/SiteSettingsContext'

export function MenuPage() {
  const { products } = useProducts()
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const { query: searchQuery, setQuery } = useSearch()
  const { settings } = useSiteSettings()

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'todos') {
      // apply search filtering if present
      if (!searchQuery || !searchQuery.trim()) return products
      const q = searchQuery.trim().toLowerCase()
      return products.filter((p) =>
        (p.title + ' ' + (p.description || '') + ' ' + p.category).toLowerCase().includes(q)
      )
    }

    const byCategory = products.filter((product) => product.category === selectedCategory)
    if (!searchQuery || !searchQuery.trim()) return byCategory
    const q = searchQuery.trim().toLowerCase()
    return byCategory.filter((p) =>
      (p.title + ' ' + (p.description || '') + ' ' + p.category).toLowerCase().includes(q)
    )
  }, [products, selectedCategory, searchQuery])

  return (
    <section className="menu-page">
      <div className="menu-page-header">
        <h2>Nuestro menu</h2>
        <input
          className="menu-search"
          placeholder="Buscar por producto, ingrediente o categoría..."
          value={searchQuery}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar productos"
        />
      </div>
      <div className="menu-page-content">
        <CategoryNav
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        <ProductGrid
          products={filteredProducts}
          contactPhone={settings.contact.phone}
          contactWhatsappLink={settings.contact.whatsappLink}
        />
      </div>
    </section>
  )
}