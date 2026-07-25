import { skills } from '../data/portfolio'

export default function Skills() {
  return (
    <section id="skills" className="section skills">
      <div className="container">
        <div className="section__header">
          <span className="section__label">Ko'nikmalar</span>
          <h2 className="section__title">Texnologiyalar</h2>
        </div>

        <div className="skills__grid">
          {skills.map((skill) => (
            <div key={skill.name} className="skill-card">
              <div className="skill-card__header">
                <span className="skill-card__name">{skill.name}</span>
                <span className="skill-card__level">{skill.level}%</span>
              </div>
              <div className="skill-card__bar">
                <div
                  className="skill-card__fill"
                  style={{ width: `${skill.level}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
