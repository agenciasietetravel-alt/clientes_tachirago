# Las carreteras del mapa

El mapa dibuja el contorno fino del municipio, sus ríos y sus pueblos. Las
carreteras son la capa que falta: sin ellas el municipio es una mancha con
pueblos sueltos, y lo que de verdad ubica a alguien es por dónde se llega.

El código del portal ya las dibuja. Lo único que falta son los datos.

## Cómo traerlas

```bash
cd herramientas/mapa
./traer-vias.sh                 # baja de OpenStreetMap los tres estados
python3 vias.py tachira
python3 vias.py merida
python3 vias.py trujillo
```

`traer-vias.sh` deja `<estado>_vias.json` en el directorio actual. `vias.py`
lo simplifica y lo mete como clave `vias` dentro de
`repos/clientes_tachirago/assets/mapa/<estado>-detalle.json`.

## Qué se trae y qué no

Solo `motorway`, `trunk`, `primary` y `secondary`. Las calles locales
saturarían el dibujo sin ayudar a ubicarse. Cada vía guarda su rango —1 para
autopista y troncal, 2 primaria, 3 secundaria— y el portal pinta tres
grosores a partir de ahí.

## Si falla

El 26 de octubre de 2026 ningún servidor de Overpass aceptaba conexiones
desde la máquina de desarrollo, aunque `openstreetmap.org` respondía con
normalidad: parece un bloqueo de salida hacia esos servidores concretos, no
una caída. El portal funciona igual sin el archivo: si el detalle no trae
`vias`, no se dibuja ninguna y no hay error.

Espejos alternativos, por si el principal sigue sin responder:
`overpass.kumi.systems`, `overpass.private.coffee`, `overpass.osm.jp`.
Cuidado con `overpass.osm.ch`: responde 200 pero su base está vacía, así que
devuelve cero elementos sin dar ningún error.
