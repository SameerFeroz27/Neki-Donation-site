import { ABOUT } from '../content/site'

export function AboutSection() {
  return (
    <section className="section section--alt" id="about">
      <div className="wrap about">
        <h2>{ABOUT.title}</h2>
        <p>{ABOUT.body}</p>
      </div>
    </section>
  )
}
