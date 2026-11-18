# Copie out.html vers ../game/index.html en gardant l'en-tête PWA (manifest) et le service worker déjà présents dans game/index.html.
# Usage (depuis src-jeu/) : python3 mkgame.py
import os
D=os.path.dirname(os.path.abspath(__file__)); G=os.path.join(D,'..','game','index.html')
o=open(os.path.join(D,'out.html'),encoding='utf-8').read()
old=open(G,encoding='utf-8').read()
a=old.find('<link rel="manifest"'); b=old.find('<title>')
pwa=old[a:b]
assert '<title>' in o and 'manifest' not in o[:3000]
o=o.replace('<title>',pwa+'<title>',1)
sw=old[old.rfind('<script>if(\'serviceWorker\''):]
assert o.rstrip().endswith('</html>')
o=o[:o.rfind('</body>')]+sw if '</body>' in o else o
open(G,'w',encoding='utf-8').write(o); print('game/index.html écrit', len(o))
