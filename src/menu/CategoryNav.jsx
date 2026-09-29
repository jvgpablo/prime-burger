import { useCategories } from '../context/CategoriesContext'

export function CategoryNav({ selectedCategory, onSelectCategory }) {
  const { categories } = useCategories()
  return (
    <nav className="category-nav" aria-label="Categorias de productos">
      <button
        type="button"
        className={selectedCategory === 'todos' ? 'active' : ''}
        onClick={() => onSelectCategory('todos')}
      >
        Todos
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          className={selectedCategory === category.name ? 'active' : ''}
          onClick={() => onSelectCategory(category.name)}
        >
          {category.name}
        </button>
      ))}
    </nav>
  )
}