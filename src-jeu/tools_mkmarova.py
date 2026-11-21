# Marova Steppe : modèle 3D ORIGINAL du jeu, entièrement généré par ce script (aucun fichier 3D externe).
# Hyper-SUV « Mythique » dans le style Néon Rouillé : caisse en facettes, bas de caisse noir, toit flottant,
# barre lumineuse avant, bandeau arrière rouge, filets néon orange (#FF7A3D), jantes gunmetal à liseré néon.
# Repère du jeu : x = avant, y = haut, z = largeur ; sol à y = 0 ; roues tournant autour de z.
# Usage (depuis src-jeu/) : python tools_mkmarova.py  → model_marova.json / model_marova.bin  puis  python tools_embed.py marova
import json, math, numpy as np

def kf(pts):
    a = sorted(pts); xs = np.array([p[0] for p in a]); ys = np.array([p[1] for p in a])
    return lambda x: float(np.interp(x, xs, ys))
def lerp(a, b, t): return a + (b - a) * t

# ---------- proportions (m) ----------
X1, X0 = 2.38, -2.36                 # avant / arrière  → 4,74 m (hors sabot, diffuseur, sorties)
WX, WZ, WR, TW = 1.47, 0.835, 0.40, 0.30    # empattement 2,94 m, voie 1,67 m, roue Ø 0,80 m
RA = 0.47                            # rayon des passages de roue
PAINT = (184, 154, 94)               # #B89A5E, la couleur de la carte

YTOP = kf([(2.38, .88), (2.33, 1.00), (2.20, 1.07), (1.6, 1.12), (.95, 1.15), (.70, 1.28), (.35, 1.47), (.06, 1.60), (-.3, 1.65),
           (-1.0, 1.64), (-1.70, 1.58), (-1.95, 1.46), (-2.20, 1.24), (-2.30, 1.15), (-2.36, 1.07)])
BELT = kf([(2.38, .80), (2.30, .94), (2.0, 1.03), (.95, 1.08), (-1.7, 1.13), (-2.25, 1.10), (-2.36, 1.02)])
HW = kf([(2.38, .84), (2.33, .90), (2.25, .93), (2.0, .95), (-1.9, .95), (-2.25, .92), (-2.33, .86), (-2.36, .80)])
ROOF = kf([(2.38, 0), (1.05, 0), (.95, 1), (-2.20, 1), (-2.30, 0), (-2.36, 0)])
WT = kf([(.95, .84), (.06, .70), (-1.7, .68), (-2.2, .76), (-2.36, .76)])
YB0 = kf([(2.38, .44), (2.10, .35), (-2.05, .35), (-2.36, .46)])

def arch(x):
    y, fl = 0.0, 0.0
    for wx in (WX, -WX):
        d = abs(x - wx)
        if d <= RA: y = max(y, WR + math.sqrt(RA * RA - d * d))
        fl = max(fl, .035 * max(0.0, 1 - (d / (RA + .25)) ** 2))
    return y, fl

def sec(x):
    """Demi-section (z ≥ 0) à l'abscisse x : 9 points (z, y) du bas-centre au toit-centre."""
    yt, bl, hw, r, wt = YTOP(x), BELT(x), HW(x), ROOF(x), WT(x)
    ya, fl = arch(x); yb = max(YB0(x), ya)
    band = .16 if ya <= 0 else lerp(.16, .095, min(1.0, (ya - WR) / RA * 1.5))
    P0 = (0.0, yb); P1 = (hw - .07 + fl * .5, yb); P2 = (hw + fl, yb + band)
    y3 = max(bl - .07, P2[1] + .02); P3 = (hw + fl * .6 + .018, y3)
    y4 = max(bl, y3 + .02); P4 = (hw - .03, y4)
    y4b = y4 + .03; P4b = (hw - lerp(.045, .06, r), y4b)
    z5 = lerp(hw - .10, wt, r); y5 = max(lerp(yt - .025, yt - .05, r), y4b + .008); P5 = (z5, y5)
    z5b = lerp((hw - .10) * .55, wt - .06, r); y5b = max(lerp(yt - .008, y5 + .02, r), y5 + .004); P5b = (z5b, y5b)
    P6 = (0.0, max(yt, y5b + .002))
    return [P0, P1, P2, P3, P4, P4b, P5, P5b, P6]

