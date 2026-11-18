# Inspecte un .glb : scène, nœuds, géométries, matériaux, triangles. Usage : python tools_glb_dump.py fichier.glb
import sys, trimesh, numpy as np
sc = trimesh.load(sys.argv[1], force='scene')
print('géométries:', len(sc.geometry), ' nœuds:', len(sc.graph.nodes_geometry))
tot = 0; rows = []
for node in sc.graph.nodes_geometry:
    T, gname = sc.graph[node]; g = sc.geometry[gname]; V = trimesh.transform_points(g.vertices, T)
    mat = getattr(g.visual, 'material', None); mname = getattr(mat, 'name', None)
    col = getattr(mat, 'baseColorFactor', None); tex = getattr(mat, 'baseColorTexture', None)
    rows.append((node, gname, len(g.faces), V.min(0).round(2).tolist(), V.max(0).round(2).tolist(), mname, None if col is None else list(col), tex.size if tex is not None else None, getattr(mat,'alphaMode',None)))
    tot += len(g.faces)
for r in sorted(rows, key=lambda r: -r[2])[:60]: print(r)
b = sc.bounds; print('triangles total:', tot, ' bounds:', b.round(2).tolist(), ' taille:', (b[1]-b[0]).round(2).tolist())
