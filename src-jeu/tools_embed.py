import sys, re, base64, json
mid=sys.argv[1]; f='models_new.html'; t=open(f,encoding='utf-8').read()
t=re.sub(r'<script type="text/plain" id="mdl-%s">.*?</script>'%mid,'',t,flags=re.S); t=re.sub(r'<script type="text/plain" id="bin-%s">.*?</script>'%mid,'',t,flags=re.S)
meta=open(f'model_{mid}.json',encoding='utf-8').read(); b=base64.b64encode(open(f'model_{mid}.bin','rb').read()).decode()
t=t.rstrip('\n')+f'\n<script type="text/plain" id="mdl-{mid}">{meta}</script>\n<script type="text/plain" id="bin-{mid}">{b}</script>\n'
open(f,'w',encoding='utf-8').write(t); print('ok',mid,len(meta)//1024,'Ko méta',len(b)//1024,'Ko binaire')
