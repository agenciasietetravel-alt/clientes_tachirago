/* llms.txt — convención emergente para motores de respuesta con IA: un
   resumen corto y factual del sitio, en texto plano, sin tener que
   interpretar HTML ni ejecutar JavaScript. */
const { catalogo } = require('./_datos.js');
const SITIO = 'https://tachiragoo.com';

module.exports = async function handler(req, res) {
  let cuerpo = `# Táchira GOO!!!

> Plataforma de reservas de turismo del estado Táchira, Venezuela. Conecta viajeros
> con proveedores locales verificados: tours, posadas y hoteles, experiencias y
> alquiler de vehículos. El pago queda protegido por la plataforma hasta que se
> confirma el servicio.

Cobertura: estado Táchira, Venezuela. Municipios con actividad: San Cristóbal,
La Grita, Lobatera, Cordero, Rubio, Michelena.
Idioma: español (es-VE). Monedas mostradas: USD, COP y VES.
Medios de pago: Pago Móvil, Zelle, Nequi y USDT.

## Cómo funciona una reserva
1. El viajero elige servicio y fechas. No hace falta crear cuenta.
2. Paga y adjunta el comprobante de la transferencia.
3. La plataforma verifica el pago y emite un voucher con código de reserva.
4. Con ese código y su cédula o correo consulta y gestiona la reserva.

Cancelación: cada publicación indica su condición (100% reembolsable,
parcialmente reembolsable o sin reembolso), visible antes de reservar.
`;

  try {
    const d = await catalogo();
    if (d.negocios.length) {
      cuerpo += `\n## Negocios verificados\n`;
      d.negocios.forEach(n => {
        const suyos = d.listados.filter(l => l.provider_id === n.id);
        const hab = d.habitaciones.filter(h => h.provider_id === n.id);
        const veh = d.vehiculos.filter(v => v.provider_id === n.id);
        cuerpo += `\n- [${n.business_name}](${SITIO}/${n.slug}) — ${n.municipio}, Táchira.`;
        if (n.about) cuerpo += ` ${String(n.about).replace(/\s+/g, ' ').slice(0, 220)}`;
        if (hab.length) cuerpo += `\n  Habitaciones: ${hab.map(h => `${h.nombre} (desde $${Number(h.precio_base).toFixed(0)} USD/noche)`).join('; ')}.`;
        if (suyos.length) cuerpo += `\n  Experiencias: ${suyos.map(l => `${l.title} (desde $${Number(l.base_price).toFixed(0)} USD)`).join('; ')}.`;
        if (veh.length) cuerpo += `\n  Vehículos: ${veh.map(v => `${[v.brand, v.model].filter(Boolean).join(' ') || v.title} ($${Number(v.price_per_day).toFixed(0)} USD/día)`).join('; ')}.`;
        cuerpo += `\n`;
      });
    }
  } catch (e) { /* el resumen general vale por sí solo */ }

  cuerpo += `\n## Enlaces\n- Sitemap: ${SITIO}/sitemap.xml\n- Inicio: ${SITIO}/\n`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(cuerpo);
};
