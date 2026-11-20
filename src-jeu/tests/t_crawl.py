# Audit automatique de l'interface : ouvre chaque onglet, clique sur chaque bouton [data-a] (et ceux des fiches ouvertes, 2e niveau),
# relève les erreurs JS, les débordements horizontaux et les textes coupés. Joueur « complet » (niv. 30, adulte, toutes les voitures, crédits).
# Usage (depuis src-jeu/) : python -X utf8 tests/t_crawl.py [largeur hauteur] [--shots dossier]
import asyncio, os, sys, json
from playwright.async_api import async_playwright
W, H = (int(sys.argv[1]), int(sys.argv[2])) if len(sys.argv) > 2 and sys.argv[1].isdigit() else (390, 844)
SHOTS = sys.argv[sys.argv.index('--shots') + 1] if '--shots' in sys.argv else None
SETUP = r"""()=>{ S=fresh(); Object.assign(S,{intro:true,tuto:true,tutoDone:true,charte:1,age18:true,lvl:30,cr:9000000,tok:999,nitro:60,niveau10CinematicSeen:true,seenVer:GAME_VER,neo:500000});
  try{ CARS.forEach(m=>{ if(!S.cars.some(c=>c.mid===m.id)) S.cars.push({uid:S.nuid++,mid:m.id,etat:100,xp:0,lvl:12,up:{},inv:0,mods:{},sh:0}); }); }catch(e){}
  try{ save(); }catch(e){} view='garage'; render(); document.querySelectorAll('[id*=splash],.splash,#upd').forEach(e=>e.remove());
  window.__E=[]; window.addEventListener('error',e=>__E.push('err: '+(e.message||e)+' @'+(e.filename||'').split('/').pop()+':'+e.lineno)); const ce=console.error; console.error=function(){ __E.push('console: '+[].map.call(arguments,a=>a&&a.stack?String(a.stack).split('\n').slice(0,2).join(' '):String(a)).join(' ').slice(0,300)); return ce.apply(console,arguments); };
  window.addEventListener('unhandledrejection',e=>__E.push('promise: '+String(e.reason&&e.reason.stack||e.reason).slice(0,300)));
  return TABS.filter(t=>typeof tabOk!=='function'||tabOk(t[0])).map(t=>t[0]); }"""
HELP = r"""()=>{ window.__desc=e=>{ let s=e.tagName.toLowerCase(); if(e.id) s+='#'+e.id; if(e.className&&typeof e.className==='string') s+='.'+e.className.trim().split(/\s+/).slice(0,2).join('.'); return s; };
  window.__ovf=()=>{ const Wd=innerWidth, out=[]; if(document.documentElement.scrollWidth>Wd+1) out.push('page plus large que l’écran : '+document.documentElement.scrollWidth);
    const roots=['#view','#sheet','#top','#nav','#arcov','#cbov','#wov'].map(q=>document.querySelector(q)).filter(Boolean);
    const seen=new Set(); roots.forEach(R=>R.querySelectorAll('*').forEach(e=>{ if(seen.size>4000) return; const r=e.getBoundingClientRect(); if(r.width<2||r.height<2) return; const cs=getComputedStyle(e); if(cs.visibility==='hidden'||cs.display==='none'||+cs.opacity===0) return;
      if(r.right>Wd+1.5||r.left<-1.5){ let p=e.parentElement, scr=false; while(p&&p!==document.body){ const s=getComputedStyle(p); if(/(auto|scroll|hidden|clip)/.test(s.overflowX)&&(p.scrollWidth>p.clientWidth+1||p.getBoundingClientRect().right<=Wd+1)){ scr=true; break; } p=p.parentElement; } if(!scr){ const k='déborde: '+__desc(e); if(!seen.has(k)){ seen.add(k); out.push(k+' ['+Math.round(r.left)+'..'+Math.round(r.right)+']'); } } }
      if(!e.children.length&&e.textContent.trim().length>1&&e.scrollWidth>e.clientWidth+2&&/(hidden|clip)/.test(cs.overflowX)&&cs.textOverflow!=='ellipsis'){ const k='texte coupé: '+__desc(e)+' «'+e.textContent.trim().slice(0,28)+'»'; if(!seen.has(k)){ seen.add(k); out.push(k); } } }));
    return out.slice(0,25); };
  window.__btns=sel=>{ const R=document.querySelector(sel); if(!R) return []; const o=[], ks=new Set(); R.querySelectorAll('[data-a]').forEach(b=>{ const r=b.getBoundingClientRect(); if(r.width<1||r.height<1||b.disabled) return; const d=Object.assign({},b.dataset); const k=JSON.stringify(d); if(ks.has(k)) return; ks.add(k); o.push(d); }); return o; };
  window.__click=d=>{ const all=[...document.querySelectorAll('[data-a]')].filter(b=>{ if(b.disabled) return false; const x=b.dataset; return Object.keys(d).length===Object.keys(x).length&&Object.keys(d).every(k=>x[k]===d[k]); }); const b=all[0]; if(!b) return false; b.click(); return true; };
  window.__clean=v=>{ try{ if(typeof arcQuit==='function') arcQuit(); }catch(e){} try{ document.querySelectorAll('#cbov,#upd,#cine,.ov50,#pkov').forEach(e=>e.remove()); }catch(e){} try{ if(typeof wClose==='function'&&window.W&&W.on) wClose(); }catch(e){} try{ if(sheet) closeSheet(); }catch(e){} try{ if(typeof glStop==='function') glStop(); }catch(e){} try{ RC=null; R=null; view=v; render(); }catch(e){ __E.push('render '+v+': '+e.message); } }; }"""
