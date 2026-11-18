# Convertit un .glb de voiture en modèle « v2 » du jeu (couleurs par sommet, pièces décimées, roues séparées).
# Usage : python tools_glb2v2.py <id> <fichier.glb> <longueur en m> [--flip] [--rot 90]  → écrit model_<id>.json / model_<id>.bin (+ résumé)
import sys, re, json, base64, numpy as np, trimesh, fast_simplification as fs

DROP = re.compile(r'seat|interior|inside|inner|steer|stering|chair|speaker|button|board|liver|carpet|bottom|chassis|screw|logo|badge|mirror|blask|map', re.I)
WHEELRE = re.compile(r'tire|tyre|wheel|rim|hub|brake|break|mettal|metal|chrome|black_metal', re.I)
GLASSRE = re.compile(r'glass', re.I)
LIGHTRE = re.compile(r'light|lamp|bulb|taillight', re.I)

def mat_color(m, name):
    n = name.lower()
    if 'tire' in n or 'tyre' in n: return (22, 22, 26)
    if 'chrome' in n or 'mettal' in n or 'metal' in n and 'black' not in n: return (185, 190, 200)
    if 'black' in n or 'plastic' in n and 'red' not in n and 'white' not in n and 'blue' not in n: return (24, 24, 28)
    c = getattr(m, 'baseColorFactor', None)
    if c is not None and not (len(c) >= 3 and c[0] == c[1] == c[2] == 0 and 'light' in n):
        return tuple(int(x) for x in c[:3])
    t = getattr(m, 'baseColorTexture', None)
    if t is not None:
        a = np.asarray(t.convert('RGB').resize((8, 8))).reshape(-1, 3).mean(0); return tuple(int(x) for x in a)
    return (150, 150, 160)

def dec(V, F, target):
    V = np.asarray(V, np.float64); F = np.asarray(F)
    if len(F) <= target: return V.astype(np.float32), F.astype(np.int32)
    # 1) soudure des sommets proches (grille de 1,2 cm) : relie les panneaux et enlève les doublons qui bloquent la décimation
    for cell in (0.012, 0.02, 0.035, 0.06):
        Q = np.round(V / cell) * cell
        tm = trimesh.Trimesh(Q, F, process=False); tm.merge_vertices(); tm.update_faces(tm.nondegenerate_faces()); tm.remove_unreferenced_vertices()
        V2, F2 = np.asarray(tm.vertices), np.asarray(tm.faces)
        if len(F2) <= target: return V2.astype(np.float32), F2.astype(np.int32)
        for agg in (7, 10):
            v3, f3 = fs.simplify(V2.astype(np.float32), F2.astype(np.int32), target_count=int(max(24, target)), agg=agg)
            if len(f3) <= target * 1.3: return v3.astype(np.float32), f3.astype(np.int32)
        V, F = V2, F2
        if len(F) <= target * 1.3: return V.astype(np.float32), F.astype(np.int32)
    return v3.astype(np.float32), f3.astype(np.int32)
