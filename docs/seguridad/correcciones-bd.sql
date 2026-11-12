-- Correcciones de seguridad de la base de datos
-- Andes GOO! — propuesta del 12 de noviembre de 2026
--
-- NO SE HA APLICADO NADA. Esto es la propuesta para revisar antes de
-- ejecutarla, según la regla de no tocar la base sin enseñar primero.
--
-- Sale del analizador de seguridad de Supabase. Ninguna de estas tres cosas
-- es un agujero abierto hoy, pero las tres son la clase de detalle por el
-- que se entra cuando mañana cambie otra cosa.

-- ---------------------------------------------------------------------
-- 1) Dos vistas consultan con los permisos de quien las creó
--
-- `catalogo_ranking` y `micrositios` son SECURITY DEFINER: quien las lee ve
-- lo que vería su creador, saltándose su propio RLS. Hoy solo enseñan cosas
-- publicadas, así que no se filtra nada; el riesgo es el día que una tabla
-- de debajo pase a tener datos privados.
--
-- `security_invoker` hace que la vista consulte con los permisos de quien
-- pregunta, que es lo que se espera de ella.
--
-- COMPROBAR ANTES: que el portal de proveedores y el panel de admin siguen
-- viendo las mismas filas. Si alguno deja de ver algo, es que dependía del
-- salto de permisos y hay que darle su política de RLS.

alter view public.catalogo_ranking set (security_invoker = true);
alter view public.micrositios      set (security_invoker = true);

-- ---------------------------------------------------------------------
-- 2) Dos funciones sin ruta de búsqueda fija
--
-- `galeria_valida` y `paleta_valida` no fijan `search_path`. En una función
-- que valida lo que entra en la base, eso permite que alguien con permiso
-- de crear objetos coloque una tabla o un operador con el mismo nombre en
-- un esquema que se mire antes, y cambie lo que la función decide.
--
-- Las dos son IMMUTABLE y no son SECURITY DEFINER, así que el riesgo real
-- hoy es bajo. Fijar la ruta cuesta una línea.

alter function public.galeria_valida(jsonb) set search_path = public, pg_temp;
alter function public.paleta_valida(jsonb)  set search_path = public, pg_temp;

-- ---------------------------------------------------------------------
-- 3) Dieciséis tablas con RLS activo y ninguna política
--
-- Son las del sistema de facturación (`fact_*`) y las de notificaciones
-- (`push_*`). RLS activo sin políticas significa "nadie entra", así que
-- están cerradas, no abiertas: el aviso es informativo.
--
-- NO SE TOCAN. Si alguna de ellas tiene que ser legible por alguien, hay
-- que escribirle su política a propósito, no abrirla en bloque.

-- ---------------------------------------------------------------------
-- 4) Fuera de SQL, en el panel de Supabase
--
--   Authentication → Providers → Password
--     · Activar "Leaked password protection" (compara contra HaveIBeenPwned)
--     · Exigir un mínimo de 10 caracteres
--   Authentication → Multi-Factor
--     · Activar TOTP, al menos para la cuenta de administrador
