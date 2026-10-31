import { MapPin, Clock, MessageCircle } from 'lucide-react'
import { waLink, WHATSAPP_DISPLAY } from '../config/store'

/**
 * Contact — ditampilkan sebagai section di halaman Profile.
 */
function Contact() {
  return (
    <section className="profile-section" id="contact">
      <h3 className="section-title"><MessageCircle size={18} /> Contact</h3>
      <p className="section-display display">Come by the shop.</p>
      <ul className="contact-list">
        <li><MapPin size={16} /> 123 Range Road</li>
        <li><Clock size={16} /> Open Tuesday to Saturday, 10 to 6</li>
        <li>
          <MessageCircle size={16} />
          <a href={waLink('Hi, aku mau tanya soal produk Bore & Barrel')} target="_blank" rel="noopener noreferrer">
            WhatsApp {WHATSAPP_DISPLAY}
          </a>
        </li>
      </ul>
    </section>
  )
}

export default Contact