SKIP = {'reset', 'resetgo', 'hardreset', 'wipe', 'delsave', 'export', 'import', 'mute', 'tab', 'close', 'install', 'share', 'pmmute', 'arcquit'}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': W, 'height': H}); perr = []
        pg.on('pageerror', lambda e: perr.append(str(e)[:300]))
        pg.on('dialog', lambda d: asyncio.ensure_future(d.dismiss()))
        await pg.route('**/*', lambda r: r.abort() if r.request.url.startswith('http') and 'cdnjs' not in r.request.url else r.continue_())
        await pg.goto('file:///' + os.path.abspath('out.html').replace(chr(92), '/')); await pg.wait_for_timeout(2500)
        load_err = list(perr)
        tabs = await pg.evaluate(SETUP); await pg.evaluate(HELP)
        report = {'vue': f'{W}x{H}', 'chargement': load_err, 'onglets': {}}
        nclick = 0
        for tab in tabs + ['arena', 'atelier', 'equipe']:
            await pg.evaluate(f"()=>__clean('{tab}')"); await pg.wait_for_timeout(350)
            ent = {'ovf': await pg.evaluate("()=>__ovf()"), 'err': await pg.evaluate("()=>__E.splice(0)"), 'clics': {}}
            if SHOTS: await pg.screenshot(path=os.path.join(SHOTS, f'crawl_{W}_{tab}.png'))
            btns = await pg.evaluate("()=>__btns('#view')") + await pg.evaluate("()=>__btns('#top')")
            for d in btns[:90]:
                if d.get('a') in SKIP: continue
                await pg.evaluate(f"()=>__clean('{tab}')"); await pg.wait_for_timeout(30)
                ok = await pg.evaluate(f"()=>__click({json.dumps(d)})"); nclick += 1
                if not ok: continue
                await pg.wait_for_timeout(120)
                info = {'err': await pg.evaluate("()=>__E.splice(0)"), 'ovf': await pg.evaluate("()=>__ovf()")}
                sb = await pg.evaluate("()=>sheet?__btns('#sheet'):[]")
                sname = await pg.evaluate("()=>sheet?(sheet.t||'?'):''")
                if sb:
                    info['fiche'] = sname
                    for d2 in sb[:30]:
                        if d2.get('a') in SKIP: continue
                        ok2 = await pg.evaluate(f"()=>__click({json.dumps(d2)})"); nclick += 1
                        if not ok2: continue
                        await pg.wait_for_timeout(80)
                        e2 = await pg.evaluate("()=>__E.splice(0)"); o2 = await pg.evaluate("()=>__ovf()")
                        if e2 or o2: info.setdefault('sous', {})[json.dumps(d2, ensure_ascii=False)] = {'err': e2, 'ovf': o2}
                        if not await pg.evaluate("()=>!!sheet"):
                            await pg.evaluate(f"()=>__clean('{tab}')"); await pg.evaluate(f"()=>__click({json.dumps(d)})"); await pg.wait_for_timeout(60)
                if info['err'] or info['ovf'] or info.get('sous'):
                    ent['clics'][json.dumps(d, ensure_ascii=False)] = info
            report['onglets'][tab] = ent
        report['erreurs_page'] = perr; report['clics'] = nclick
        out = f'crawl_{W}x{H}.json'
        with open(os.path.join(os.environ.get('TEMP', '.'), out), 'w', encoding='utf-8') as f: json.dump(report, f, ensure_ascii=False, indent=1)
        nerr = sum(len(v['err']) + sum(len(c['err']) + sum(len(s['err']) for s in c.get('sous', {}).values()) for c in v['clics'].values()) for v in report['onglets'].values())
        novf = sum(len(v['ovf']) + sum(len(c['ovf']) + sum(len(s['ovf']) for s in c.get('sous', {}).values()) for c in v['clics'].values()) for v in report['onglets'].values())
        print(f'{W}x{H} : {nclick} clics, {nerr} erreurs JS, {novf} débordements/textes coupés, erreurs de page {len(perr)} -> %TEMP%/{out}')
        await b.close()
asyncio.run(main())
