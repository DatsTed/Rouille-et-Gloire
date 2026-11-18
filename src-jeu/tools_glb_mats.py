import sys, trimesh, numpy as np, collections
sc=trimesh.load(sys.argv[1],force='scene')
G=collections.OrderedDict()
for node in sc.graph.nodes_geometry:
    T,gn=sc.graph[node]; g=sc.geometry[gn]; V=trimesh.transform_points(g.vertices,T); m=getattr(g.visual,'material',None)
    key=getattr(m,'name',None) or str(id(m))
    d=G.setdefault(key,{'f':0,'n':0,'mn':np.array([1e9]*3),'mx':np.array([-1e9]*3),'col':None,'tex':None,'alpha':None,'meshes':[]})
    d['f']+=len(g.faces); d['n']+=1; d['mn']=np.minimum(d['mn'],V.min(0)); d['mx']=np.maximum(d['mx'],V.max(0)); d['meshes'].append(node)
    c=getattr(m,'baseColorFactor',None); d['col']=None if c is None else [int(x) for x in c]; t=getattr(m,'baseColorTexture',None); d['tex']=None if t is None else t.size; d['alpha']=getattr(m,'alphaMode',None)
print('triangles',sum(d['f'] for d in G.values()),'materials',len(G))
for k,d in sorted(G.items(),key=lambda kv:-kv[1]['f']): print(f"{k[:34]:34s} f={d['f']:7d} n={d['n']:3d} col={d['col']} tex={d['tex']} a={d['alpha']} min={d['mn'].round(2).tolist()} max={d['mx'].round(2).tolist()} ex={d['meshes'][0][:22]}")
b=sc.bounds; print('bounds',b.round(2).tolist())
