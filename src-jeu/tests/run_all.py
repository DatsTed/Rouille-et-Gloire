# Lance toute la suite de tests (depuis src-jeu/, après build.py) et résume : dernière ligne de chaque test + durée.
# Usage : python -X utf8 tests/run_all.py [motif]   (ex. « pin » pour les tests du flipper seulement)
import subprocess, sys, os, time, glob
os.environ['PYTHONUTF8'] = '1'
pat = sys.argv[1] if len(sys.argv) > 1 else ''
SKIP = {'run_all.py', 't_pt2.py'}
tests = sorted(t for t in glob.glob('tests/t_*.py') if pat in t and os.path.basename(t) not in SKIP)
res = []
for t in tests:
    t0 = time.time()
    try:
        p = subprocess.run([sys.executable, '-X', 'utf8', t], capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=900)
        out = (p.stdout + p.stderr).strip().splitlines()
        code = p.returncode
    except subprocess.TimeoutExpired:
        out, code = ['TIMEOUT'], -1
    tail = ' | '.join(l.strip() for l in out[-3:])[:600]
    res.append((os.path.basename(t), code, round(time.time() - t0), tail))
    print(f'{os.path.basename(t):<14} code={code:<3} {round(time.time()-t0):>4}s  {tail}', flush=True)
print('\n=== résumé ===')
for n, c, s, tl in res:
    print(f'{n:<14} {"OK " if c == 0 else "ERR"} {s:>4}s')
