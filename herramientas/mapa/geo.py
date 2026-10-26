# -*- coding: utf-8 -*-
"""Piezas compartidas del mapa: armar anillos, simplificar y medir."""
import math, sys
sys.setrecursionlimit(200000)

def anillos(rel):
    """Une los 'way' de rol outer en anillos cerrados."""
    trozos = []
    for m in rel.get('members', []):
        if m.get('type') != 'way' or m.get('role') not in ('outer', ''):
            continue
        g = [(p['lon'], p['lat']) for p in m.get('geometry') or []]
        if len(g) > 1: trozos.append(g)
    salida = []
    while trozos:
        act = trozos.pop(0)
        cambio = True
        while cambio and act[0] != act[-1]:
            cambio = False
            for i, t in enumerate(trozos):
                if t[0] == act[-1]:   act = act + t[1:];       trozos.pop(i); cambio=True; break
                if t[-1] == act[-1]:  act = act + t[::-1][1:]; trozos.pop(i); cambio=True; break
                if t[-1] == act[0]:   act = t[:-1] + act;      trozos.pop(i); cambio=True; break
                if t[0] == act[0]:    act = t[::-1][:-1] + act;trozos.pop(i); cambio=True; break
        if len(act) >= 4: salida.append(act)
    return salida

def dp(pts, tol):
    if len(pts) < 3: return pts
    dmax, idx = 0.0, 0
    x1,y1 = pts[0]; x2,y2 = pts[-1]
    dx, dy = x2-x1, y2-y1
    den = math.hypot(dx, dy) or 1e-12
    for i in range(1, len(pts)-1):
        x0,y0 = pts[i]
        d = abs(dy*x0 - dx*y0 + x2*y1 - y2*x1) / den
        if d > dmax: dmax, idx = d, i
    if dmax > tol:
        return dp(pts[:idx+1], tol)[:-1] + dp(pts[idx:], tol)
    return [pts[0], pts[-1]]

def dp_anillo(r, tol):
    """DP sobre un anillo cerrado: hay que partirlo en dos cadenas, porque con
       el primer y el último punto iguales la recta de referencia mide cero."""
    a = r[:-1] if r[0] == r[-1] else r[:]
    if len(a) < 4: return r
    x0, y0 = a[0]
    k = max(range(1, len(a)), key=lambda i: (a[i][0]-x0)**2 + (a[i][1]-y0)**2)
    return dp(a[:k+1], tol)[:-1] + dp(a[k:] + [a[0]], tol)

def area(r):
    a = 0.0
    for i in range(len(r)-1):
        a += r[i][0]*r[i+1][1] - r[i+1][0]*r[i][1]
    return abs(a)/2

def dentro(p, anillo):
    x, y = p; n = len(anillo); d = False; j = n-1
    for i in range(n):
        xi, yi = anillo[i]; xj, yj = anillo[j]
        if (yi > y) != (yj > y) and x < (xj-xi)*(y-yi)/(yj-yi+1e-18)+xi: d = not d
        j = i
    return d
