import { useEffect, useState } from 'react'

function normalizeUrl(value) {
  const trimmed = (value || '').trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function isValidWhatsappUrl(value) {
  return /^(https?:\/\/)?(wa\.link|wa\.me|api\.whatsapp\.com)(\/|\?|$)/i.test((value || '').trim())
}

export function ContactSettingsForm({ contact, onSave }) {
  const [form, setForm] = useState(contact)
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    setForm(contact)
  }, [contact])

  function handleChange(event) {
    const { name, value } = event.target
    
    if (name === 'instagramName' || name === 'instagramLink') {
      const instagramProp = name === 'instagramName' ? 'name' : 'link'
      setForm((prev) => ({
        ...prev,
        instagram: {
          ...prev.instagram,
          [instagramProp]: value,
        },
      }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
    
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setSuccessMessage('')
    setSubmitError('')
  }

  function validate() {
    const nextErrors = {}

    if (!form.phone.trim()) {
      nextErrors.phone = 'El telefono es obligatorio.'
    } else if (form.phone.trim().length < 7) {
      nextErrors.phone = 'El telefono es demasiado corto.'
    }

    if (!form.email.trim()) {
      nextErrors.email = 'El correo es obligatorio.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Ingresa un correo valido.'
    }

    if (!form.address.trim()) {
      nextErrors.address = 'La direccion es obligatoria.'
    } else if (form.address.trim().length < 6) {
      nextErrors.address = 'La direccion es demasiado corta.'
    }

    if (form.instagram?.name && !form.instagram.name.trim()) {
      nextErrors.instagramName = 'El nombre de Instagram es obligatorio si agregas Instagram.'
    }

    if (form.instagram?.link && !form.instagram.link.trim()) {
      nextErrors.instagramLink = 'El link de Instagram es obligatorio si agregas Instagram.'
    } else if (form.instagram?.link && !/^https?:\/\//.test(form.instagram.link.trim())) {
      nextErrors.instagramLink = 'El link debe comenzar con http:// o https://'
    }

    if (form.whatsappLink?.trim() && !isValidWhatsappUrl(form.whatsappLink)) {
      nextErrors.whatsappLink = 'El link de WhatsApp debe ser valido (wa.link, wa.me o api.whatsapp.com).'
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

    const contactData = {
      phone: form.phone.trim(),
      whatsappLink: normalizeUrl(form.whatsappLink),
      email: form.email.trim(),
      address: form.address.trim(),
    }

    if (form.instagram?.name && form.instagram?.link) {
      contactData.instagram = {
        name: form.instagram.name.trim(),
        link: form.instagram.link.trim(),
      }
    }

    try {
      await onSave(contactData)
      setSuccessMessage('Contacto actualizado correctamente.')
    } catch (error) {
      setSubmitError(error?.message || 'No se pudo guardar el contacto.')
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit} noValidate>
      <h3>Configuracion de contacto</h3>

      <label>
        Telefono
        <input name="phone" value={form.phone} onChange={handleChange} />
        {errors.phone ? <span className="field-error">{errors.phone}</span> : null}
      </label>

      <label>
        WhatsApp - Link (opcional)
        <input
          name="whatsappLink"
          value={form.whatsappLink || ''}
          onChange={handleChange}
          placeholder="wa.link/b497gf"
        />
        {errors.whatsappLink ? <span className="field-error">{errors.whatsappLink}</span> : null}
      </label>

      <label>
        Correo
        <input type="email" name="email" value={form.email} onChange={handleChange} />
        {errors.email ? <span className="field-error">{errors.email}</span> : null}
      </label>

      <label>
        Direccion
        <input name="address" value={form.address} onChange={handleChange} />
        {errors.address ? <span className="field-error">{errors.address}</span> : null}
      </label>

      <label>
        Instagram - Nombre (ej: @primeburger)
        <input 
          name="instagramName" 
          value={form.instagram?.name || ''} 
          onChange={handleChange} 
          placeholder="@primeburger"
        />
        {errors.instagramName ? <span className="field-error">{errors.instagramName}</span> : null}
      </label>

      <label>
        Instagram - Link
        <input 
          name="instagramLink" 
          value={form.instagram?.link || ''} 
          onChange={handleChange} 
          placeholder="https://instagram.com/primeburger"
        />
        {errors.instagramLink ? <span className="field-error">{errors.instagramLink}</span> : null}
      </label>

      {successMessage ? <p className="form-success">{successMessage}</p> : null}
      {submitError ? <p className="form-error">{submitError}</p> : null}

      <div className="admin-actions">
        <button type="submit">Guardar contacto</button>
      </div>
    </form>
  )
}
