import { useState } from 'react'
import { useProducts } from '../context/ProductsContext'
import { useAuth } from '../context/AuthContext'
import { useCategories } from '../context/CategoriesContext'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { isFirebaseConfigured } from '../firebase/config'
import { ProductForm } from './ProductForm'
import { ProductTable } from './ProductTable'
import { ContactSettingsForm } from './ContactSettingsForm'
import { CategoryForm } from './CategoryForm'
import { CategoryList } from './CategoryList'

export function AdminPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts()
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories()
  const { settings, updateContact } = useSiteSettings()
  const { logout } = useAuth()
  const [editingProduct, setEditingProduct] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)
  const [activeTab, setActiveTab] = useState('productos')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  async function handleSave(formProduct) {
    if (editingProduct) {
      await updateProduct({ ...formProduct, id: editingProduct.id, createdAt: editingProduct.createdAt })
      setEditingProduct(null)
      return
    }

    await addProduct(formProduct)
  }

  function handleEdit(product) {
    setEditingProduct(product)
  }

  function handleDeleteProduct(productId) {
    setDeleteConfirm({ type: 'product', id: productId })
  }

  function confirmDeleteProduct() {
    if (deleteConfirm?.type === 'product') {
      deleteProduct(deleteConfirm.id)

      if (editingProduct?.id === deleteConfirm.id) {
        setEditingProduct(null)
      }

      setDeleteConfirm(null)
    }
  }

  function handleCancelEdit() {
    setEditingProduct(null)
  }

  async function handleSaveCategory(formCategory) {
    if (editingCategory) {
      await updateCategory({ ...formCategory, id: editingCategory.id, createdAt: editingCategory.createdAt })
      setEditingCategory(null)
      return
    }

    await addCategory(formCategory)
  }

  function handleEditCategory(category) {
    setEditingCategory(category)
  }

  function handleDeleteCategory(categoryId) {
    setDeleteConfirm({ type: 'category', id: categoryId })
  }

  function confirmDeleteCategory() {
    if (deleteConfirm?.type === 'category') {
      deleteCategory(deleteConfirm.id)

      if (editingCategory?.id === deleteConfirm.id) {
        setEditingCategory(null)
      }

      setDeleteConfirm(null)
    }
  }

  function handleCancelCategoryEdit() {
    setEditingCategory(null)
  }

  return (
    <section className="admin-page">
      <div className="admin-header">
        <h2>Admin de productos</h2>
        <button type="button" onClick={logout}>
          Cerrar sesion
        </button>
      </div>
      <p>Desde aqui puedes agregar, editar y eliminar productos del menu.</p>
      <p className="form-success" style={{ marginBottom: '1rem' }}>
        {isFirebaseConfigured
          ? 'Firebase activo: los cambios deberian guardarse en la base de datos.'
          : 'Modo local activo: los cambios solo se guardan en este navegador hasta configurar Firebase.'}
      </p>

      <nav className="admin-tabs">
        <button
          type="button"
          className={activeTab === 'productos' ? 'active' : ''}
          onClick={() => setActiveTab('productos')}
        >
          Productos
        </button>
        <button
          type="button"
          className={activeTab === 'categorias' ? 'active' : ''}
          onClick={() => setActiveTab('categorias')}
        >
          Categorias
        </button>
        <button
          type="button"
          className={activeTab === 'contacto' ? 'active' : ''}
          onClick={() => setActiveTab('contacto')}
        >
          Contacto
        </button>
      </nav>

      {activeTab === 'productos' ? (
        <div className="admin-sections">
          <section>
            <ProductForm
              editingProduct={editingProduct}
              onSave={handleSave}
              onCancel={handleCancelEdit}
            />
          </section>

          <section>
            <ProductTable
              products={products}
              onEdit={handleEdit}
              onDelete={handleDeleteProduct}
            />
          </section>
        </div>
      ) : null}

      {activeTab === 'categorias' ? (
        <div className="admin-sections">
          <section>
            <CategoryForm
              editingCategory={editingCategory}
              onSave={handleSaveCategory}
              onCancel={handleCancelCategoryEdit}
            />
          </section>

          <section>
            <CategoryList
              categories={categories}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
          </section>
        </div>
      ) : null}

      {activeTab === 'contacto' ? (
        <div className="admin-sections">
          <section className="admin-contact-settings">
            <ContactSettingsForm contact={settings.contact} onSave={updateContact} />
          </section>
        </div>
      ) : null}

      {deleteConfirm ? (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <h3>Confirmar eliminacion</h3>
            <p>
              {deleteConfirm.type === 'product'
                ? 'Estas seguro de que quieres eliminar este producto?'
                : 'Estas seguro de que quieres eliminar esta categoria?'}
            </p>
            <div className="delete-confirm-actions">
              <button
                type="button"
                className="btn-confirm"
                onClick={deleteConfirm.type === 'product' ? confirmDeleteProduct : confirmDeleteCategory}
              >
                Eliminar
              </button>
              <button type="button" className="btn-cancel" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}