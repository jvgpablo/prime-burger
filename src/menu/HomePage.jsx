import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <section className="home-page">
      <section
        className="home-animated-hero"
        style={{
          backgroundImage: "url('/WhatsApp%20Image%202026-05-12%20at%206.28.56%20PM.jpeg')",
        }}
      >
        <div className="home-animated-overlay" />
        <div className="home-animated-content">
          <div className="home-hero-copy home-hero-copy--dark">
            <h2>La Mejor Sazón</h2>
            <h3>Donde La Hamburguesa Reinará</h3>
            <p className="hero-description">
              Calidad Garantizada, Sabor Explosivo y Hecho Con Pasión. Las hamburguesas más deliciosa
            </p>
            <div className="hero-actions">
              <Link className="home-feature-button" to="/menu">
                Mira Nuestro Menú
              </Link>
              <Link className="home-feature-button home-feature-button--ghost" to="/contacto">
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="home-feature-cards">
        <article className="home-feature-card home-feature-card--media">
          <img
            src="/WhatsApp%20Image%202026-05-12%20at%206.28.56%20PM.jpeg"
            alt="Hamburguesa con papas"
          />
          <div className="home-feature-box">
            <h4 className="item-title">Servicio Rápido</h4>
            <p className="item-price">No esperarás más de 10 minutos.</p>
            <p className="item-text">Ideal para quienes quieren comer bien sin perder tiempo.</p>
          </div>
        </article>

        <article className="home-feature-card home-feature-card--media">
          <img
            src="/WhatsApp%20Image%202026-05-12%20at%206.28.57%20PM%20%281%29.jpeg"
            alt="Hamburguesa especial"
          />
          <div className="home-feature-box">
            <h4 className="item-title">Sabor Explosivo</h4>
            <p className="item-price">Hecho con combinaciones intensas.</p>
            <p className="item-text">Una carta simple, directa y con mucho antojo visual.</p>
          </div>
        </article>

        <article className="home-feature-card home-feature-card--media">
          <img
            src="/WhatsApp%20Image%202026-05-12%20at%206.28.57%20PM.jpeg"
            alt="Hamburguesa artesanal"
          />
          <div className="home-feature-box">
            <h4 className="item-title">Hecho Con Pasión</h4>
            <p className="item-price">Cada preparación sale con cariño.</p>
            <p className="item-text">El diseño prioriza lo importante: texto claro y fotos potentes.</p>
          </div>
        </article>
      </section>
    </section>
  )
}