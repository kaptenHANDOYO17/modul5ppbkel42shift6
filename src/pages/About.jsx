import { Info } from 'lucide-react'

/**
 * About — ditampilkan sebagai section di halaman Profile.
 */
function About() {
  return (
    <section className="profile-section" id="about">
      <h3 className="section-title"><Info size={18} /> About</h3>
      <p className="section-display display">A one-room armory.</p>
      <p className="lede">
        Bore &amp; Barrel sells a short, honest list of firearms. Each piece is priced
        from the bench — no markup theatre, no filler.
      </p>
    </section>
  )
}

export default About