def main():
    mid, path, L = sys.argv[1], sys.argv[2], float(sys.argv[3]); flip = '--flip' in sys.argv; rot = None
    if '--rot' in sys.argv: rot = float(sys.argv[sys.argv.index('--rot') + 1])
    sc = trimesh.load(path, force='scene'); items = []
    for node in sc.graph.nodes_geometry:
        T, gn = sc.graph[node]; g = sc.geometry[gn]; m = getattr(g.visual, 'material', None); name = getattr(m, 'name', None) or 'x'
        V = trimesh.transform_points(g.vertices, T); items.append(dict(name=name, mat=m, V=V, F=np.asarray(g.faces), node=node))
    allV = np.vstack([i['V'] for i in items]); mn, mx = allV.min(0), allV.max(0); ext = mx - mn
    # axe de longueur = plus grand axe horizontal (x ou z) ; y = hauteur
    ax = 0 if ext[0] >= ext[2] else 2
    def R_to_x(V, ang):  # rotation autour de Y
        c, s = np.cos(ang), np.sin(ang); out = V.copy(); out[:, 0] = V[:, 0] * c + V[:, 2] * s; out[:, 2] = -V[:, 0] * s + V[:, 2] * c; return out
    ang = np.radians(rot) if rot is not None else (0.0 if ax == 0 else np.radians(90))   # z→x : x' = z
    if flip: ang += np.pi
    for it in items: it['V'] = R_to_x(it['V'], ang)
    # échelle : longueur de la carrosserie (matériaux non supprimés)
    keep = [i for i in items if not DROP.search(i['name'])]
    kV = np.vstack([i['V'] for i in keep]); kx0, kx1 = kV[:, 0].min(), kV[:, 0].max(); s = L / (kx1 - kx0)
    for it in items: it['V'] = it['V'] * s
    # sens : le pare-brise (verre) est en général plus près de l'arrière que du centre : si ce n'est pas le cas, on retourne
    gl = [i for i in items if GLASSRE.search(i['name'])]
    if gl:
        gv = np.vstack([i['V'] for i in gl]); mid_x = (np.vstack([i['V'] for i in keep])[:, 0].min() + np.vstack([i['V'] for i in keep])[:, 0].max()) / 2
        print('verre : centre x', round(gv[:, 0].mean(), 2), 'carrosserie : centre x', round(mid_x, 2), '(le verre doit être vers l’arrière = x négatif)')
    # roues : composantes connexes du matériau « tire »
    tires = []
    for it in items:
        if re.search(r'tire|tyre', it['name'], re.I):
            tm = trimesh.Trimesh(it['V'], it['F'], process=False); tm.merge_vertices(); tires += tm.split(only_watertight=False)
    tires = [t for t in tires if len(t.faces) > 40]
    print('composantes de pneus :', len(tires))
    cents = []
    for t in tires:
        b = t.bounds; cents.append(((b[0] + b[1]) / 2, (b[1][1] - b[0][1]) / 2, b[1][2] - b[0][2]))
    cents = sorted(cents, key=lambda c: -c[1])[:4]
    if len(cents) < 4: print('!! moins de 4 roues trouvées', len(cents)); sys.exit(1)
    W4 = np.array([c[0] for c in cents]); Rw = float(np.mean([c[1] for c in cents]))
    # recentrage : x = milieu des essieux, z = milieu des roues, y = bas des pneus
    ox = W4[:, 0].mean(); oz = W4[:, 2].mean(); oy = min(t.bounds[0][1] for t in tires)
    off = np.array([ox, oy, oz])
    for it in items: it['V'] = it['V'] - off
    W4 = W4 - off
    wheels_sorted = sorted([tuple(w) for w in W4], key=lambda w: (round(w[0] / 0.5), w[2]))
    wheels = [np.array(w) for w in wheels_sorted]
    # classification des composantes
    groups = {}; wheelparts = [dict(tire=[], rim=[]) for _ in range(4)]
    def add(key, col, V, F, extra=None): groups.setdefault((key, col), []).append((V, F))
    for it in items:
        nm = it['name']
        if DROP.search(nm): continue
        col = mat_color(it['mat'], nm); V, F = it['V'], it['F']
        if GLASSRE.search(nm): add('glass', (8, 13, 23), V, F); continue
        tm = trimesh.Trimesh(V, F, process=False); tm.merge_vertices()
        comps = tm.split(only_watertight=False) if WHEELRE.search(nm) or LIGHTRE.search(nm) else [tm]
        for c in comps:
            cen = c.vertices.mean(0)
            if WHEELRE.search(nm):
                j = int(np.argmin([np.hypot(cen[0] - w[0], cen[1] - w[1]) + abs(cen[2] - w[2]) * 0.6 for w in wheels]))
                w = wheels[j]
                if np.hypot(cen[0] - w[0], cen[1] - w[1]) < Rw * 1.0 and abs(cen[2] - w[2]) < 0.45:
                    wheelparts[j]['tire' if re.search(r'tire|tyre', nm, re.I) else 'rim'].append((c.vertices, c.faces, col)); continue
            if LIGHTRE.search(nm):
                if cen[0] < 0: add('tail', (210, 20, 30), c.vertices, c.faces)
                else: add('body', (235, 235, 220), c.vertices, c.faces)
                continue
            add('paint' if re.search(r'carpaint|car_body|body_in|paint', nm, re.I) else 'body', col, c.vertices, c.faces)
    # budgets de triangles
    Q = float(sys.argv[sys.argv.index('--q') + 1]) if '--q' in sys.argv else 1.0
    BUD = {'paint': int(6000 * Q), 'glass': int(600 * Q), 'tail': int(200 * Q)}
    parts = []; buf = bytearray(); P = []
    def put(arr, align):
        while len(buf) % align: buf.append(0)
        o = len(buf); buf.extend(arr.tobytes()); return o
    def emit(kind, V, F, col, mat, wheel=None, center=None):
        V = V.astype(np.float32);
        if center is not None: V = V - center.astype(np.float32)
        tm = trimesh.Trimesh(V, F, process=False); N = tm.vertex_normals
        nv = len(V); n4 = np.zeros((nv, 4), np.int8); n4[:, :3] = np.clip(np.round(N * 127), -127, 127).astype(np.int8)
        if isinstance(col, list): c4 = np.asarray(col, np.uint8)
        else: c4 = np.tile(np.array([col[0], col[1], col[2], 255], np.uint8), (nv, 1))
        p = put(V.reshape(-1), 4); n = put(n4.reshape(-1), 1); i = put(F.astype(np.uint16).reshape(-1), 2); c = put(c4.reshape(-1), 1)
        d = {'nv': nv, 'ni': int(len(F) * 3), 'p': p, 'n': n, 'i': i, 'c': c, 'k': kind, 'mat': mat}
        if wheel is not None: d['wheel'] = [round(float(x), 4) for x in wheel]
        P.append(d)
    def merge(lst):
        V, F, o = [], [], 0
        for v, f in lst: V.append(v); F.append(np.asarray(f) + o); o += len(v)
        V = np.vstack(V); F = np.vstack(F)
        tm = trimesh.Trimesh(V, F, process=True); tm.merge_vertices(); return np.asarray(tm.vertices), np.asarray(tm.faces)
    tot = sum(len(f) for lst in groups.values() for v, f in lst)
    # pièces de carrosserie
    bodyF = sum(len(f) for (k, c), lst in groups.items() if k == 'body' for v, f in lst)
    for (key, col), lst in sorted(groups.items(), key=lambda kv: -sum(len(f) for v, f in kv[1])):
        V, F = merge(lst); nf0 = len(F)
        if key == 'paint': tgt = BUD['paint']
        elif key == 'glass': tgt = BUD['glass']
        elif key == 'tail': tgt = BUD['tail']
        else: tgt = int(min(nf0, max(40, 2200 * Q * nf0 / max(1, bodyF))))
        V, F = dec(V, F, tgt)
        if key == 'paint': emit('paint', V, F, (38, 40, 54) if sum(col) < 40 else col, {'paint': 1})
        elif key == 'glass': emit('glass', V, F, col, {'tr': 1, 'a': 0.82, 'col': [0.03, 0.05, 0.09]})
        elif key == 'tail': emit('lightR', V, F, col, {'e': [0.5, 0.05, 0.08], 'tail': 1})
        else: emit('body', V, F, col, {})
    for j, wp in enumerate(wheelparts):
        cols, Vs, Fs, o = [], [], [], 0
        for kind, tgt in (('tire', int(260 * Q)), ('rim', int(300 * Q))):
            if not wp[kind]: continue
            V, F = merge([(v, f) for v, f, c in wp[kind]]); V, F = dec(V, F, tgt); col = wp[kind][0][2]; col = (22, 22, 26) if kind == 'tire' else (185, 190, 200)
            Vs.append(V); Fs.append(F + o); cols.append(np.tile(np.array([col[0], col[1], col[2], 255], np.uint8), (len(V), 1))); o += len(V)
        if Vs: emit('wheel', np.vstack(Vs), np.vstack(Fs), np.vstack(cols).tolist(), {}, wheel=wheels[j], center=wheels[j])
    allv = np.vstack([np.frombuffer(buf, np.float32, count=d['nv'] * 3, offset=d['p']).reshape(-1, 3) + (np.array(d['wheel']) if 'wheel' in d else 0) for d in P])
    pv = [np.frombuffer(buf, np.float32, count=d['nv'] * 3, offset=d['p']).reshape(-1, 3) for d in P if d['k'] == 'paint'][0]
    x0, x1 = float(allv[:, 0].min()), float(allv[:, 0].max()); h = float(allv[:, 1].max()); w = float(allv[:, 2].max() - allv[:, 2].min())
    front = pv[pv[:, 0] > x1 - 0.22 * (x1 - x0)]; rear = pv[pv[:, 0] < x0 + 0.22 * (x1 - x0)]
    meta = {'v': 2, 'len': round(x1 - x0, 3), 'x0': round(x0, 3), 'x1': round(x1, 3), 'w': round(w, 3), 'h': round(h, 3), 'deck': round(float(rear[:, 1].max()), 3), 'hood': round(float(front[:, 1].max()), 3), 'wr': round(Rw, 3),
            'wheels': [[round(float(w_[0]), 3), round(float(w_[1]), 3), round(float(w_[2]), 3), round(Rw, 3)] for w_ in wheels], 'parts': P, 'images': []}
    json.dump(meta, open(f'model_{mid}.json', 'w')); open(f'model_{mid}.bin', 'wb').write(buf)
    ntri = sum(d['ni'] // 3 for d in P)
    print([(d['k'], d['ni'] // 3) for d in P])
    print(f'{mid}: {len(P)} pièces, {ntri} triangles, binaire {len(buf)//1024} Ko (≈ {len(buf)*4//3//1024} Ko en base64), len {meta["len"]} m, larg {meta["w"]}, haut {meta["h"]}, roues r={Rw:.3f}')
    print('wheels', meta['wheels'])
main()