def zone(j, xm):
    if j == 0: return 'under'
    if j == 1: return 'black'                                   # bas de caisse + élargisseurs d'ailes
    if j in (2, 3): return 'paint'
    if j == 4: return 'chrome' if -1.50 < xm < .92 else 'paint'  # jonc de ceinture
    if j == 5:
        if -.62 < xm < -.50: return 'black'                      # montant B noir
        if -1.48 < xm < .92: return 'glass'
        return 'paint'                                           # custode arrière pleine
    if j == 6: return 'black' if -1.70 < xm < .95 else 'paint'   # montants A + bord de toit noirs : toit « flottant »
    if j == 7:
        if .06 < xm < .95 or -2.20 < xm < -1.74: return 'glass'  # pare-brise, lunette
        return 'paint'
    return 'paint'

# ---------- matières ----------
MATS = {'paint': ('paint', PAINT, {'paint': 1}), 'black': ('body', (28, 28, 34), {}), 'under': ('body', (13, 13, 17), {}),
        'glass': ('glass', (10, 16, 26), {'tr': 1, 'a': .8, 'col': [.04, .07, .12]}), 'chrome': ('body', (178, 184, 196), {}),
        'grille': ('body', (18, 18, 24), {}), 'graph': ('body', (58, 60, 68), {}), 'plate': ('body', (226, 226, 214), {}),
        'head': ('body', (215, 240, 255), {'e': [.75, .85, .95]}), 'neon': ('body', (255, 122, 61), {'e': [.9, .38, .15]}),
        'tail': ('lightR', (220, 20, 34), {'e': [.5, .05, .08], 'tail': 1})}
G = {}
V3 = lambda *a: np.array(a, np.float64)
def tri(g, a, b, c, n=None): G.setdefault(g, []).append((np.asarray(a, float), np.asarray(b, float), np.asarray(c, float)) + ((n,) if n is not None else ()))
def quad(g, a, b, c, d): tri(g, a, b, c); tri(g, a, c, d)
def box(g, x0, x1, y0, y1, z0, z1):
    p = [V3(x, y, z) for x in (x0, x1) for y in (y0, y1) for z in (z0, z1)]
    for f in ((0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1), (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)): quad(g, *[p[i] for i in f])
def boxm(g, x0, x1, y0, y1, z0, z1):   # symétrique gauche / droite
    box(g, x0, x1, y0, y1, z0, z1); box(g, x0, x1, y0, y1, -z1, -z0)
def obox(g, c, u, v, w):               # boîte orientée : centre + 3 demi-axes
    c, u, v, w = map(np.asarray, (c, u, v, w)); p = [c + a * u + b * v + d * w for a in (-1, 1) for b in (-1, 1) for d in (-1, 1)]
    for f in ((0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1), (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)): quad(g, *[p[i] for i in f])
def cylx(g, cx, cy, cz, r, ln, n=10):  # cylindre d'axe x (sorties d'échappement)
    for k in range(n):
        a0, a1 = 2 * math.pi * k / n, 2 * math.pi * (k + 1) / n
        p = lambda a, x: V3(x, cy + r * math.cos(a), cz + r * math.sin(a))
        quad(g, p(a0, cx - ln / 2), p(a1, cx - ln / 2), p(a1, cx + ln / 2), p(a0, cx + ln / 2))
def surf_y(x, z):                      # hauteur du dessus de caisse (capot / toit) à (x, z)
    s = sec(x); top = s[5:]; z = abs(z)
    for a, b in zip(top[::-1][:-1], top[::-1][1:]):   # du centre vers le bord
        if a[0] <= z <= b[0]: return lerp(a[1], b[1], (z - a[0]) / max(1e-6, b[0] - a[0]))
    return top[0][1]

# ---------- caisse : lissage de sections ----------
xs = set(np.round(np.linspace(X1, X0, 44), 4).tolist())
xs |= {2.38, 2.36, 2.33, 2.30, 2.25, 2.20, 1.05, .95, .93, .92, .90, .70, .35, .06, .05, -.50, -.62, -1.68, -1.70, -1.74, -1.95, -2.20, -2.21, -2.25, -2.30, -2.33, -2.36}
for wx in (WX, -WX):
    xs |= set(np.round(wx + np.linspace(-RA, RA, 13), 4).tolist()); xs |= {round(wx + RA + .006, 4), round(wx - RA - .006, 4)}
