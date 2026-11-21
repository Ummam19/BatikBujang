// Ilustrasi motif batik emas, dipakai jika foto produk belum ada / gagal dimuat.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">
<defs><pattern id="p" width="80" height="80" patternUnits="userSpaceOnUse">
<g fill="none" stroke="#C59B43" stroke-width="2">
<ellipse cx="40" cy="20" rx="10" ry="20"/><ellipse cx="40" cy="60" rx="10" ry="20"/>
<ellipse cx="20" cy="40" rx="20" ry="10"/><ellipse cx="60" cy="40" rx="20" ry="10"/>
</g><circle cx="40" cy="40" r="4" fill="#C59B43"/>
<circle cx="0" cy="0" r="3" fill="#C59B43" opacity=".5"/><circle cx="80" cy="0" r="3" fill="#C59B43" opacity=".5"/>
<circle cx="0" cy="80" r="3" fill="#C59B43" opacity=".5"/><circle cx="80" cy="80" r="3" fill="#C59B43" opacity=".5"/>
</pattern></defs>
<rect width="400" height="500" fill="#FBF7EE"/>
<rect width="400" height="500" fill="url(#p)" opacity=".75"/>
<rect x="95" y="212" width="210" height="76" rx="6" fill="#fff" opacity=".93"/>
<text x="200" y="244" text-anchor="middle" font-family="Georgia,serif" font-size="20" font-weight="bold" fill="#18181B">BATIK BUJANG</text>
<text x="200" y="268" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#AD8332">Foto produk segera hadir</text>
</svg>`

export const PLACEHOLDER_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

export const resolveImage = (src) => (src && String(src).trim() ? src : PLACEHOLDER_IMAGE)

// Pasang di <img @error="onImgError">
export function onImgError(event) {
  const el = event.target
  if (el.getAttribute('src') === PLACEHOLDER_IMAGE) return
  el.src = PLACEHOLDER_IMAGE
}
