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
  available: true,
  hasPattyOptions: false,
  pattyPrices: { 1: '', 2: '', 3: '' },
}

export function ProductForm({ editingProduct, onSave, onCancel, titleId }) {
  const { categories } = useCategories()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState('')
  const [successTimeoutId, setSuccessTimeoutId] = useState(null)

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
        hasPattyOptions: editingProduct.hasPattyOptions === true,
        pattyPrices: {
          1: editingProduct.pattyPrices?.[1] ?? editingProduct.price,
          2: editingProduct.pattyPrices?.[2] ?? editingProduct.price,
          3: editingProduct.pattyPrices?.[3] ?? editingProduct.price,
        },
      })
      return
    }

    const firstCategory = categories.length > 0 ? categories[0].name : ''
    setForm((prev) => ({ ...prev, category: firstCategory }))
  }, [editingProduct, categories])

  function handleChange(event) {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setSubmitError('')
    setSubmitSuccess('')
  }

  function handlePattyPriceChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({
      ...prev,
      pattyPrices: { ...prev.pattyPrices, [name]: value },
    }))
    setErrors((prev) => ({ ...prev, pattyPrices: '' }))
    setSubmitError('')
    setSubmitSuccess('')
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

    if (form.hasPattyOptions) {
      const hasInvalidPattyPrice = [1, 2, 3].some((pattyCount) => {
        const value = form.pattyPrices?.[pattyCount]
        return !value || Number.isNaN(Number(value)) || Number(value) <= 0
      })

      if (hasInvalidPattyPrice) {
        nextErrors.pattyPrices = 'Ingresa un precio mayor a 0 para cada cantidad de carnes.'
      }
    } else {
      const parsedPrice = Number(form.price)
      if (!form.price) {
        nextErrors.price = 'El precio es obligatorio.'
      } else if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
        nextErrors.price = 'El precio debe ser un numero mayor a 0.'
      }
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

  async function handleSubmit(event) {
    event.preventDefault()

    if (successTimeoutId) {
      clearTimeout(successTimeoutId)
      setSuccessTimeoutId(null)
    }

    const nextErrors = validate()
    setErrors(nextErrors)
    setSubmitError('')
    setSubmitSuccess('')

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    try {
      setIsSubmitting(true)
      const formProduct = form.hasPattyOptions
        ? {
            ...form,
            price: Number(form.pattyPrices[1]),
            pattyPrices: {
              1: Number(form.pattyPrices[1]),
              2: Number(form.pattyPrices[2]),
              3: Number(form.pattyPrices[3]),
            },
          }
        : {
            ...form,
            hasPattyOptions: false,
            pattyPrices: { 1: '', 2: '', 3: '' },
          }

      await onSave(formProduct)

      if (!editingProduct) {
        setForm(emptyForm)
      }

      setSubmitSuccess(editingProduct ? 'Producto actualizado correctamente.' : 'Producto agregado correctamente.')
      const timeoutId = setTimeout(() => {
        setSubmitSuccess('')
        setSuccessTimeoutId(null)
      }, 2500)
      setSuccessTimeoutId(timeoutId)
    } catch (error) {
      setSubmitError(error?.message || 'No se pudo guardar el producto.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit} noValidate>
      <h3 id={titleId}>{editingProduct ? 'Editar producto' : 'Nuevo producto'}</h3>

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

      <label className="product-variable-price-toggle">
        <input type="checkbox" name="hasPattyOptions" checked={form.hasPattyOptions} onChange={handleChange} />
        Precio variable por numero de carnes (smash)
      </label>

      {form.hasPattyOptions ? (
        <div className="patty-price-fields">
          {[1, 2, 3].map((pattyCount) => (
            <label key={pattyCount}>
              Precio con {pattyCount} carne{pattyCount === 1 ? '' : 's'}
              <input
                type="number"
                min="0"
                step="0.01"
                name={String(pattyCount)}
                value={form.pattyPrices?.[pattyCount] ?? ''}
                onChange={handlePattyPriceChange}
              />
            </label>
          ))}
          {errors.pattyPrices ? <span className="field-error">{errors.pattyPrices}</span> : null}
        </div>
      ) : (
        <label>
          Precio
          <input type="number" min="0" step="0.01" name="price" value={form.price} onChange={handleChange} />
          {errors.price ? <span className="field-error">{errors.price}</span> : null}
        </label>
      )}

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

      {submitSuccess ? <p className="form-success">{submitSuccess}</p> : null}
      {submitError ? <p className="form-error">{submitError}</p> : null}

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

      <label className="product-availability-toggle">
        <input
          type="checkbox"
          name="available"
          checked={form.available !== false}
          onChange={handleChange}
        />
        Disponible en el menu
      </label>

      <div className="admin-actions">
        <button type="submit" disabled={isSubmitting || uploading}>
          {isSubmitting ? 'Guardando...' : editingProduct ? 'Guardar cambios' : 'Agregar producto'}
        </button>
        {editingProduct ? (
          <button type="button" onClick={onCancel}>
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  )
}