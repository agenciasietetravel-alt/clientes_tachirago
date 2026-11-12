# Andes GOO! — Controles de seguridad

**Qué es este documento.** La lista de controles técnicos que están puestos
en la plataforma, con la referencia del control de **ISO/IEC 27002:2022**
al que corresponde cada uno.

**Lo que este documento no es.** No es un certificado ISO 27001 ni dice que
la empresa lo tenga. ISO/IEC 27001 certifica un *sistema de gestión* —
políticas firmadas, responsables con nombre, análisis de riesgos, registro
de incidentes, formación y una auditoría externa que lo revisa cada año—,
no un sitio web. Lo que sí se puede hacer desde el código es implantar los
controles técnicos del anexo, y eso es lo que está aquí, para que el día
que se busque la certificación esta parte ya esté hecha y documentada.

Última revisión: 12 de noviembre de 2026.

---

## 1. Qué protege la plataforma

| Dato | Dónde vive | Quién puede verlo |
|---|---|---|
| Nombre, teléfono y correo del viajero | `travel_quotes`, reservas | El proveedor de esa reserva y el administrador |
| Cédula del viajero | reservas | Igual |
| Documentos de proveedores y vehículos | Almacenamiento privado | Su titular y el equipo de verificación |
| Datos de cobro del proveedor | `providers` | El propio proveedor y el administrador |
| Comprobantes de pago | Almacenamiento privado | El proveedor de esa reserva y el administrador |

La plataforma **no guarda números de tarjeta**: el pago se acredita con un
comprobante que sube el viajero.

---

## 2. Controles implantados

### Transporte y cabeceras — ISO/IEC 27002 §8.20, §8.24

| Control | Cómo está |
|---|---|
| HTTPS obligatorio | Certificado de Vercel + redirección automática |
| HSTS | `max-age=63072000; includeSubDomains; preload` (2 años) |
| Forzar subida de recursos a HTTPS | `upgrade-insecure-requests` en la CSP |
| Política de contenido (CSP) | Scripts solo de este dominio y de cdnjs; conexiones solo a la base de datos propia; `object-src 'none'`; `base-uri 'self'` |
| Protección contra enmarcado | `frame-ancestors 'self'` + `X-Frame-Options: SAMEORIGIN` |
| Envío de formularios | `form-action 'self'` |
| Adivinación de tipo de archivo | `X-Content-Type-Options: nosniff` |
| Fuga por referente | `Referrer-Policy: strict-origin-when-cross-origin` |
| Aislamiento de ventana | `Cross-Origin-Opener-Policy: same-origin` |
| Permisos del navegador | Cámara, micrófono, pago, USB y sensores denegados |

### Control de acceso a los datos — §5.15, §5.18, §8.3

- **Row Level Security activo en las 64 tablas.** Cada proveedor solo lee y
  escribe lo suyo; el viajero sin sesión solo ve lo publicado.
- Las operaciones sensibles (reservar, cancelar, liquidar) no son escrituras
  directas: pasan por funciones del servidor que comprueban quién llama.
- El panel de administración tiene un solo administrador y la función que
  permite reclamarlo **se cierra en cuanto existe uno**: ya existe, así que
  está cerrada.
- La clave que viaja en el navegador es la **publicable**, diseñada para ser
  pública; lo que protege los datos es RLS, no esconder esa clave. La clave
  de servicio no está en ningún archivo del cliente.

### Entrada de datos — §8.26, §8.28

- **Validación de forma** en todo formulario de contacto: nombre de 3 a 80
  caracteres y sin enlaces, teléfono de 7 a 20 dígitos, correo con forma de
  correo.
- **Campo trampa** invisible y fuera del tabulador en los tres formularios
  públicos: lo que lo rellena es un robot.
- **Reloj**: un envío en menos de 2,5 segundos desde que se abrió el
  formulario se rechaza.
- **Tope de seis envíos por hora y navegador.**
- La base valida por su cuenta lo que entra en los campos JSON (galerías y
  paletas de los micrositios), así que un cliente alterado tampoco puede
  meter basura.

### Datos personales y consentimiento — §5.34

- La página **no pone cookies propias**. La sesión usa el almacenamiento del
  navegador, que es lo imprescindible para funcionar.
- La medición está **apagada hasta que alguien la acepta**, y el aviso solo
  aparece si hay medición configurada. Sin consentimiento no se carga nada.
- La política de privacidad dice qué se recoge, para qué, con quién se
  comparte, cuánto se guarda y cómo pedir su borrado.

### Registro y respuesta — §5.24, §8.15, §8.16

- Vercel guarda el registro de peticiones; Supabase, el de consultas y
  autenticación.
- `booking_events` guarda el historial de cada cambio de estado de una
  reserva, una fila por cambio y sin editar nunca: eso es lo que permite
  reconstruir qué pasó en una disputa.
- Los avisos del analizador de seguridad de Supabase se revisan: el informe
  del 12 de noviembre de 2026 está en este mismo documento, abajo.

### Continuidad — §8.13

- Copias automáticas diarias de la base en Supabase.
- El código vive en Git: cualquier despliegue se puede revertir al anterior
  desde Vercel en un clic.

---

## 3. Lo que falta, con nombre

Esto no está hecho y hay que decirlo:

1. **Protección de contraseñas filtradas** desactivada en Supabase Auth. Se
   activa con un interruptor en el panel y comprueba contra HaveIBeenPwned.
2. **Dos vistas con `SECURITY DEFINER`** (`catalogo_ranking`, `micrositios`):
   consultan con los permisos de quien las creó, no de quien pregunta.
3. **Dos funciones sin `search_path` fijo** (`galeria_valida`,
   `paleta_valida`).
4. **Segundo factor** para el administrador: no está.
5. **Sin inventario de activos ni responsable de seguridad nombrado**, que
   es lo primero que pide una auditoría ISO 27001 de verdad.
6. **Sin procedimiento escrito de respuesta a incidentes.**

---

## 4. Si pasa algo

Mientras no haya un procedimiento formal, el mínimo viable:

1. Revertir el despliegue en Vercel al anterior que funcionaba.
2. Rotar las claves de Supabase desde el panel del proyecto.
3. Mirar los registros de Supabase para ver qué se consultó y desde dónde.
4. Si hay datos personales afectados, avisar a las personas afectadas.
