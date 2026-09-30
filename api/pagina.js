/* ==========================================================================
   PRE-RENDERIZADO
   La aplicación se arma en el navegador, así que un robot que no ejecuta
   JavaScript veía una página en blanco. Google sí ejecuta JS; los motores de
   respuesta con IA (GPTBot, PerplexityBot, ClaudeBot) casi nunca.
   Aquí se sirve el mismo contenido que ve el visitante, ya escrito en el HTML:
   títulos y descripciones por página, datos estructurados y un bloque de texto
   legible. React lo reemplaza al montar, así que nadie ve dos versiones
   distintas — solo llegan antes los buscadores.
   ========================================================================== */

const fs = require('fs');
const path = require('path');
const { catalogo, esc, linea } = require('./_datos.js');

const SITIO = 'https://tachiragoo.com';
const MUNICIPIOS_CLAVE = 'San Cristóbal, La Grita, Lobatera, Cordero, Rubio, Michelena y todo el estado Táchira';

let PLANTILLA = null;
function plantilla() {
  if (PLANTILLA) return PLANTILLA;
  for (const ruta of [
    path.join(process.cwd(), 'aplicacion.html'),
    path.join(__dirname, '..', 'aplicacion.html')
  ]) {
    try { PLANTILLA = fs.readFileSync(ruta, 'utf8'); return PLANTILLA; } catch (e) { /* siguiente */ }
  }
  throw new Error('No se encontró aplicacion.html');
}

/* Sustituye las etiquetas que ya trae la plantilla, en vez de añadir
   duplicados: dos <title> o dos canonical confunden al buscador. */
function cabecera(html, { titulo, descripcion, url, imagen, tipo, noindex }) {
  let h = html;
  h = h.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(titulo)}</title>`);
  h = h.replace(/<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${esc(descripcion)}">`);
  h = h.replace(/<link rel="canonical" href="[^"]*">/,
    `<link rel="canonical" href="${esc(url)}">`);
  h = h.replace(/<meta property="og:title" content="[^"]*">/,
    `<meta property="og:title" content="${esc(titulo)}">`);
  h = h.replace(/<meta property="og:description" content="[^"]*">/,
    `<meta property="og:description" content="${esc(descripcion)}">`);
  h = h.replace(/<meta property="og:url" content="[^"]*">/,
    `<meta property="og:url" content="${esc(url)}">`);
  h = h.replace(/<meta name="twitter:title" content="[^"]*">/,
    `<meta name="twitter:title" content="${esc(titulo)}">`);
  h = h.replace(/<meta name="twitter:description" content="[^"]*">/,
    `<meta name="twitter:description" content="${esc(descripcion)}">`);
  if (imagen) {
    h = h.replace(/<meta property="og:image" content="[^"]*">/,
      `<meta property="og:image" content="${esc(imagen)}">`);
    h = h.replace(/<meta name="twitter:image" content="[^"]*">/,
      `<meta name="twitter:image" content="${esc(imagen)}">`);
  }
  if (tipo) h = h.replace(/<meta property="og:type" content="[^"]*">/,
    `<meta property="og:type" content="${esc(tipo)}">`);
  if (noindex) h = h.replace(/<meta name="robots" content="[^"]*">/,
    `<meta name="robots" content="noindex, follow">`);
  return h;
}

function inyectar(html, { jsonld, contenido }) {
  let h = html;
  if (jsonld) {
    const bloque = `<script type="application/ld+json">${
      JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>\n</head>`;
    h = h.replace('</head>', bloque);
  }
  if (contenido) h = h.replace('<div id="root"></div>', `<div id="root">${contenido}</div>`);
  return h;
}

const dinero = n => `$${Number(n || 0).toFixed(0)} USD`;
const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

