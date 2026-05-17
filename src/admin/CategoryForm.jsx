import { useEffect, useState } from 'react'

const emptyForm = {
  name: '',
}

export function CategoryForm({ editingCategory, onSave, onCancel }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (editingCategory) {
      setForm({
        name: editingCategory.name,
      })
      return
    }

    setForm(emptyForm)
  }, [editingCategory])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setSubmitError('')
  }

  function validate() {
    const nextErrors = {}

    if (!form.name.trim()) {
      nextErrors.name = 'El nombre de la categoria es obligatorio.'
    } else if (form.name.trim().length < 3) {
      nextErrors.name = 'El nombre debe tener minimo 3 caracteres.'
    }

    return nextErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validate()
    setErrors(nextErrors)
    setSubmitError('')

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    try {
      await onSave({ name: form.name.trim() })

      if (!editingCategory) {
        setForm(emptyForm)
      }
    } catch (error) {
      setSubmitError(error.message)
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit} noValidate>
      <h3>{editingCategory ? 'Editar categoria' : 'Nueva categoria'}</h3>

      <label>
        Nombre de categoria
        <input name="name" value={form.name} onChange={handleChange} />
        {errors.name ? <span className="field-error">{errors.name}</span> : null}
      </label>

      {submitError ? <p className="form-error">{submitError}</p> : null}

      <div className="admin-actions">
        <button type="submit">{editingCategory ? 'Guardar cambios' : 'Agregar categoria'}</button>
        {editingCategory ? (
          <button type="button" onClick={onCancel}>
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  )
}
