# -*- coding: utf-8 -*-
"""Mete las carreteras principales en el detalle de un estado.

   Uso:  python3 vias.py tachira
   Lee  <estado>_vias.json  (salida cruda de Overpass, `out geom`)
   y reescribe  ../repos/clientes_tachirago/assets/mapa/<estado>-detalle.json
   añadiéndole la clave `vias`.
"""
import json, os, sys
from geo import dp

RANGO = {'motorway': 1, 'trunk': 1, 'primary': 2, 'secondary': 3}
TOL, DEC = 0.0007, 4          # la vía no necesita el detalle del contorno
# El script vive en <repo>/herramientas/mapa; el detalle, en <repo>/assets/mapa.
DESTINO = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                       '..', '..', 'assets', 'mapa')

def main(estado):
    crudo = json.load(open(estado + '_vias.json'))
    vias = []
    for w in crudo.get('elements', []):
        tags = w.get('tags') or {}
        r = RANGO.get(tags.get('highway'))
        if not r:
            continue
        g = [(p['lon'], p['lat']) for p in w.get('geometry') or []]
        if len(g) < 2:
            continue
        g = dp(g, TOL) if len(g) > 2 else g
        if len(g) < 2:
            continue
        vias.append({'n': tags.get('ref') or tags.get('name') or '',
                     'r': r,
                     'g': [[round(x, DEC), round(y, DEC)] for x, y in g]})
    # Primero las grandes: si alguna vez hay que recortar la lista, se
    # recorta por el final y lo que se pierde son las secundarias.
    vias.sort(key=lambda v: (v['r'], -len(v['g'])))

    ruta = os.path.join(DESTINO, estado + '-detalle.json')
    d = json.load(open(ruta))
    d['vias'] = vias
    json.dump(d, open(ruta, 'w'), ensure_ascii=False, separators=(',', ':'))
    print(estado, len(vias), 'vías ·', os.path.getsize(ruta) // 1024, 'KB')

if __name__ == '__main__':
    main(sys.argv[1])