xs = sorted(xs, reverse=True); dd = [xs[0]]
for x in xs[1:]:
    if dd[-1] - x > .003: dd.append(x)
xs = dd; S = [sec(x) for x in xs]
P3 = lambda x, p, sd: V3(x, p[1], p[0] * sd)
# ombrage lissé dans le sens de la longueur, arêtes nettes entre bandes (et aux marches des passages de roue)
def nz(v): l = np.linalg.norm(v); return v / l if l > 1e-12 else V3(0, 1, 0)
for j in range(8):
    for sd in (1, -1):
        Q = [(P3(xs[i], S[i][j], sd), P3(xs[i + 1], S[i + 1][j], sd), P3(xs[i + 1], S[i + 1][j + 1], sd), P3(xs[i], S[i][j + 1], sd)) for i in range(len(xs) - 1)]
        QN = [nz(np.cross(q[1] - q[0], q[2] - q[0]) + np.cross(q[2] - q[0], q[3] - q[0])) for q in Q]
        def vn(i, k):   # normale au sommet de la station i, vue depuis le quad k
            o = k - 1 if i == k else k + 1
            if 0 <= o < len(Q) and np.dot(QN[o], QN[k]) > .82: return nz(QN[o] + QN[k])
            return QN[k]
        for k, q in enumerate(Q):
            g = zone(j, (xs[k] + xs[k + 1]) / 2); na, nb = vn(k, k), vn(k + 1, k)
            tri(g, q[0], q[1], q[2], (na, nb, nb)); tri(g, q[0], q[2], q[3], (na, nb, na))
for x, s in ((xs[0], S[0]), (xs[-1], S[-1])):          # faces avant / arrière
    ring = [P3(x, p, 1) for p in s] + [P3(x, p, -1) for p in s[-2:0:-1]]
    c = sum(ring) / len(ring)
    for k in range(len(ring)): tri('paint', c, ring[k], ring[(k + 1) % len(ring)])
# doublure sombre derrière les vitres (on ne voit pas le vide de la caisse)
for a, b, c, *_ in list(G['glass']):
    m = (a + b + c) / 3; d = V3(m[0], .95, 0) - m; d = d / np.linalg.norm(d) * .06
    tri('under', a + d, b + d, c + d)
# fonds des passages de roue
for wx in (WX, -WX): boxm('under', wx - RA, wx + RA, .33, WR + RA + .01, .62, .64)

# ---------- face avant ----------
F = X1; NT = YTOP(X1) - .03                                              # haut de la face avant
box('black', F - .01, F + .008, .45, .56, -.70, .70)                    # prise d'air basse
box('grille', F - .01, F + .008, .575, NT - .115, -.44, .44)            # calandre
for y in (.62, .67, .72): box('graph', F, F + .011, y, y + .012, -.42, .42)   # lames de calandre
box('neon', F, F + .013, NT - .17, NT - .158, -.42, .42)                # filet néon de calandre
obox('chrome', (F + .014, NT - .135, 0), (.006, 0, 0), (0, .032, .032), (0, -.032, .032))   # losange Marova
boxm('grille', F - .005, F + .006, NT - .10, NT - .01, .46, .79)        # boîtiers d'optiques
boxm('head', F - .005, F + .011, NT - .085, NT - .03, .48, .77)         # phares LED
box('head', F - .005, F + .009, NT - .005, NT + .008, -.48, .48)        # barre lumineuse
boxm('neon', F - .005, F + .014, .455, .555, .56, .58)                  # crocs néon
box('graph', F - .20, F + .016, .42, .45, -.38, .38)                    # sabot

# ---------- face arrière ----------
R = X0
box('grille', R - .007, R + .005, .935, 1.01, -.76, .76)                # bandeau noir
box('tail', R - .013, R + .005, .95, .995, -.72, .72)                   # feu arrière intégral
boxm('tail', R - .013, R + .005, .87, .95, .64, .72)                    # retours en C
box('grille', R - .006, R + .005, .72, .83, -.19, .19)                  # logement de plaque
box('plate', R - .009, R + .005, .735, .815, -.17, .17)
box('black', R - .012, R + .10, .46, .62, -.68, .68)                    # diffuseur
box('neon', R - .016, R, .625, .635, -.60, .60)
for z in (-.2, 0, .2): box('graph', R - .03, R + .30, .42, .48, z - .012, z + .012)
for z in (-.42, -.30, .30, .42):
    cylx('chrome', R - .02, .53, z, .036, .08); cylx('under', R - .02, .53, z, .026, .082)

