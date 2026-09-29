import { useSiteSettings } from '../context/SiteSettingsContext'

function normalizeUrl(value) {
  const trimmed = (value || '').trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function ContactPage() {
  const { settings } = useSiteSettings()
  const whatsappUrl = normalizeUrl(settings.contact.whatsappLink)

  return (
    <section className="contact-page">
      <h2>Contacto</h2>
      <div className="contact-cards">
        <article className="contact-card">
          <div className="contact-card-icon">✉️</div>
          <h3>Contacto</h3>
          <p><strong>Email:</strong> {settings.contact.email}</p>
          <button type="button">Enviar mensaje</button>
        </article>

        <article className="contact-card">
          <div className="contact-card-icon">💬</div>
          <h3>Chat</h3>
          <p><strong>Teléfono:</strong> {settings.contact.phone}</p>
          <p>WhatsApp</p>
          <a
            className="contact-card-button"
            href={whatsappUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => {
              if (!whatsappUrl) {
                event.preventDefault()
              }
            }}
            aria-disabled={!whatsappUrl}
          >
            Iniciar chat
          </a>
        </article>

        <article className="contact-card">
          <div className="contact-card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.75 2h8.5C19.55 2 22 4.45 22 7.75v8.5C22 19.55 19.55 22 16.25 22h-8.5C4.45 22 2 19.55 2 16.25v-8.5C2 4.45 4.45 2 7.75 2zm0 1.5C5.45 3.5 3.5 5.45 3.5 7.75v8.5c0 2.3 1.95 4.25 4.25 4.25h8.5c2.3 0 4.25-1.95 4.25-4.25v-8.5c0-2.3-1.95-4.25-4.25-4.25h-8.5zM12 7.25a4.75 4.75 0 1 1 0 9.5 4.75 4.75 0 0 1 0-9.5zm0 1.5a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5zm4.75-.75a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </svg>
          </div>
          <h3>Instagram</h3>
          <p>prime_burgerrr</p>
          <a
            className="contact-card-button"
            href={settings.contact.instagram?.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ir
          </a>
        </article>
      </div>

      <div className="contact-map">
          <h3>Ubicación</h3>
          <p>Calle 15 #22-31 entre carreras 22 y 23</p>
          <p>San Cristóbal 5001, Táchira, Venezuela</p>
          <iframe
            src="https://www.google.com/maps/embed/v1/place?key=AIzaSyCt1265A4qvZy9HKUeA8J15AOC4SrCyZe4&q=7.773298,-72.217612"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación Casa Luz"
          ></iframe>
        </div>
    </section>
  )
}