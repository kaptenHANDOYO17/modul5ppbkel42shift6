// ---------------------------------------------------------------------------
// Store configuration — nomor WhatsApp tujuan checkout.
// Format internasional tanpa "+" / "0" di depan: 0895378169126 → 62895378169126
// Bisa ditimpa lewat .env: VITE_WHATSAPP_NUMBER=62xxxxxxxxxx
// ---------------------------------------------------------------------------

export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '62895378169126'
export const WHATSAPP_DISPLAY = '0895-3781-69126'

export const waLink = (text) =>
  `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ''}`
