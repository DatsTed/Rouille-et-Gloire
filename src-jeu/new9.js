/* ---- sélection automatique des voitures + musique festive ---- */
function autoPick(){
  const ev=R.ev, ms=ev.manches, cs=S.cars.slice();
  const sc=(c,i)=>{ const mn=ms[i], top=Math.max(1,...R.opps[i].map(o=>indice(o,mn))); return Math.min(2,indice(c,mn)/top); };
  const cand=ms.map((mn,i)=>cs.map(c=>({u:c.uid,s:sc(c,i)})).sort((a,b)=>b.s-a.s).slice(0,ms.length+2));
  let best=-1, bp=null; const cur=[];
  (function rec(i,sum){ if(i===ms.length){ if(sum>best){best=sum; bp=cur.slice();} return; }
    for(const c of cand[i]){ if(cur.includes(c.u)) continue; cur.push(c.u); rec(i+1,sum+c.s); cur.pop(); } })(0,0);
  if(bp) R.pick=bp; return !!bp;
}
ACT.autopick=()=>{ if(!R||!R.ev) return; if(autoPick()){ toast('Meilleures voitures choisies, tu peux les changer à la main'); render(); } else toast('Pas assez de voitures'); };
MOODS.fete={arp:[],oct:2,wave:'triangle',av:0,pv:.07,filt:7000,hat:false,pulse:false};
function feteSched(s,bar,t,ch){
  if(s===0&&bar%2===0) pad(t,BAR*2,ch.pad,.09);
  if(s===0||s===8) kick(t,.7,{p0:140,p1:45,dec:.2});
  if(s===4||s===12) clap(t,.35);
  if(s%2===1) hat(t,.06,false);
  if(s%4===2) pluck(t,ch.bass*2,.2,'triangle',.4);
  if(s%2===0) pluck(t,ch.arp[((s>>1)+bar*2)%6]*2,.15,'triangle',.3);
  if(s===0&&bar%4===0) crash(t,.25);
}