/* ------------------------------------------------------------------ INICIO */
function paginaInicio(d) {
  const tours = d.listados.filter(l => l.category !== 'alojamiento');
  const municipios = [...new Set(d.listados.map(l => l.municipio).filter(Boolean))];

  const titulo = 'Qué hacer en Táchira: tours, posadas y alquiler de vehículos | Táchira GOO!!!';
  const descripcion = d.listados.length
    ? linea(`Reserva ${plural(d.listados.length, 'experiencia', 'experiencias')}, ${
        plural(d.habitaciones.length, 'habitación', 'habitaciones')} y ${
        plural(d.vehiculos.length, 'vehículo', 'vehículos')} con proveedores verificados del estado Táchira. Pago protegido y confirmación por WhatsApp.`)
    : 'Reserva tours, posadas, experiencias y alquiler de vehículos con proveedores locales verificados del estado Táchira.';

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TravelAgency',
        '@id': `${SITIO}/#organizacion`,
        name: 'Táchira GOO!!!',
        url: SITIO,
        logo: `${SITIO}/assets/favicon-512.png`,
        image: `${SITIO}/assets/og.png`,
        description: 'Plataforma de reservas de turismo del estado Táchira, Venezuela: tours, posadas, experiencias y alquiler de vehículos con proveedores locales verificados.',
        areaServed: {
          '@type': 'State', name: 'Táchira',
          address: { '@type': 'PostalAddress', addressRegion: 'Táchira', addressCountry: 'VE' }
        },
        knowsLanguage: 'es-VE',
        currenciesAccepted: 'USD, VES, COP',
        paymentAccepted: 'Pago Móvil, Zelle, Nequi, USDT'
      },
      {
        '@type': 'WebSite',
        '@id': `${SITIO}/#sitio`,
        url: SITIO,
        name: 'Táchira GOO!!!',
        inLanguage: 'es-VE',
        publisher: { '@id': `${SITIO}/#organizacion` }
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITIO}/#preguntas`,
        mainEntity: [
          ['¿Hace falta crear una cuenta para reservar en Táchira GOO!!!?',
           'No. Se reserva dejando nombre, cédula o pasaporte, teléfono y correo. Al confirmar recibes un código de reserva con el que puedes consultarla y gestionarla después, sin registrarte.'],
          ['¿Cómo se paga?',
           'Por Pago Móvil, Zelle, Nequi, USDT o tarjeta, según los métodos habilitados. Adjuntas el comprobante y la plataforma verifica el pago antes de confirmar la reserva.'],
          ['¿En qué moneda están los precios?',
           'Los precios se fijan en dólares y se muestran también en pesos colombianos y bolívares, con la tasa de referencia a la vista. Cada reserva guarda la tasa con la que se hizo.'],
          ['¿Qué pasa si necesito cancelar?',
           'Cada publicación indica su condición antes de reservar: 100% reembolsable, parcialmente reembolsable o sin reembolso. Las condiciones reembolsables aplican cancelando con al menos 48 horas de antelación.'],
          ['¿Quién presta el servicio?',
           'Cada servicio lo presta el proveedor que lo publica. Táchira GOO!!! verifica a los proveedores antes de publicarlos y custodia el pago hasta que se confirma el servicio.'],
          ['¿Qué municipios del Táchira cubre?',
           'La plataforma cubre todo el estado Táchira, con actividad concentrada en San Cristóbal, La Grita, Lobatera, Cordero, Rubio y Michelena.']
        ].map(([q, a]) => ({
          '@type': 'Question', name: q,
          acceptedAnswer: { '@type': 'Answer', text: a }
        }))
      },
      ...(d.listados.length ? [{
        '@type': 'ItemList',
        name: 'Experiencias y tours en el estado Táchira',
        numberOfItems: d.listados.length,
        itemListElement: d.listados.slice(0, 30).map((l, i) => ({
          '@type': 'ListItem', position: i + 1,
          item: {
            '@type': 'TouristAttraction',
            name: l.title,
            description: linea(l.description, 300),
            image: l.cover_image_url || undefined,
            address: { '@type': 'PostalAddress', addressLocality: l.municipio, addressRegion: 'Táchira', addressCountry: 'VE' },
            offers: { '@type': 'Offer', price: Number(l.base_price), priceCurrency: 'USD', availability: 'https://schema.org/InStock' }
          }
        }))
      }] : [])
    ]
  };

  const contenido = `
<h1>Qué hacer en el estado Táchira</h1>
<p>Táchira GOO!!! reúne en un solo lugar los tours, posadas, experiencias y vehículos de alquiler
del estado Táchira, Venezuela. Cada negocio publicado pasó una verificación antes de aparecer aquí,
y el pago queda protegido por la plataforma hasta que se confirma el servicio.</p>
<p>Cubrimos ${esc(MUNICIPIOS_CLAVE)}.</p>
${municipios.length ? `<h2>Municipios con oferta publicada</h2><ul>${
  municipios.map(m => `<li>${esc(m)}</li>`).join('')}</ul>` : ''}
${tours.length ? `<h2>Tours y experiencias</h2><ul>${tours.map(l =>
  `<li><strong>${esc(l.title)}</strong> — ${esc(l.municipio)}. Desde ${dinero(l.base_price)}.${
    l.description ? ' ' + esc(linea(l.description, 220)) : ''}</li>`).join('')}</ul>` : ''}
${d.habitaciones.length ? `<h2>Dónde dormir</h2><ul>${d.habitaciones.map(h =>
  `<li><strong>${esc(h.nombre)}</strong> — hasta ${h.capacidad} huéspedes. Desde ${dinero(h.precio_base)} por noche.</li>`).join('')}</ul>` : ''}
${d.vehiculos.length ? `<h2>Cómo moverte</h2><ul>${d.vehiculos.map(v =>
  `<li><strong>${esc([v.brand, v.model].filter(Boolean).join(' ') || v.title)}</strong> — ${esc(v.municipio)}. ${dinero(v.price_per_day)} por día.</li>`).join('')}</ul>` : ''}
${d.negocios.length ? `<h2>Negocios verificados</h2><ul>${d.negocios.map(n =>
  `<li><a href="/${esc(n.slug)}">${esc(n.business_name)}</a> — ${esc(n.municipio)}</li>`).join('')}</ul>` : ''}
<h2>Cómo funciona una reserva</h2>
<ol>
  <li>Eliges el servicio y las fechas.</li>
  <li>Pagas por Pago Móvil, Zelle, Nequi o USDT y adjuntas el comprobante.</li>
  <li>Verificamos el pago y recibes tu voucher con un código de reserva.</li>
  <li>Con ese código y tu cédula o correo consultas y gestionas tu reserva, sin crear cuenta.</li>
</ol>`;

  return { titulo, descripcion, url: `${SITIO}/`, jsonld, contenido };
}

