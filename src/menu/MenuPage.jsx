import { useMemo, useState } from 'react'
import { useProducts } from '../context/ProductsContext'
import { CategoryNav } from './CategoryNav'
import { ProductGrid } from './ProductGrid'
import { useSearch } from '../context/SearchContext'

export function MenuPage() {
  const { products } = useProducts()
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const { query: searchQuery } = useSearch()

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
      </div>
      <div className="menu-page-content">
        <CategoryNav
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        <ProductGrid products={filteredProducts} />
      </div>
    </section>
  )
}