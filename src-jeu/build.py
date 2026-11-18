# Assemble out.html à partir de orig.html + main.js (produit par patch5.py) + CSS + modèles 3D.
# Usage (depuis src-jeu/) : python3 patch5.py && python3 build.py
import re, os
D=os.path.dirname(os.path.abspath(__file__)); P=lambda n: os.path.join(D,n)
src=open(P('orig.html'),encoding='utf-8').read()
i=src.rfind('<script>'); e=src.find('</script>',i)
js=open(P('main.js'),encoding='utf-8').read()
head=src[:i]
css=''.join(open(P(n),encoding='utf-8').read() for n in ['extra.css','extra3.css','extra4.css','extra5.css','extra6.css'])
css=re.sub(r'/\*.*?\*/','',css,flags=re.S); css=re.sub(r'\n\s*','',css)
k=head.find('</style>'); assert k>0
head=head[:k]+css+head[k:]
out=head+open(P('models_new.html'),encoding='utf-8').read()+'<script>'+js+src[e:]
open(P('out.html'),'w',encoding='utf-8').write(out); print(round(len(out)/1e6,2),'Mo')