/* -------------------------------------------------------------- MICROSITIO */
function paginaNegocio(n, d) {
  const suyos = d.listados.filter(l => l.provider_id === n.id);
  const habitaciones = d.habitaciones.filter(h => h.provider_id === n.id);
  const vehiculos = d.vehiculos.filter(v => v.provider_id === n.id);

  const tipoSchema = n.business_type === 'hotel' ? 'LodgingBusiness'
    : n.business_type === 'vehiculos' ? 'AutoRental' : 'TravelAgency';

  const precios = [
    ...suyos.map(l => Number(l.base_price)),
    ...habitaciones.map(h => Number(h.precio_base)),
    ...vehiculos.map(v => Number(v.price_per_day))
  ].filter(x => Number.isFinite(x) && x > 0);

  const titulo = `${n.business_name} — ${n.municipio}, Táchira | Reserva en Táchira GOO!!!`;
  const descripcion = linea(n.about || n.historia ||
    `${n.business_name} en ${n.municipio}, estado Táchira. Reserva directo con pago protegido.`);

  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [{
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Táchira GOO!!!', item: SITIO },
      { '@type': 'ListItem', position: 2, name: n.municipio, item: `${SITIO}/` },
      { '@type': 'ListItem', position: 3, name: n.business_name, item: `${SITIO}/${n.slug}` }
    ]
  }, {
    '@type': tipoSchema,
    '@id': `${SITIO}/${n.slug}#negocio`,
    name: n.business_name,
    url: `${SITIO}/${n.slug}`,
    description: linea(n.historia || n.about, 500) || undefined,
    image: n.cover_image_url || undefined,
    logo: n.logo_url || undefined,
    foundingDate: n.anio_fundacion ? String(n.anio_fundacion) : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: n.direccion || undefined,
      addressLocality: n.municipio,
      addressRegion: 'Táchira',
      addressCountry: 'VE'
    },
    geo: (n.lat && n.lng) ? { '@type': 'GeoCoordinates', latitude: n.lat, longitude: n.lng } : undefined,
    priceRange: precios.length ? `$${Math.min(...precios).toFixed(0)}–$${Math.max(...precios).toFixed(0)} USD` : undefined,
    currenciesAccepted: 'USD, VES, COP',
    parentOrganization: { '@type': 'TravelAgency', name: 'Táchira GOO!!!', url: SITIO },
    makesOffer: [
      ...suyos.map(l => ({
        '@type': 'Offer', name: l.title, description: linea(l.description, 300),
        price: Number(l.base_price), priceCurrency: 'USD', availability: 'https://schema.org/InStock'
      })),
      ...habitaciones.map(h => ({
        '@type': 'Offer', name: h.nombre, description: linea(h.descripcion, 300),
        price: Number(h.precio_base), priceCurrency: 'USD', availability: 'https://schema.org/InStock'
      })),
      ...vehiculos.map(v => ({
        '@type': 'Offer',
        name: [v.brand, v.model].filter(Boolean).join(' ') || v.title,
        price: Number(v.price_per_day), priceCurrency: 'USD', availability: 'https://schema.org/InStock'
      }))
    ]
  }]
  };

  const contenido = `
<nav><a href="/">Táchira GOO!!!</a> › ${esc(n.business_name)}</nav>
<h1>${esc(n.business_name)}</h1>
<p>${esc(n.lema || n.cover_tagline || '')}</p>
<p>${esc(n.municipio)}, estado Táchira, Venezuela.${
  n.anio_fundacion ? ` Operando desde ${n.anio_fundacion}.` : ''}</p>
${n.historia ? `<h2>Quiénes somos</h2><p>${esc(n.historia)}</p>` : ''}
${n.que_hacemos ? `<h2>Qué hacemos</h2><p>${esc(n.que_hacemos)}</p>` : ''}
${habitaciones.length ? `<h2>Habitaciones</h2><ul>${habitaciones.map(h =>
  `<li><strong>${esc(h.nombre)}</strong> — hasta ${h.capacidad} huéspedes, desde ${dinero(h.precio_base)} por noche.${
    h.descripcion ? ' ' + esc(linea(h.descripcion, 220)) : ''}</li>`).join('')}</ul>` : ''}
${suyos.length ? `<h2>Tours y experiencias</h2><ul>${suyos.map(l =>
  `<li><strong>${esc(l.title)}</strong> — desde ${dinero(l.base_price)}.${
    l.description ? ' ' + esc(linea(l.description, 220)) : ''}</li>`).join('')}</ul>` : ''}
${vehiculos.length ? `<h2>Vehículos en alquiler</h2><ul>${vehiculos.map(v =>
  `<li><strong>${esc([v.brand, v.model].filter(Boolean).join(' ') || v.title)}</strong> — ${dinero(v.price_per_day)} por día.</li>`).join('')}</ul>` : ''}
${n.direccion ? `<h2>Cómo llegar</h2><p>${esc(n.direccion)}</p>` : ''}
${(() => {
  const otros = d.negocios.filter(o => o.id !== n.id).slice(0, 6);
  return otros.length
    ? `<h2>Otros destinos en el estado Táchira</h2><ul>${otros.map(o =>
        `<li><a href="/${esc(o.slug)}">${esc(o.business_name)}</a> — ${esc(o.municipio)}</li>`).join('')}</ul>`
    : '';
})()}
<p>Reservas gestionadas por <a href="/">Táchira GOO!!!</a> con pago protegido.</p>`;

  return {
    titulo, descripcion, url: `${SITIO}/${n.slug}`,
    imagen: n.cover_image_url || undefined, tipo: 'profile', jsonld, contenido
  };
}

