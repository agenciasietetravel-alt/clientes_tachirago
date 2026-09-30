/* Sitemap real. Antes /sitemap.xml devolvía el HTML de la aplicación, así que
   Google recibía basura donde esperaba una lista de direcciones. */
const { catalogo } = require('./_datos.js');
const SITIO = 'https://tachiragoo.com';

const escXml = v => String(v == null ? '' : v)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

module.exports = async function handler(req, res) {
  const hoy = new Date().toISOString().slice(0, 10);
  let urls = [{ loc: `${SITIO}/`, prioridad: '1.0', frecuencia: 'daily', fecha: hoy }];

  try {
    const d = await catalogo();
    d.negocios.forEach(n => {
      const suyos = d.listados.filter(l => l.provider_id === n.id);
      const fechas = suyos.map(l => l.updated_at).filter(Boolean).sort();
      urls.push({
        loc: `${SITIO}/${n.slug}`,
        prioridad: '0.8',
        frecuencia: 'weekly',
        fecha: (fechas[fechas.length - 1] || n.created_at || hoy).slice(0, 10)
      });
    });
  } catch (e) { /* al menos la portada entra en el sitemap */ }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${escXml(u.loc)}</loc>
    <lastmod>${escXml(u.fecha)}</lastmod>
    <changefreq>${u.frecuencia}</changefreq>
    <priority>${u.prioridad}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(xml);
};