# ---------- toit, capot, rétros, flancs ----------
for sd in (1, -1):
    z = .56 * sd; y = max(surf_y(x, z) for x in np.linspace(-1.5, -.05, 12))
    box('black', -1.50, -.05, y + .045, y + .07, z - .018, z + .018)    # barres de toit
    for x in (-1.45, -.75, -.10): box('black', x - .025, x + .025, surf_y(x, z) - .01, y + .05, z - .015, z + .015)
yr = YTOP(-1.62) - .012
box('black', -1.90, -1.58, yr, yr + .03, -.70, .70)                      # becquet de toit
boxm('black', -1.90, -1.62, yr - .05, yr + .03, .68, .71)
box('tail', -1.92, -1.895, yr + .002, yr + .022, -.25, .25)              # 3e feu stop
ys = surf_y(-1.35, 0); obox('black', (-1.35, ys + .035, 0), (.08, -.012, 0), (0, .035, 0), (0, 0, .016))   # aileron d'antenne
for sd in (1, -1):
    y0 = surf_y(1.55, .3) - .004; box('black', 1.35, 1.72, y0, y0 + .016, *sorted((.20 * sd, .40 * sd)))   # ouïes de capot
    b = BELT(.8); hw = HW(.8)
    box('black', .70, .86, b + .02, b + .11, *sorted((sd * (hw - .02), sd * (hw + .12))))    # rétroviseurs
    box('black', .76, .82, b - .005, b + .03, *sorted((sd * (hw - .05), sd * (hw + .02))))
    box('neon', .72, .84, b + .012, b + .022, *sorted((sd * (hw + .06), sd * (hw + .121))))
    for x in (.93, -.56, -1.66):                                         # coupes des portes
        s = sec(x)
        for k in range(2, 4):
            p, q = s[k], s[k + 1]; o = .004
            quad('black', V3(x - .004, p[1], sd * (p[0] + o)), V3(x + .004, p[1], sd * (p[0] + o)), V3(x + .004, q[1], sd * (q[0] + o)), V3(x - .004, q[1], sd * (q[0] + o)))
    for x0 in (.15, -1.05):                                              # poignées affleurantes
        hw2 = HW(x0); bl = BELT(x0); box('chrome', x0, x0 + .15, bl - .105, bl - .085, *sorted((sd * (hw2 - .004), sd * (hw2 + .016))))
    yr2 = sec(0)[2][1]; box('neon', -.74, .74, yr2 - .008, yr2 + .006,*sorted((sd * (HW(0) + .002), sd * (HW(0) + .012))))  # filet néon de bas de caisse

# ---------- roues ----------
def lathe(out, prof, col, n=24, alt=None):
    for k in range(n):
        a0, a1 = 2 * math.pi * k / n, 2 * math.pi * (k + 1) / n; cc = alt if (alt and k % 2) else col
        for (r0, z0), (r1, z1) in zip(prof[:-1], prof[1:]):
            p = lambda r, z, a: V3(r * math.cos(a), r * math.sin(a), z)
            out.append(((p(r0, z0, a0), p(r1, z1, a0), p(r1, z1, a1)), cc)); out.append(((p(r0, z0, a0), p(r1, z1, a1), p(r0, z0, a1)), cc))
def wheel():
    T = []; h = TW / 2
    lathe(T, [(.272, -h), (.35, -h), (WR, -h + .035), (WR, h - .035), (.35, h), (.272, h)], (22, 22, 26), alt=(34, 34, 38))   # pneu (crampons alternés)
    lathe(T, [(.256, -.12), (.256, .14)], (40, 42, 48))                    # fût de jante
    lathe(T, [(0, -.10), (.256, -.10)], (26, 26, 30), n=12)                # fond
    lathe(T, [(.0, .02), (.215, .02)], (112, 114, 120), n=16)              # disque de frein
    lathe(T, [(.255, .147), (.277, .147)], (190, 196, 206))               # lèvre chromée
    lathe(T, [(.238, .143), (.249, .143)], (255, 122, 61))                # liseré néon
    lathe(T, [(0, .139), (.075, .139)], (190, 196, 206), n=8)             # cache-moyeu
    lathe(T, [(0, .141), (.026, .141)], (255, 122, 61), n=8)
    for k in range(5):                                                     # 5 doubles branches
        for da in (-.12, .12):
            a = 2 * math.pi * k / 5 + da; u = V3(math.cos(a), math.sin(a), 0); t = V3(-math.sin(a), math.cos(a), 0)
            c = u * .163 + V3(0, 0, .12); bx = []; obox_into = []
            pts = [c + sa * u * .088 + sb * t * .016 + sc * V3(0, 0, .016) for sa in (-1, 1) for sb in (-1, 1) for sc in (-1, 1)]
            for f in ((0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1), (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)):
                q = [pts[i] for i in f]; T.append(((q[0], q[1], q[2]), (88, 92, 104))); T.append(((q[0], q[2], q[3]), (88, 92, 104)))
    return T