/* ------------------------------------------------------------------ HANDLER */
module.exports = async function handler(req, res) {
  let base;
  try { base = plantilla(); }
  catch (e) {
    res.status(500).send('No se pudo cargar la aplicación.');
    return;
  }

  const ruta = decodeURIComponent((req.url || '/').split('?')[0]);
  const slug = ruta.split('/').filter(Boolean)[0] || '';

  try {
    const d = await catalogo();
    let pagina, estado = 200;

    if (!slug) {
      pagina = paginaInicio(d);
    } else {
      const negocio = d.negocios.find(n => n.slug === slug.toLowerCase());
      if (negocio) {
        pagina = paginaNegocio(negocio, d);
      } else {
        estado = 404;
        pagina = {
          titulo: 'Página no encontrada | Táchira GOO!!!',
          descripcion: 'Esa dirección no corresponde a ningún negocio publicado en Táchira GOO!!!',
          url: `${SITIO}${ruta}`, noindex: true,
          contenido: `<h1>No encontramos esa página</h1>
<p>La dirección <strong>${esc(ruta)}</strong> no corresponde a ningún negocio publicado.</p>
<p><a href="/">Volver al inicio de Táchira GOO!!!</a></p>`
        };
      }
    }

    let html = cabecera(base, pagina);
    html = inyectar(html, pagina);

    /* Se cachea en el borde: el catálogo cambia poco y así la página
       responde como si fuera estática. */
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400');
    res.status(estado).send(html);
  } catch (e) {
    /* Si Supabase falla, se sirve la aplicación tal cual: el visitante no
       debe quedarse sin sitio porque el pre-renderizado no pudo leer datos. */
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=30');
    res.status(200).send(base);
  }
};
