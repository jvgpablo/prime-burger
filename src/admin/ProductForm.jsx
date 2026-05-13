import { useEffect, useState } from 'react'
import { useCategories } from '../context/CategoriesContext'
import {
  uploadImageToCloudinary,
  isValidImageFile,
  isValidFileSize,
} from '../services/cloudinary.service'
import { CLOUDINARY_CONFIG } from '../services/cloudinary.config'

const emptyForm = {
  title: '',
  description: '',
  price: '',
  image: '',
  category: 'hamburguesas',
}

export function ProductForm({ editingProduct, onSave, onCancel }) {
  const { categories } = useCategories()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState('')

  function isValidUrl(value) {
    try {
      const parsed = new URL(value)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
      return false
    }
  }

  useEffect(() => {
    if (editingProduct) {
      setForm({
        ...editingProduct,
        price: editingProduct.price,
      })
      return
    }

    const firstCategory = categories.length > 0 ? categories[0].name : ''
    setForm((prev) => ({ ...prev, category: firstCategory }))
  }, [editingProduct, categories])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  async function handleFileChange(event) {
    const file = event.target.files && event.target.files[0]
    if (!file) return

    if (!isValidImageFile(file)) {
      setErrors((prev) => ({ ...prev, image: 'Formato no válido (usar jpg/png/webp/gif).' }))
      return
    }

    if (!isValidFileSize(file, 5)) {
      setErrors((prev) => ({ ...prev, image: 'Archivo muy grande. Máx 5MB.' }))
      return
    }

    // preview local
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    // subir a cloudinary
    setUploading(true)
    try {
      const url = await uploadImageToCloudinary(file, CLOUDINARY_CONFIG.defaultFolder)
      setForm((prev) => ({ ...prev, image: url }))
      setErrors((prev) => ({ ...prev, image: '' }))
    } catch (err) {
      setErrors((prev) => ({ ...prev, image: 'Error subiendo imagen.' }))
      console.error(err)
    } finally {
      setUploading(false)
      URL.revokeObjectURL(objectUrl)
      setPreview('')
    }
  }

  function validate() {
    const nextErrors = {}

    if (!form.title.trim()) {
      nextErrors.title = 'El titulo es obligatorio.'
    } else if (form.title.trim().length < 3) {
      nextErrors.title = 'El titulo debe tener minimo 3 caracteres.'
    }

    if (!form.description.trim()) {
      nextErrors.description = 'La descripcion es obligatoria.'
    } else if (form.description.trim().length < 10) {
      nextErrors.description = 'La descripcion debe tener minimo 10 caracteres.'
    }

    const parsedPrice = Number(form.price)
    if (!form.price) {
      nextErrors.price = 'El precio es obligatorio.'
    } else if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      nextErrors.price = 'El precio debe ser un numero mayor a 0.'
    }

    // La URL de imagen es opcional (se puede subir archivo). Solo validar si se proporciona
    if (form.image && form.image.trim()) {
      if (!isValidUrl(form.image.trim())) {
        nextErrors.image = 'Ingresa una URL valida (http o https).'
      }
    }

    if (!categories.some((c) => c.name === form.category)) {
      nextErrors.category = 'Selecciona una categoria valida.'
    }

    return nextErrors
  }

  function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    onSave(form)

    if (!editingProduct) {
      setForm(emptyForm)
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit} noValidate>
      <h3>{editingProduct ? 'Editar producto' : 'Nuevo producto'}</h3>

      <label>
        Titulo
        <input name="title" value={form.title} onChange={handleChange} />
        {errors.title ? <span className="field-error">{errors.title}</span> : null}
      </label>

      <label>
        Descripcion
        <textarea name="description" value={form.description} onChange={handleChange} />
        {errors.description ? <span className="field-error">{errors.description}</span> : null}
      </label>

      <label>
        Precio
        <input
          type="number"
          min="0"
          step="0.01"
          name="price"
          value={form.price}
          onChange={handleChange}
        />
        {errors.price ? <span className="field-error">{errors.price}</span> : null}
      </label>

      <label>
        URL de imagen
        <input name="image" value={form.image} onChange={handleChange} placeholder="http://... o usar subir archivo" />
        {errors.image ? <span className="field-error">{errors.image}</span> : null}
      </label>

      <label>
        Subir imagen (JPG/PNG/WebP, max 5MB)
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {uploading ? <p>Cargando imagen...</p> : null}
      </label>

      {form.image ? (
        <div style={{ margin: '0.6rem 0' }}>
          <strong>Preview:</strong>
          <div style={{ marginTop: 8 }}>
            <img src={form.image} alt="preview" style={{ maxWidth: 240, borderRadius: 6, border: '2px solid #252322' }} />
          </div>
        </div>
      ) : null}

      <label>
        Categoria
        <select name="category" value={form.category} onChange={handleChange}>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.category ? <span className="field-error">{errors.category}</span> : null}
      </label>

      <div className="admin-actions">
        <button type="submit">{editingProduct ? 'Guardar cambios' : 'Agregar producto'}</button>
        {editingProduct ? (
          <button type="button" onClick={onCancel}>
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  )
}