# ---------- écriture au format v2 du jeu ----------
buf = bytearray(); parts = []
def put(arr, al):
    while len(buf) % al: buf.append(0)
    o = len(buf); buf.extend(arr.tobytes()); return o
def emit(kind, tris, cols, mat, wheel=None):
    V = np.array([p for t in tris for p in t[:3]], np.float32); nv = len(V); assert nv < 65536, (kind, nv)
    N = []
    for t in tris:
        a, b, c = t[:3]
        if len(t) > 3: N += list(t[3]); continue
        n = np.cross(b - a, c - a); l = np.linalg.norm(n); n = n / l if l > 1e-12 else np.array([0, 1, 0.]); N += [n] * 3
    n4 = np.zeros((nv, 4), np.int8); n4[:, :3] = np.clip(np.round(np.array(N) * 127), -127, 127).astype(np.int8)
    c4 = np.array([[c[0], c[1], c[2], 255] for c in cols for _ in range(3)], np.uint8)
    I = np.arange(nv, dtype=np.uint16)
    d = {'nv': nv, 'ni': nv, 'p': put(V.reshape(-1), 4), 'n': put(n4.reshape(-1), 1), 'i': put(I, 2), 'c': put(c4.reshape(-1), 1), 'k': kind, 'mat': mat}
    if wheel is not None: d['wheel'] = [round(float(v), 4) for v in wheel]
    parts.append(d)
for key in ['paint', 'black', 'under', 'glass', 'chrome', 'grille', 'graph', 'plate', 'head', 'neon', 'tail']:
    if key in G:
        kind, col, mat = MATS[key]; emit(kind, G[key], [col] * len(G[key]), mat)
W = wheel(); wheels = []
for wx in (-WX, WX):
    for wz in (-WZ, WZ):
        sd = 1 if wz > 0 else -1
        tris = [tuple(V3(p[0], p[1], p[2] * sd) for p in (t if sd > 0 else (t[0], t[2], t[1]))) for t, c in W]
        emit('wheel', tris, [c for t, c in W], {}, wheel=(wx, WR, wz)); wheels.append([wx, WR, wz, WR])
allP = np.vstack([np.array([p for t in G[k] for p in t[:3]]) for k in G])
pv = np.array([p for t in G['paint'] for p in t[:3]])
x0, x1 = float(allP[:, 0].min()), float(allP[:, 0].max()); L = x1 - x0
w = float(max(allP[:, 2].max(), WZ + TW / 2) * 2); h = float(allP[:, 1].max())
meta = {'v': 2, 'len': round(L, 3), 'x0': round(x0, 3), 'x1': round(x1, 3), 'w': round(w, 3), 'h': round(h, 3),
        'deck': round(float(pv[pv[:, 0] < x0 + .22 * L][:, 1].max()), 3), 'hood': round(float(pv[pv[:, 0] > x1 - .22 * L][:, 1].max()), 3),
        'wr': WR, 'wheels': wheels, 'parts': parts, 'images': [], 'src': 'original : tools_mkmarova.py'}
json.dump(meta, open('model_marova.json', 'w')); open('model_marova.bin', 'wb').write(buf)
print('marova :', len(parts), 'pièces,', sum(p['ni'] for p in parts) // 3, 'triangles,', len(buf) // 1024, 'Ko,', f"L {meta['len']} l {meta['w']} h {meta['h']} capot {meta['hood']} pavillon {meta['deck']}")
print({k: len(v) for k, v in G.items()}, 'roue :', len(W))
