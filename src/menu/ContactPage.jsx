import { useSiteSettings } from '../context/SiteSettingsContext'

export function ContactPage() {
  const { settings } = useSiteSettings()

  return (
    <section className="contact-page">
      <h2>Contacto</h2>
      <div className="contact-info">
        <div className="contact-details">
          <p><strong>Teléfono:</strong> {settings.contact.phone}</p>
          <p><strong>Email:</strong> {settings.contact.email}</p>
          <p><strong>Dirección:</strong> {settings.contact.address}</p>
          {settings.contact.instagram && (
            <p>
              <strong>Instagram:</strong> {' '}
              <a href={settings.contact.instagram.link} target="_blank" rel="noopener noreferrer">
                {settings.contact.instagram.name}
              </a>
            </p>
          )}
        </div>

        <div className="contact-map">
          <h3>Casa Luz</h3>
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
      </div>
    </section>
  )
}