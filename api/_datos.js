/* Lectura del catálogo público desde Supabase, sin dependencias.
   Se usa tanto para pre-renderizar páginas como para el sitemap. */

const SUPABASE = 'https://vkgxvckooykxfulclodj.supabase.co';
const ANON = 'sb_publishable_LVIRh3oSFP7gGSkQuCnBdg_eZ2SAB8g';

async function consulta(ruta) {
  const r = await fetch(`${SUPABASE}/rest/v1/${ruta}`, {
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}` }
  });
  if (!r.ok) throw new Error(`Supabase ${r.status} en ${ruta}`);
  return r.json();
}

async function catalogo() {
  const [negocios, listados, habitaciones, vehiculos] = await Promise.all([
    consulta('providers?select=*&verification_status=eq.approved'),
    consulta('listings?select=*,providers(business_name,slug)&status=eq.published'),
    consulta('room_types?select=*&status=eq.published'),
    consulta('vehicles?select=*&status=eq.published&is_approved=eq.true')
  ]);
  return {
    negocios: negocios.filter(n => n.slug),
    listados,
    habitaciones,
    vehiculos
  };
}

const esc = v => String(v == null ? '' : v)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/* Para meta description: una línea limpia, sin saltos ni comillas sueltas. */
const linea = (v, max = 160) => {
  const t = String(v || '').replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max - 1).replace(/[\s,;.]+\S*$/, '') + '…' : t;
};

module.exports = { consulta, catalogo, esc, linea, SUPABASE, ANON };
