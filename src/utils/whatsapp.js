import { formatRupiah, normalizePhone } from './format'
import { PRODUCT_STATUS } from './constants'

export const buildWhatsAppUrl = (number, message) =>
  `https://wa.me/${normalizePhone(number)}?text=${encodeURIComponent(message)}`

export const buildGeneralMessage = (storeName) =>
  `Halo ${storeName}, saya ingin bertanya tentang kain batik lembaran yang tersedia.`

export function buildProductMessage({ product, storeName, defaultDays = 14 }) {
  const ready = product.status === PRODUCT_STATUS.READY
  const statusLine = ready
    ? `${PRODUCT_STATUS.READY} (siap kirim)`
    : `${PRODUCT_STATUS.PREORDER} (estimasi pengerjaan sekitar ${product.estimatedDays || defaultDays} hari)`
  return [
    `Halo ${storeName}, saya tertarik dengan kain batik berikut:`,
    '',
    `Motif: ${product.name}`,
    `Jenis kain: ${product.fabricType}`,
    `Ukuran: ${product.dimension}`,
    `Harga: ${formatRupiah(product.price)}`,
    `Status: ${statusLine}`,
    '',
    ready
      ? 'Apakah masih tersedia? Saya ingin memesan ___ lembar. Mohon info ongkir dan cara pembayarannya.'
      : 'Saya ingin ikut Pre-Order motif ini. Mohon info estimasi selesai dan cara pembayarannya.',
    'Terima kasih.'
  ].join('\n')
}
