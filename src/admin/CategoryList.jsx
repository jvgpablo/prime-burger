export function CategoryList({ categories, onEdit, onDelete }) {
  if (categories.length === 0) {
    return <p>No hay categorias cargadas.</p>
  }

  return (
    <section className="admin-list">
      <h3>Categorias cargadas</h3>
      <div className="admin-items">
        {categories.map((category) => (
          <article key={category.id} className="admin-category-item">
            <div>
              <h4>{category.name}</h4>
            </div>

            <div className="admin-actions">
              <button type="button" onClick={() => onEdit(category)}>
                Editar
              </button>
              <button type="button" onClick={() => onDelete(category.id)}>
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
