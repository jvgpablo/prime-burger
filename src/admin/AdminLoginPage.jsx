import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = location.state?.from?.pathname || '/admin'

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setSubmitError('')
  }

  function validate() {
    const nextErrors = {}

    if (!form.email.trim()) {
      nextErrors.email = 'El correo es obligatorio.'
    } else if (!isValidEmail(form.email.trim())) {
      nextErrors.email = 'Ingresa un correo valido.'
    }

    if (!form.password) {
      nextErrors.password = 'La contrasena es obligatoria.'
    } else if (form.password.length < 6) {
      nextErrors.password = 'La contrasena debe tener al menos 6 caracteres.'
    }

    return nextErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    try {
      setIsSubmitting(true)
      await login(form.email.trim(), form.password)
      navigate(redirectTo, { replace: true })
    } catch {
      setSubmitError('No se pudo iniciar sesion. Verifica correo y contrasena.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="admin-login-page">
      <h2>Login de administrador</h2>
      <p>Solo usuarios autorizados pueden entrar al panel de admin.</p>

      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        <label>
          Correo
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="admin@correo.com"
          />
          {errors.email ? <span className="field-error">{errors.email}</span> : null}
        </label>

        <label>
          Contrasena
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="******"
          />
          {errors.password ? <span className="field-error">{errors.password}</span> : null}
        </label>

        {submitError ? <p className="form-error">{submitError}</p> : null}

        <div className="admin-actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>
      </form>
    </section>
  )
}