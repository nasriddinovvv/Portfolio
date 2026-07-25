import { about } from '../data/portfolio'

export default function About() {
  return (
    <section id="about" className="section about">
      <div className="container">
        <div className="section__header">
          <span className="section__label">Men haqimda</span>
          <h2 className="section__title">Kimman?</h2>
        </div>

        <div className="about__grid">
          <div className="about__content">
            <p className="about__text">{about.description}</p>
            <a href="#contact" className="btn btn--primary">
              Mening bilan ishlang
            </a>
          </div>

          <div className="about__stats">
            {about.highlights.map((item) => (
              <div key={item.label} className="about__stat">
                <span className="about__stat-value">{item.value}</span>
                <span className="about__stat-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
