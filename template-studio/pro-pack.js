/* ============================================================
   Motion Template Studio — PRO PACK
   Loaded between the core libraries and the app state, so it can
   extend SC (scenes), TR/TRD (transitions), ENTR (text entrances),
   FONTS and the renderer before the editor boots.
   Adds: cinematic finish pass, photo/logo media slots, 10 text
   entrances, 7 transitions, 18 scene kinds.
============================================================ */
const PRO={ts:1,media:new Map(),sample:{},db:null,cur:null,curI:-1,sel:-1,recOn:false,rec:[],ext:'webm'};

/* ---------- small helpers ---------- */
const lum=h=>{const[r,g,b]=hexRgb(h);return(.299*r+.587*g+.114*b)/255};
const onCol=(h,dark='#14131a',light='#ffffff')=>lum(h)>.58?dark:light;
const mix=(a,b,t)=>{const A=hexRgb(a),B=hexRgb(b);return'#'+A.map((v,i)=>Math.round(lerp(v,B[i],t)).toString(16).padStart(2,'0')).join('')};
const inkOf=P=>lum(P[4])<.45?P[4]:'#14131a';
const pop=(lt,d,dur=.5)=>E.outBack(pr(lt,d,dur));
const expo=(lt,d,dur=.7)=>E.outExpo(pr(lt,d,dur));
const rowsOf=(t,n)=>String(t||'').split('\n').map(x=>x.trim()).filter(Boolean).slice(0,n);
const partsOf=t=>String(t||'').split(/\s*[\/|]\s*/).map(x=>x.trim()).filter(Boolean);
function fitSize(c,text,font,maxW,size,weight='400'){c.save();c.font=`${weight} ${size}px ${font}`;const w=Math.max(1,...String(text||'').split('\n').map(l=>c.measureText(l).width));c.restore();return w>maxW?size*maxW/w:size}
function softShadow(c,u,a=.28,blur=30,oy=14){c.shadowColor=`rgba(0,0,0,${a})`;c.shadowBlur=blur*u;c.shadowOffsetY=oy*u}
function meshBg(c,W,H,base,cols,lt,a=.8){c.fillStyle=base;c.fillRect(0,0,W,H);const R=Math.max(W,H);cols.forEach((col,i)=>{const x=W*(.5+.42*Math.sin(lt*.23*(1+i*.3)+i*2.1)),y=H*(.5+.42*Math.cos(lt*.19*(1+i*.2)+i*1.3));const g=c.createRadialGradient(x,y,0,x,y,R*.62);g.addColorStop(0,rgba(col,a));g.addColorStop(1,rgba(col,0));c.fillStyle=g;c.fillRect(0,0,W,H)})}
function softBg(c,e,col){const{W,H}=e;const d=lum(col)<.5;const g=c.createRadialGradient(W*.5,H*.4,0,W*.5,H*.4,Math.max(W,H)*.8);g.addColorStop(0,mix(col,'#ffffff',d?.1:.3));g.addColorStop(1,mix(col,'#000000',d?.4:.07));c.fillStyle=g;c.fillRect(0,0,W,H)}
function glass(c,x,y,w,h,r,u,dark){c.save();softShadow(c,u,dark?.35:.14,34,16);c.fillStyle=dark?'rgba(255,255,255,.09)':'rgba(255,255,255,.72)';rr(c,x,y,w,h,r);c.fill();c.restore();const g=c.createLinearGradient(0,y,0,y+h);g.addColorStop(0,dark?'rgba(255,255,255,.16)':'rgba(255,255,255,.7)');g.addColorStop(.5,'rgba(255,255,255,0)');c.fillStyle=g;rr(c,x,y,w,h,r);c.fill();c.strokeStyle=dark?'rgba(255,255,255,.26)':'rgba(255,255,255,.95)';c.lineWidth=1.5*u;rr(c,x,y,w,h,r);c.stroke()}
function sweep(c,x,w,h,k){const g=c.createLinearGradient(x-w,0,x+w,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,`rgba(255,255,255,${k})`);g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(x-w,-h,w*2,h*3)}

/* ---------- icons (unit box −1…1) ---------- */
const IC={
  bell(c){c.beginPath();c.moveTo(-.64,.4);c.quadraticCurveTo(-.42,.2,-.42,-.15);c.bezierCurveTo(-.42,-.84,.42,-.84,.42,-.15);c.quadraticCurveTo(.42,.2,.64,.4);c.closePath();c.fill();c.beginPath();c.arc(0,.56,.17,0,Math.PI);c.fill();c.beginPath();c.arc(0,-.74,.09,0,TAU);c.fill()},
  play(c){c.beginPath();c.moveTo(-.32,-.52);c.lineTo(.58,0);c.lineTo(-.32,.52);c.closePath();c.fill()},
  check(c){c.beginPath();c.moveTo(-.5,.02);c.lineTo(-.14,.38);c.lineTo(.52,-.34);c.stroke()},
  thumb(c){rr(c,-.74,-.06,.3,.72,.06);c.fill();c.beginPath();c.moveTo(-.32,-.04);c.lineTo(-.04,-.72);c.quadraticCurveTo(.3,-.74,.22,-.3);c.lineTo(.16,-.12);c.lineTo(.58,-.12);c.quadraticCurveTo(.78,-.1,.74,.1);c.lineTo(.6,.52);c.quadraticCurveTo(.56,.66,.42,.66);c.lineTo(-.32,.66);c.closePath();c.fill()},
  heart(c){heartPath(c,0,-.05,.62);c.fill()},
  star(c){starPath(c,0,0,.84,.38);c.fill()},
  user(c){c.beginPath();c.arc(0,-.32,.34,0,TAU);c.fill();c.beginPath();c.ellipse(0,.72,.66,.52,0,Math.PI,0);c.fill()},
  pin(c){c.beginPath();c.arc(0,-.22,.5,Math.PI*.82,Math.PI*2.18);c.lineTo(0,.86);c.closePath();c.fill()},
  clock(c){c.beginPath();c.arc(0,0,.72,0,TAU);c.moveTo(0,-.42);c.lineTo(0,0);c.lineTo(.3,.18);c.stroke()},
  bolt(c){c.beginPath();c.moveTo(.15,-.85);c.lineTo(-.5,.12);c.lineTo(-.02,.12);c.lineTo(-.18,.85);c.lineTo(.5,-.15);c.lineTo(.02,-.15);c.closePath();c.fill()},
};
function icon(c,name,x,y,s,col){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle=col;c.strokeStyle=col;c.lineWidth=.17;c.lineCap='round';c.lineJoin='round';(IC[name]||IC.star)(c);c.restore()}

/* ============================================================
   media store — photos & logos the user drops into a scene.
   Kept out of the project JSON autosave (IndexedDB instead) and
   embedded only when the project is exported to a file.
============================================================ */
let proRedrawT=0;
PRO.redraw=()=>{clearTimeout(proRedrawT);proRedrawT=setTimeout(()=>{try{if(typeof draw==='function')draw()}catch(e){}},30)};
PRO.load=(id,name,src)=>{const img=new Image();const m={name,src,img,ok:false};img.onload=()=>{m.ok=true;PRO.redraw()};img.src=src;PRO.media.set(id,m);return m};
PRO.put=(id,name,src)=>{PRO.load(id,name,src);try{PRO.db&&PRO.db.transaction('img','readwrite').objectStore('img').put({id,name,src})}catch(e){}};
PRO.img=id=>{const m=id&&PRO.media.get(id);return m&&m.ok?m.img:null};
PRO.addFile=file=>new Promise((res,rej)=>{if(!file||!/^image\//.test(file.type))return rej(new Error('type'));const url=URL.createObjectURL(file);const im=new Image();
  im.onload=()=>{try{const k=Math.min(1,1600/Math.max(im.width,im.height));const cn=document.createElement('canvas');cn.width=Math.max(1,Math.round(im.width*k));cn.height=Math.max(1,Math.round(im.height*k));cn.getContext('2d').drawImage(im,0,0,cn.width,cn.height);
    const alpha=/png|webp|gif|svg/.test(file.type);let src=alpha?cn.toDataURL('image/png'):'';if(!src||src.length>2.4e6)src=cn.toDataURL(alpha?'image/webp':'image/jpeg',.88);
    const id='m'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);PRO.put(id,String(file.name||'image').slice(0,60),src);URL.revokeObjectURL(url);res(id)}catch(err){rej(err)}};
  im.onerror=()=>{URL.revokeObjectURL(url);rej(new Error('decode'))};im.src=url});
PRO.exportMedia=p=>{const out={};(p.scenes||[]).forEach(s=>[...(s.imgs||[]),...(s.layers||[]).map(l=>l.img)].forEach(id=>{const m=id&&PRO.media.get(id);if(m)out[id]={name:m.name,src:m.src}}));return out};
PRO.importMedia=obj=>{if(!obj||typeof obj!=='object')return;Object.entries(obj).forEach(([id,m])=>{if(m&&typeof m.src==='string'&&/^data:image\//.test(m.src)&&!PRO.media.has(id))PRO.put(String(id),String(m.name||'image'),m.src)})};
try{const rq=indexedDB.open('mls-media',1);rq.onupgradeneeded=()=>rq.result.createObjectStore('img',{keyPath:'id'});rq.onsuccess=()=>{PRO.db=rq.result;const g=PRO.db.transaction('img').objectStore('img').getAll();g.onsuccess=()=>g.result.forEach(r=>{if(!PRO.media.has(r.id))PRO.load(r.id,r.name,r.src)})}}catch(e){}

function drawCover(c,img,x,y,w,h,z=1,px=.5,py=.5){const s=Math.max(w/img.width,h/img.height)*z;const dw=img.width*s,dh=img.height*s;c.drawImage(img,x+(w-dw)*px,y+(h-dh)*py,dw,dh)}
/* A media slot: the user's photo with a slow Ken Burns move, or — when the
   slot is empty — a soft abstract "photo" built from the palette so the
   template still reads as finished. */
function drawMedia(c,e,s,slot,x,y,w,h,lt,o={}){const{P,u}=e;PRO.mark(c,'img'+slot,x,y,x+w,y+h);const ip=(s.imgPos&&s.imgPos[slot])||[.5,.5,1];c.save();rr(c,x,y,w,h,o.r||0);c.clip();const img=PRO.img(s.imgs&&s.imgs[slot]);const k=clamp(lt/Math.max(1,e.vis||3));const dir=slot%2?-1:1;
  if(img)drawCover(c,img,x,y,w,h,(o.still?1:1.05+.08*k)*(ip[2]||1),clamp(ip[0]+dir*.3*(k-.5)*(o.still?0:1)),ip[1]);
  else{const pairs=[[P[1],P[2]],[P[2],P[4]],[P[1],P[4]]];const[a,b]=pairs[slot%3];const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,mix(a,'#ffffff',.18));g.addColorStop(1,mix(b,'#000000',.18));c.fillStyle=g;c.fillRect(x,y,w,h);
    const R=Math.max(w,h);[[.25+.1*Math.sin(lt*.5+slot),.3,mix(a,'#ffffff',.55),.55],[.78,.72+.08*Math.cos(lt*.4+slot),mix(b,P[1],.4),.6],[.6+.1*Math.sin(lt*.3),.2,'#ffffff',.22]].forEach(([fx,fy,col,al])=>{const gx=x+w*fx,gy=y+h*fy;const rg=c.createRadialGradient(gx,gy,0,gx,gy,R*.6);rg.addColorStop(0,rgba(col,al));rg.addColorStop(1,rgba(col,0));c.fillStyle=rg;c.fillRect(x,y,w,h)});
    c.fillStyle=rgba(mix(b,'#000000',.45),.5);c.beginPath();c.moveTo(x,y+h);c.lineTo(x,y+h*.8);c.bezierCurveTo(x+w*.25,y+h*.62,x+w*.45,y+h*.9,x+w*.68,y+h*.72);c.bezierCurveTo(x+w*.82,y+h*.62,x+w*.92,y+h*.7,x+w,y+h*.66);c.lineTo(x+w,y+h);c.closePath();c.fill()}
  c.restore()}

/* ============================================================
   cinematic finish — soft glow, bloom and directional light laid
   over every frame so flat fills read as lit surfaces.
============================================================ */
PRO.finish=function(c,fx,e,t,pool){const k=fx.polish==null?.6:fx.polish;if(!(k>0))return;const{W,H}=e;
  if(!pool.S){pool.S=document.createElement('canvas');pool.S.width=Math.max(2,W>>2);pool.S.height=Math.max(2,H>>2)}
  const S=pool.S,sx=S.getContext('2d');sx.globalCompositeOperation='copy';sx.filter=`blur(${Math.max(2,Math.round(S.width/60))}px)`;sx.drawImage(c.canvas,0,0,S.width,S.height);sx.filter='none';
  c.save();c.setTransform(1,0,0,1,0,0);
  c.globalCompositeOperation='soft-light';c.globalAlpha=.42*k;c.drawImage(S,0,0,W,H);
  c.globalCompositeOperation='screen';c.globalAlpha=.13*k;c.drawImage(S,0,0,W,H);
  c.globalAlpha=1;c.globalCompositeOperation='soft-light';const R=Math.hypot(W,H);
  let g=c.createRadialGradient(W*.28,H*.16,0,W*.28,H*.16,R*.75);g.addColorStop(0,`rgba(255,255,255,${.26*k})`);g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,W,H);
  g=c.createRadialGradient(W*.5,H*.45,R*.3,W*.5,H*.45,R*.72);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(0,0,0,${.3*k})`);c.fillStyle=g;c.fillRect(0,0,W,H);
  c.restore()};

/* ============================================================
   text entrances
============================================================ */
const PENT={
  rise:{label:'블러 라이즈 (줄 단위)',d:'줄마다 아래에서 떠오르며 초점이 맞습니다. 요즘 브랜드 필름의 기본기.'},
  wordRise:{label:'단어 마스크 라이즈',d:'단어가 하나씩 마스크 안에서 올라옵니다. 에디토리얼·프레젠테이션.'},
  wave:{label:'웨이브',d:'글자가 물결처럼 차례로 튀어 오릅니다. 경쾌한 타이틀.'},
  flip:{label:'플립 (세로 뒤집기)',d:'글자가 카드처럼 뒤집히며 나타납니다. 스코어보드·발표.'},
  stretch:{label:'세로 스트레치',d:'길게 늘어난 글자가 탄성 있게 제자리로. 패션·뮤직.'},
  swing:{label:'스윙 (간판 흔들림)',d:'위에 매달린 듯 흔들리다 멈춥니다. 예능·이벤트.'},
  cascade:{label:'캐스케이드 슬라이드',d:'글자가 왼쪽에서 차례로 미끄러져 들어옵니다. 모던 프로모.'},
  reveal:{label:'센터 스플릿 리빌',d:'가운데에서 양옆으로 열리며 드러납니다. 로고·엔딩.'},
  zoomBlur:{label:'줌 포커스',d:'크게 흐린 상태에서 줌 아웃하며 선명해집니다. 시네마틱.'},
  glow:{label:'글로우 스윕',d:'페이드 인 뒤 빛줄기가 글자를 훑고 지나갑니다. 럭셔리·테크.'},
};
Object.assign(ENTR,PENT);
function proText(c,text,x,y,o){if(text==null||text==='')return;const size=o.size,ent=o.entrance;const lt=(o.lt||0)-(o.delay||0);if(lt<0)return;
  const lines=String(text).split('\n');const lh=size*(o.lineH||1.12);c.save();c.font=`${o.weight||'400'} ${size}px ${o.font}`;c.textBaseline='middle';const sp=(o.spacing||0)*size;let A=o.alpha??1;
  if(o.skew){c.translate(x,y);c.transform(1,0,o.skew,1,0,0);c.translate(-x,-y)}
  if(ent==='zoomBlur'){const p=E.outExpo(pr(lt,0,.9));const sc=1+.5*(1-p);c.translate(x,y);c.scale(sc,sc);c.translate(-x,-y);A*=clamp(lt/.3);const b=(1-p)*size*.14;if(b>.4)c.filter=`blur(${b.toFixed(1)}px)`}
  const bh=lh*lines.length;let n=0,wi=0;
  lines.forEach((line,li)=>{const chars=[...line];const ws=chars.map(ch=>c.measureText(ch).width+sp);const tw=ws.reduce((a,b)=>a+b,0)-sp;const sx=o.align==='left'?x:o.align==='right'?x-tw:x-tw/2;const ly=y-bh/2+lh*(li+.5);
    c.save();let lDy=0,lA=1;
    if(ent==='rise'){const p=E.outExpo(pr(lt,li*.14,.9));lDy=(1-p)*lh*.6;lA=clamp((lt-li*.14)/.45);const b=(1-p)*size*.1;if(b>.4)c.filter=`blur(${b.toFixed(1)}px)`}
    if(ent==='reveal'){const p=E.inOutCubic(pr(lt,li*.12,.8));c.beginPath();c.rect(sx+tw/2-(tw/2+size*.3)*p,ly-lh*.7,(tw+size*.6)*p,lh*1.4);c.clip()}
    if(ent==='wordRise'){c.beginPath();c.rect(sx-size,ly-lh*.56,tw+size*2,lh*1.12);c.clip()}
    let cx=sx;const pos=[];
    chars.forEach((ch,ci)=>{const w=ws[ci];let dx=0,dy=lDy,sxk=1,syk=1,rot=0,a=A*lA,piv=0;
      switch(ent){
        case'wordRise':{const p=E.outExpo(pr(lt,wi*.09+li*.04,.75));dy=(1-p)*lh*1.1;break}
        case'wave':{const p=pr(lt,n*.04,.6);dy=(1-E.outBack(p))*size*.7;a*=clamp(p*3);break}
        case'flip':{const p=pr(lt,n*.045,.55);syk=p<=0?0:E.outBack(p);a*=p>0?1:0;break}
        case'stretch':{const p=E.outExpo(pr(lt,n*.03,.65));syk=1+(1-p)*1.9;a*=clamp(pr(lt,n*.03,.18));break}
        case'swing':{const p=pr(lt,n*.05,1);rot=(1-E.outElastic(p))*-.7;a*=clamp(p*6);piv=-size*.5;break}
        case'cascade':{const p=E.outExpo(pr(lt,n*.035,.75));dx=-(1-p)*size*1.3;a*=clamp(pr(lt,n*.035,.3));break}
        case'glow':a*=E.outCubic(pr(lt,n*.02,.5));break;
      }
      pos.push([ch,cx+(w-sp)/2]);
      if(a>.002&&ch!==' '&&syk!==0){c.save();c.globalAlpha*=a;c.translate(cx+(w-sp)/2+dx,ly+dy+piv);c.rotate(rot);c.translate(0,-piv);c.scale(sxk,syk);const gw=c.measureText(ch).width;
        if(o.shadow){c.fillStyle=o.shadow;c.fillText(ch,-gw/2+(o.shadowOff||size*.06),(o.shadowOff||size*.06))}
        if(o.stroke){c.lineWidth=o.strokeW||size*.05;c.strokeStyle=o.stroke;c.lineJoin='round';c.strokeText(ch,-gw/2,0)}
        if(!o.outline){c.fillStyle=o.color||'#fff';c.fillText(ch,-gw/2,0)}
        c.restore()}
      if(ch===' ')wi++;cx+=w;n++});
    wi++;
    if(ent==='glow'){const p=pr(lt,.35+li*.1,1.1);if(p>0&&p<1){const gx=lerp(sx-size*2,sx+tw+size*2,p);const g=c.createLinearGradient(gx-size*1.4,0,gx+size*1.4,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,.95)');g.addColorStop(1,'rgba(255,255,255,0)');c.globalCompositeOperation='lighter';c.fillStyle=g;c.textAlign='center';pos.forEach(([ch,px])=>{if(ch!==' ')c.fillText(ch,px,ly)});c.textAlign='left'}}
    c.restore()});
  c.restore()}
const coreText=drawText;
drawText=function(c,text,x,y,o){if(!o)return;const s=PRO.cur;const key=o._k||PRO.keyOf(s,text);let sc=PRO.ts;
  if(key&&!o._moved){const[dx,dy,k]=PRO.off(s,key,c);x+=dx;y+=dy;sc*=k}
  if(sc!==1&&o.size)o={...o,size:o.size*sc};
  if(key&&PRO.recOn&&PRO.curI===PRO.sel){const size=o.size,lines=String(text).split('\n'),lh=size*(o.lineH||1.12);c.save();c.font=`${o.weight||'400'} ${size}px ${o.font}`;const w=Math.max(1,...lines.map(l=>c.measureText(l).width+(o.spacing||0)*size*Math.max(0,[...l].length-1)));c.restore();const x0=o.align==='left'?x:o.align==='right'?x-w:x-w/2,pd=size*.14;PRO.mark(c,key,x0-pd,y-lh*lines.length/2-pd*.5,x0+w+pd,y+lh*lines.length/2+pd*.5)}
  return PENT[o.entrance]?proText(c,text,x,y,o):coreText(c,text,x,y,o)};

/* ============================================================
   direct manipulation — which on-screen box belongs to which
   editable part, per-part offsets, and free layers on top.
============================================================ */
PRO.keyOf=(s,text)=>{if(!s||text==null||text==='')return null;text=String(text);if(text===s.text)return'text';if(text===s.sub)return'sub';if(s.text&&String(s.text).split('\n').includes(text))return'text';if(s.text&&text.length>1&&String(s.text).split(/\s+/).includes(text))return'text';return null};
PRO.off=(s,key,c)=>{const p=s&&s.pos&&s.pos[key];return p?[(+p[0]||0)*c.canvas.width,(+p[1]||0)*c.canvas.height,+p[2]||1]:[0,0,1]};
PRO.mark=(c,key,x0,y0,x1,y1)=>{if(!PRO.recOn||PRO.curI!==PRO.sel)return;const m=c.getTransform();const pts=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]].map(([x,y])=>[m.a*x+m.c*y+m.e,m.b*x+m.d*y+m.f]);const xs=pts.map(q=>q[0]),ys=pts.map(q=>q[1]);const b={key,x0:Math.min(...xs),y0:Math.min(...ys),x1:Math.max(...xs),y1:Math.max(...ys)};const o=PRO.rec.find(r=>r.key===key);if(o){o.x0=Math.min(o.x0,b.x0);o.y0=Math.min(o.y0,b.y0);o.x1=Math.max(o.x1,b.x1);o.y1=Math.max(o.y1,b.y1)}else PRO.rec.push(b)};
const num=(v,a,b,d)=>{v=+v;return isFinite(v)?clamp(v,a,b):d};
PRO.keep=s=>{const out={};
  if(s.pos&&typeof s.pos==='object'){const p={};['text','sub'].forEach(k=>{const v=s.pos[k];if(Array.isArray(v))p[k]=[num(v[0],-1.5,1.5,0),num(v[1],-1.5,1.5,0),num(v[2],.3,4,1)]});if(Object.keys(p).length)out.pos=p}
  if(s.imgPos&&typeof s.imgPos==='object'){const p={};Object.entries(s.imgPos).slice(0,4).forEach(([k,v])=>{if(Array.isArray(v))p[String(+k||0)]=[num(v[0],0,1,.5),num(v[1],0,1,.5),num(v[2],1,4,1)]});if(Object.keys(p).length)out.imgPos=p}
  if(Array.isArray(s.layers)&&s.layers.length)out.layers=s.layers.slice(0,12).map(l=>l&&l.t==='img'?{t:'img',img:l.img?String(l.img):null,x:num(l.x,-.5,1.5,.5),y:num(l.y,-.5,1.5,.5),w:num(l.w,.03,1.5,.2),round:!!l.round,delay:num(l.delay,0,10,0)}:{t:'text',text:String((l&&l.text)??'').slice(0,200),x:num(l&&l.x,-.5,1.5,.5),y:num(l&&l.y,-.5,1.5,.5),size:num(l&&l.size,.015,.4,.06),color:['text','accent','white','black'].includes(l&&l.color)?l.color:'text',font:l&&l.font==='body'?'body':'title',bg:!!(l&&l.bg),ent:ENTR[l&&l.ent]?l.ent:'fade',delay:num(l&&l.delay,0,10,0)});
  return out};
PRO.layers=function(c,s,lt,e){const L=s.layers;if(!L||!L.length)return;const{W,H,P}=e;const cur=PRO.cur;PRO.cur=null;
  L.forEach((l,i)=>{const x=l.x*W,y=l.y*H,d=l.delay||0;
    if(l.t==='img'){const img=PRO.img(l.img);const w=(l.w||.2)*W;let h=w*.6;if(img){h=w*img.height/img.width;const a=E.outCubic(pr(lt,d,.4));if(a>0){c.save();c.globalAlpha=a;c.translate(x,y);const k=lerp(.86,1,E.outBack(pr(lt,d,.5)));c.scale(k,k);if(l.round){c.beginPath();c.ellipse(0,0,w/2,h/2,0,0,TAU);c.clip()}c.drawImage(img,-w/2,-h/2,w,h);c.restore()}}PRO.mark(c,'L'+i,x-w/2,y-h/2,x+w/2,y+h/2);return}
    const size=(l.size||.06)*H,font=l.font==='body'?e.body:e.font;const col={text:P[3],accent:P[1],white:'#ffffff',black:'#14131a'}[l.color]||P[3];const lines=String(l.text||'').split('\n');c.save();c.font=`400 ${size}px ${font}`;const w=Math.max(size,...lines.map(t=>c.measureText(t).width));c.restore();const h=size*1.12*lines.length;
    if(l.bg&&l.text){const a=E.outCubic(pr(lt,d,.35));if(a>0){c.save();c.globalAlpha=a*.86;c.fillStyle=onCol(col,'#14131a','#ffffff');rr(c,x-w/2-size*.5,y-h/2-size*.24,w+size,h+size*.48,Math.min(size*.5,(h+size*.48)/2));c.fill();c.restore()}}
    const o={size,font,color:col,entrance:l.ent||'fade',lt,delay:d,shadow:l.bg?null:'rgba(0,0,0,.28)',shadowOff:size*.04};(PENT[o.entrance]?proText:coreText)(c,l.text,x,y,o);PRO.mark(c,'L'+i,x-w/2-size*.3,y-h/2-size*.15,x+w/2+size*.3,y+h/2+size*.15)});
  PRO.cur=cur};
PRO.wantMp4=()=>{try{return localStorage.getItem('mls-format')!=='webm'}catch(e){return true}};

/* ============================================================
   fonts
============================================================ */
Object.assign(FONTS,{
  noto:{label:'Noto Sans KR Black (모던 헤비)',css:"'Noto Sans KR','IBM Plex Sans KR',sans-serif"},
  gothic:{label:'Gothic A1 (세련된 고딕)',css:"'Gothic A1','IBM Plex Sans KR',sans-serif"},
  mont:{label:'Montserrat (라틴 모던)',css:"'Montserrat','Noto Sans KR',sans-serif"},
  playfair:{label:'Playfair Display (럭셔리 세리프)',css:"'Playfair Display','Gowun Batang',serif"},
  bebas:{label:'Bebas Neue (시네마 컨덴스드)',css:"'Bebas Neue','Black Han Sans',sans-serif"},
});

/* ============================================================
   transitions
============================================================ */
Object.assign(TR,{
  blurFade:{label:'블러 디졸브',d:'초점이 풀렸다가 다음 장면에서 다시 맞습니다. 감성·브랜드 필름.'},
  lightSweep:{label:'라이트 스윕',d:'빛줄기가 화면을 가로지르며 장면이 바뀝니다. 럭셔리·테크.'},
  stack:{label:'카드 스택',d:'다음 장면이 카드처럼 위로 올라와 덮습니다. 앱·프레젠테이션.'},
  punch:{label:'펀치 줌',d:'순간적으로 확 당겼다가 다음 장면에 안착. 비트 드롭·숏폼.'},
  curtain:{label:'컬러 커튼',d:'두 색 패널이 양쪽에서 닫혔다 열립니다. 쇼·이벤트.'},
  ripple:{label:'컬러 리플',d:'포인트 컬러 원이 겹겹이 퍼지며 전환. 경쾌한 프로모.'},
  slideUp:{label:'버티컬 푸시',d:'아래에서 위로 밀어 올립니다. 세로 영상·카드뉴스.'},
});
Object.assign(TRD,{
  blurFade:(c,A,B,p,e)=>{const k=Math.sin(p*Math.PI),b=k*22*e.u;c.save();if(b>.5)c.filter=`blur(${b.toFixed(1)}px)`;c.drawImage(A,0,0);c.globalAlpha=E.inOutCubic(p);c.drawImage(B,0,0);c.restore()},
  lightSweep:(c,A,B,p,e)=>{const{W,H}=e;const q=E.inOutCubic(p);const x=lerp(-W*.4,W*1.4,q);c.drawImage(A,0,0);c.save();c.beginPath();c.moveTo(-10,0);c.lineTo(x+H*.25,0);c.lineTo(x-H*.25,H);c.lineTo(-10,H);c.closePath();c.clip();c.drawImage(B,0,0);c.restore();c.save();c.globalCompositeOperation='lighter';c.translate(x,H/2);c.rotate(Math.atan2(H*.5,H)*.9);sweep(c,0,W*.16,H*2,.85*Math.sin(p*Math.PI));c.restore()},
  stack:(c,A,B,p,e)=>{const{W,H,u}=e;const q=E.outExpo(p);c.fillStyle='#000';c.fillRect(0,0,W,H);c.save();c.translate(W/2,H/2);const s=1-.08*q;c.scale(s,s);c.globalAlpha=1-.45*q;c.drawImage(A,-W/2,-H/2);c.restore();c.save();c.shadowColor='rgba(0,0,0,.5)';c.shadowBlur=50*u;c.shadowOffsetY=-12*u;c.drawImage(B,0,(1-q)*H);c.restore()},
  punch:(c,A,B,p,e)=>{const{W,H,u}=e;const first=p<.45;const q=first?E.inCubic(p/.45):E.outExpo((p-.45)/.55);const s=first?1+q*.9:1.35-.35*q;const b=(first?q:1-q)*18*u;c.save();c.translate(W/2,H/2);c.scale(s,s);if(b>.5)c.filter=`blur(${b.toFixed(1)}px)`;c.drawImage(first?A:B,-W/2,-H/2);c.restore();c.fillStyle='#fff';c.globalAlpha=.35*Math.max(0,1-Math.abs(p-.45)/.12);c.fillRect(0,0,W,H);c.globalAlpha=1},
  curtain:(c,A,B,p,e)=>{const{W,H,P}=e;c.drawImage(p<.5?A:B,0,0);const q=p<.5?E.inOutCubic(p/.5):1-E.inOutCubic((p-.5)/.5);const w=W/2*q;c.fillStyle=P[1];c.fillRect(0,0,w,H);c.fillStyle=P[2];c.fillRect(W-w,0,w+1,H);c.fillStyle=P[4];c.fillRect(w-W*.012*q,0,W*.012*q,H);c.fillRect(W-w,0,W*.012*q,H)},
  ripple:(c,A,B,p,e)=>{const{W,H,P}=e;const R=Math.hypot(W,H)*.56;c.drawImage(A,0,0);[[P[1],0],[P[2],.12]].forEach(([col,d])=>{const r=E.inOutCubic(clamp((p-d)/.6))*R;if(r>0){c.fillStyle=col;c.beginPath();c.arc(W/2,H/2,r,0,TAU);c.fill()}});const r=E.inOutCubic(clamp((p-.26)/.72))*R;if(r>0){c.save();c.beginPath();c.arc(W/2,H/2,r,0,TAU);c.clip();c.drawImage(B,0,0);c.restore()}},
  slideUp:(c,A,B,p,e)=>{const q=E.inOutExpo(p);c.drawImage(A,0,-q*e.H);c.drawImage(B,0,(1-q)*e.H)},
});

/* ============================================================
   scene kinds
============================================================ */
function parseStat(tok){const m=/^([^\d\-+]*)([\-+]?[\d,]*\.?\d+)(.*)$/.exec(tok);if(!m)return{pre:'',num:null,suf:tok,dec:0};const raw=m[2].replace(/,/g,'');return{pre:m[1],num:parseFloat(raw),suf:m[3],dec:(raw.split('.')[1]||'').length,comma:m[2].includes(',')}}
const fmtStat=(st,p)=>st.num==null?st.suf:st.pre+(st.comma?(st.num*p).toLocaleString('en-US',{minimumFractionDigits:st.dec,maximumFractionDigits:st.dec}):(st.num*p).toFixed(st.dec))+st.suf;
function pill(c,x,y,w,h,col){c.fillStyle=col;rr(c,x-w/2,y-h/2,w,h,h/2);c.fill()}
function label(c,text,x,y,size,font,col,align='center',weight='500'){const key=PRO.keyOf(PRO.cur,text);if(key){const[dx,dy,k]=PRO.off(PRO.cur,key,c);x+=dx;y+=dy;size*=k}c.font=`${weight} ${size}px ${font}`;if(key){const w=c.measureText(text).width,x0=align==='left'?x:align==='right'?x-w:x-w/2;PRO.mark(c,key,x0-size*.12,y-size*.62,x0+w+size*.12,y+size*.62)}c.textAlign=align;c.textBaseline='middle';c.fillStyle=col;c.fillText(text,x,y);c.textAlign='left'}
function avatar(c,e,s,slot,x,y,R,k){const{P}=e;if(k<=0)return;c.save();c.translate(x,y);c.scale(k,k);const img=PRO.img(s.imgs&&s.imgs[slot]);c.fillStyle=P[1];c.beginPath();c.arc(0,0,R,0,TAU);c.fill();
  if(img){c.save();c.beginPath();c.arc(0,0,R*.92,0,TAU);c.clip();drawCover(c,img,-R,-R,R*2,R*2);c.restore()}else{const ch=([...String(s.text||'C').trim()][0]||'C').toUpperCase();label(c,ch,0,R*.06,R*1.05,e.font,onCol(P[1]),'center','400')}
  c.restore()}

Object.assign(SC,{
  aurora:{label:'오로라 그라디언트 타이틀',opts:{aurora:'오로라 (다크)',mesh:'메시 (라이트)',spot:'스포트라이트'},
    cues:()=>[{t:.1,sfx:'swell',v:.5}],
    draw(c,s,lt,e){const{W,H,u,P}=e;const o=s.opt||'aurora';const light=o==='mesh';
      if(light)meshBg(c,W,H,mix(P[0],'#ffffff',.55),[P[1],P[2],mix(P[1],P[2],.5),mix(P[0],'#ffffff',.2)],lt,.7);
      else if(o==='spot'){c.fillStyle=mix(P[0],'#000000',.74);c.fillRect(0,0,W,H);const g=c.createRadialGradient(W/2,H*.42,0,W/2,H*.42,Math.max(W,H)*.62);g.addColorStop(0,rgba(P[1],.6));g.addColorStop(.5,rgba(P[2],.16));g.addColorStop(1,rgba(P[2],0));c.fillStyle=g;c.fillRect(0,0,W,H);
        for(let i=0;i<40;i++){const y=((hash(i,2)*H-lt*(8+hash(i,3)*16)*u)%H+H)%H;c.fillStyle=`rgba(255,255,255,${(.12+.3*hash(i,4)).toFixed(2)})`;c.beginPath();c.arc(hash(i,1)*W,y,(1+hash(i,5)*2)*u,0,TAU);c.fill()}}
      else{meshBg(c,W,H,mix(P[0],'#000000',.8),[P[1],P[2],mix(P[1],'#000000',.3)],lt,.55);c.save();c.globalCompositeOperation='lighter';c.filter=`blur(${Math.round(26*u)}px)`;
        for(let k=0;k<3;k++){c.beginPath();c.moveTo(-W*.1,H*1.1);for(let i=0;i<=24;i++)c.lineTo(W*(-.1+1.2*i/24),H*(.5+k*.1)+Math.sin(i*.5+lt*(.5+k*.2)+k*2)*H*.11);c.lineTo(W*1.1,H*1.1);c.closePath();c.fillStyle=rgba(k%2?P[2]:P[1],.2);c.fill()}c.restore()}
      const fg=light?inkOf(P):'#ffffff';const n=String(s.text||'').split('\n').length;const size=fitSize(c,s.text,e.font,W*.84,Math.min(W*.115,132*u));const yb=H/2-(s.sub?22*u:0);
      drawText(c,s.text,W/2,yb,{size,font:e.font,color:fg,entrance:s.entrance,lt,delay:.25,shadow:light?null:'rgba(0,0,0,.28)',shadowOff:size*.03});
      const ly=yb+size*1.12*n/2+24*u;const lp=expo(lt,.7,.8);c.fillStyle=P[1];c.fillRect(W/2-70*u*lp,ly,140*u*lp,3*u);
      if(s.sub)drawText(c,s.sub,W/2,ly+36*u,{size:27*u,font:e.body,color:rgba(fg,.85),entrance:'rise',lt,delay:.9,spacing:.16});
    }},
  bigType:{label:'에디토리얼 빅 타이포',opts:{left:'좌측 정렬',center:'중앙 정렬',invert:'컬러 반전'},
    cues:s=>rowsOf(s.text,4).map((_,i)=>({t:.12+i*.16,sfx:'swoosh',v:.45})),
    draw(c,s,lt,e){const{W,H,u,P}=e;const inv=s.opt==='invert',cen=s.opt==='center';const bg=inv?P[1]:P[0];const fg=inv?onCol(P[1],inkOf(P)):P[3];const ac=inv?onCol(P[1],P[0],P[2]):P[1];
      c.fillStyle=bg;c.fillRect(0,0,W,H);const g=c.createRadialGradient(W*.88,H*.1,0,W*.88,H*.1,Math.max(W,H)*.75);g.addColorStop(0,rgba(inv?'#ffffff':P[2],.3));g.addColorStop(1,rgba(P[2],0));c.fillStyle=g;c.fillRect(0,0,W,H);
      const lines=rowsOf(s.text,4);if(!lines.length)return;const m=W*.08;const lhMax=H*.6/lines.length;const size=Math.min(lhMax*.88,...lines.map(l=>fitSize(c,l,e.font,W-2*m,lhMax*.88)))*PRO.ts*PRO.off(s,'text',c)[2];const lh=size*1.1,bh=lh*lines.length,top=H*.52-bh/2;const[ox,oy]=PRO.off(s,'text',c);c.save();c.translate(ox,oy);
      const save=PRO.ts;PRO.ts=1;
      lines.forEach((l,i)=>{const p=s.entrance==='none'?1:expo(lt,.12+i*.16,.85);if(p<=0)return;const ly=top+lh*(i+.5);c.save();c.beginPath();c.rect(0,ly-lh*.5,W,lh);c.clip();
        drawText(c,l,cen?W/2:m,ly+(1-p)*lh,{size,font:e.font,color:i===lines.length-1&&lines.length>1?ac:fg,align:cen?'center':'left',entrance:'none',lt,_k:'text',_moved:true});c.restore()});
      PRO.ts=save;c.restore();
      const bp=expo(lt,.05,.9);c.fillStyle=ac;if(cen)c.fillRect(W/2-W*.18*bp,top+bh+16*u,W*.36*bp,5*u);else c.fillRect(m,top-28*u,96*u*bp,7*u);
      if(s.sub)drawText(c,s.sub,cen?W/2:m,cen?top-44*u:top+bh+40*u,{size:26*u,font:FONTS.mono.css,color:rgba(fg,.78),align:cen?'center':'left',entrance:'typewriter',lt,delay:.7,spacing:.08});
      c.globalAlpha=.6*pr(lt,.4,.5);label(c,String(Math.floor(lt*24)).padStart(3,'0'),W-m,H-m*.6,13*u,FONTS.mono.css,fg,'right');c.globalAlpha=1;
    }},
  logoSting:{label:'로고 리빌 (로고 넣기)',media:1,mediaLabel:['로고'],opts:{ring:'링 드로잉',box:'라운드 박스',glow:'글로우 미니멀'},
    cues:()=>[{t:.1,sfx:'swell',v:.5},{t:.8,sfx:'chime',v:.8}],
    draw(c,s,lt,e){const{W,H,u,P}=e;const o=s.opt||'ring';softBg(c,e,P[0]);const cx=W/2,cy=H*(s.text?.41:.5),R=Math.min(W,H)*.16;const img=PRO.img(s.imgs&&s.imgs[0]);const p=pop(lt,.25,.7),a=pr(lt,.25,.3);
      if(o==='ring'){const rp=E.inOutCubic(pr(lt,0,.95));c.lineCap='round';c.strokeStyle=P[1];c.lineWidth=5*u;c.beginPath();c.arc(cx,cy,R*1.3,-Math.PI/2,-Math.PI/2+TAU*rp);c.stroke();c.strokeStyle=rgba(P[2],.75);c.lineWidth=2*u;c.beginPath();c.arc(cx,cy,R*1.5,Math.PI/2,Math.PI/2-TAU*rp,true);c.stroke();
        for(let i=0;i<8;i++){const q=pr(lt,.8+i*.03,.6);if(q<=0||q>=1)continue;const an=i*TAU/8+.3;c.strokeStyle=rgba(P[1],1-q);c.lineWidth=3*u;c.beginPath();c.moveTo(cx+Math.cos(an)*R*(1.6+q*.3),cy+Math.sin(an)*R*(1.6+q*.3));c.lineTo(cx+Math.cos(an)*R*(1.75+q*.5),cy+Math.sin(an)*R*(1.75+q*.5));c.stroke()}}
      if(o==='glow'){c.save();c.globalCompositeOperation='lighter';const gg=c.createRadialGradient(cx,cy,0,cx,cy,R*3.2);gg.addColorStop(0,rgba(P[1],.55*a*(.85+.15*Math.sin(lt*2))));gg.addColorStop(1,rgba(P[1],0));c.fillStyle=gg;c.fillRect(0,0,W,H);c.restore()}
      if(p>0){c.save();c.translate(cx,cy);c.scale(p,p);c.globalAlpha=a;
        if(o==='box'){c.save();softShadow(c,u,.32,40,16);c.fillStyle=img?'#ffffff':P[1];rr(c,-R*1.15,-R*1.15,R*2.3,R*2.3,R*.5);c.fill();c.restore()}
        if(img){const k=Math.min(R*1.8/img.width,R*1.8/img.height)*(o==='box'?.9:1.15);c.drawImage(img,-img.width*k/2,-img.height*k/2,img.width*k,img.height*k)}
        else{if(o!=='box'){c.fillStyle=P[1];c.beginPath();c.arc(0,0,R,0,TAU);c.fill()}const ch=([...String(s.text||'M').trim()][0]||'M').toUpperCase();label(c,ch,0,R*.06,R*1.15,e.font,onCol(P[1]),'center','400')}
        c.restore();
        const sp=pr(lt,.95,.7);if(sp>0&&sp<1){c.save();c.beginPath();c.arc(cx,cy,R*1.18,0,TAU);c.clip();c.globalCompositeOperation='lighter';c.translate(cx+lerp(-R*2.6,R*2.6,sp),cy);c.rotate(.4);sweep(c,0,R*.5,R*3,.6);c.restore()}}
      const ty=cy+R*1.5+58*u;if(s.text)drawText(c,s.text,W/2,ty,{size:fitSize(c,s.text,e.font,W*.8,58*u),font:e.font,color:P[3],entrance:s.entrance,lt,delay:.75,spacing:.06});
      if(s.sub)drawText(c,s.sub,W/2,ty+54*u,{size:26*u,font:e.body,color:rgba(P[3],.72),entrance:'fade',lt,delay:1.15,spacing:.24});
    }},
  photoHero:{label:'사진 히어로 (켄 번스)',media:1,mediaLabel:['사진'],opts:{full:'풀스크린',split:'분할 패널',frame:'액자 카드'},
    cues:()=>[{t:.1,sfx:'swell',v:.4}],
    draw(c,s,lt,e){const{W,H,u,P}=e;const o=s.opt||'full';const tall=H>W;const n=String(s.text||'').split('\n').length;
      if(o==='full'){drawMedia(c,e,s,0,0,0,W,H,lt);const g=c.createLinearGradient(0,H*.3,0,H);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.74)');c.fillStyle=g;c.fillRect(0,0,W,H);
        const m=W*.07,size=fitSize(c,s.text,e.font,W-2*m,tall?W*.14:Math.min(W*.1,96*u)),lh=size*1.12;const cy=H*.84-(s.sub?40*u:0)-(n-1)*lh/2;
        c.fillStyle=P[1];c.fillRect(m,cy-lh*n/2-26*u,72*u*expo(lt,.3,.8),6*u);
        drawText(c,s.text,m,cy,{size,font:e.font,color:'#ffffff',align:'left',entrance:s.entrance,lt,delay:.35,shadow:'rgba(0,0,0,.3)',shadowOff:size*.03});
        if(s.sub)drawText(c,s.sub,m,cy+lh*n/2+30*u,{size:26*u,font:e.body,color:'rgba(255,255,255,.86)',align:'left',entrance:'fade',lt,delay:.8,spacing:.08});return}
      softBg(c,e,P[0]);
      if(o==='split'){const p=E.inOutCubic(pr(lt,0,.9));const px=0,py=0,pw=tall?W:W*.52,ph=tall?H*.5:H;c.save();c.beginPath();if(tall)c.rect(0,0,W,ph*p);else c.rect(0,0,pw*p,H);c.clip();drawMedia(c,e,s,0,px,py,pw,ph,lt);c.restore();
        c.fillStyle=P[1];if(tall)c.fillRect(0,ph*p-6*u,W,6*u);else c.fillRect(pw*p-6*u,0,6*u,H);
        const tx=tall?W*.08:W*.58,tw=tall?W*.84:W*.36,cy=tall?H*.72:H*.48;const size=fitSize(c,s.text,e.font,tw,Math.min(W*.08,74*u)),lh=size*1.14;
        drawText(c,s.text,tx,cy-(n-1)*0,{size,font:e.font,color:P[3],align:'left',entrance:s.entrance,lt,delay:.5,lineH:1.14});
        c.fillStyle=P[1];c.fillRect(tx,cy+lh*n/2+18*u,60*u*expo(lt,.8,.7),4*u);
        if(s.sub)drawText(c,s.sub,tx,cy+lh*n/2+52*u,{size:Math.min(22*u,fitSize(c,s.sub,e.body,tw,22*u)),font:e.body,color:rgba(P[3],.78),align:'left',entrance:'fade',lt,delay:.95});return}
      const cw=tall?W*.78:Math.min(W*.46,H*.66*1.4),ch=tall?cw*1.08:cw*.7,cx=tall?W/2:W*.31,cy=tall?H*.4:H*.5;const p=pop(lt,.1,.8);
      if(p>0){c.save();c.translate(cx,cy+Math.sin(lt*.9)*4*u);c.rotate(-.035+(1-p)*.2);c.scale(lerp(.7,1,p),lerp(.7,1,p));c.globalAlpha=clamp(p*2);c.save();softShadow(c,u,.32,44,20);c.fillStyle='#ffffff';rr(c,-cw/2-14*u,-ch/2-14*u,cw+28*u,ch+28*u,10*u);c.fill();c.restore();drawMedia(c,e,s,0,-cw/2,-ch/2,cw,ch,lt,{r:4*u});c.restore()}
      const tx=tall?W/2:W*.6,al=tall?'center':'left',ty=tall?H*.8:H*.46;const size=fitSize(c,s.text,e.font,tall?W*.84:W*.34,Math.min(W*.08,70*u)),lh=size*1.14;
      drawText(c,s.text,tx,ty,{size,font:e.font,color:P[3],align:al,entrance:s.entrance,lt,delay:.5,lineH:1.14});
      if(s.sub)drawText(c,s.sub,tx,ty+lh*n/2+34*u,{size:26*u,font:e.body,color:rgba(P[3],.75),align:al,entrance:'fade',lt,delay:.9,spacing:.06});
    }},
  photoTrio:{label:'사진 3장 콜라주',media:3,mediaLabel:['사진 1','사진 2','사진 3'],opts:{columns:'3분할 스트립',stack:'카드 부채꼴'},
    cues:()=>[0,1,2].map(i=>({t:.1+i*.18,sfx:'swoosh',v:.5})),
    draw(c,s,lt,e){const{W,H,u,P}=e;const tall=H>W;
      if(s.opt==='stack'){softBg(c,e,P[0]);const cw=tall?W*.56:Math.min(W*.3,H*.5),ch=cw*1.25;[[-1,-.1],[1,.09],[0,-.02]].forEach(([dx,rot],i)=>{const p=pop(lt,.15+i*.22,.7);if(p<=0)return;const x=W/2+dx*cw*(tall?.42:.82),y=H*(tall?.45:.5)+(1-p)*H*.7+Math.sin(lt*.9+i)*4*u;c.save();c.translate(x,y);c.rotate(rot+(1-p)*.3);c.save();softShadow(c,u,.3,36,16);c.fillStyle='#ffffff';rr(c,-cw/2-10*u,-ch/2-10*u,cw+20*u,ch+20*u,10*u);c.fill();c.restore();drawMedia(c,e,s,i===2?0:i+1,-cw/2,-ch/2,cw,ch,lt,{r:5*u});c.restore()});
        if(s.text)drawText(c,s.text,W/2,H*(tall?.1:.1),{size:fitSize(c,s.text,e.font,W*.84,50*u),font:e.font,color:P[3],entrance:s.entrance,lt,delay:.5});
        if(s.sub)drawText(c,s.sub,W/2,H*(tall?.9:.92),{size:26*u,font:e.body,color:rgba(P[3],.75),entrance:'fade',lt,delay:.9,spacing:.1});return}
      c.fillStyle=P[4];c.fillRect(0,0,W,H);const g=8*u;for(let i=0;i<3;i++){const p=expo(lt,.1+i*.18,.9);if(p<=0)continue;const x=tall?g:g+i*(W-g)/3,y=tall?g+i*(H-g)/3:g,w=tall?W-2*g:(W-g)/3-g,h=tall?(H-g)/3-g:H-2*g;const dir=i%2?1:-1;c.save();rr(c,x,y,w,h,8*u);c.clip();const off=(1-p)*(tall?w:h)*dir;if(tall)c.translate(off,0);else c.translate(0,off);drawMedia(c,e,s,i,x,y,w,h,lt);c.restore()}
      if(s.text){const size=fitSize(c,s.text,e.font,W*.8,Math.min(W*.1,92*u));const n=String(s.text).split('\n').length;const bh=size*1.12*n+(s.sub?86:50)*u,bp=expo(lt,.6,.7);c.fillStyle=rgba(P[4],.82);c.fillRect(0,H/2-bh/2*bp,W,bh*bp);c.fillStyle=P[1];c.fillRect(0,H/2-bh/2*bp,W*bp,4*u);
        drawText(c,s.text,W/2,H/2-(s.sub?18*u:0),{size,font:e.font,color:onCol(P[4]),entrance:s.entrance,lt,delay:.75});
        if(s.sub)drawText(c,s.sub,W/2,H/2+size*.56*n+22*u,{size:26*u,font:e.body,color:rgba(onCol(P[4]),.8),entrance:'fade',lt,delay:1.05,spacing:.14})}
    }},
  glassCards:{label:'글래스 카드 (기능·특징 3가지)',opts:{dark:'다크 글래스',light:'라이트 글래스'},
    cues:s=>rowsOf(s.text,3).map((_,i)=>({t:.35+i*.2,sfx:'pop',v:.6})),
    draw(c,s,lt,e){const{W,H,u,P}=e;const dark=s.opt!=='light',tall=H>W;if(dark)meshBg(c,W,H,mix(P[0],'#000000',.72),[P[1],P[2],mix(P[1],P[2],.5)],lt,.6);else meshBg(c,W,H,mix(P[0],'#ffffff',.6),[P[1],P[2],mix(P[2],'#ffffff',.4)],lt,.6);
      const fg=dark?'#ffffff':inkOf(P);const items=rowsOf(s.text,3);const n=Math.max(1,items.length);
      if(s.sub)drawText(c,s.sub,W/2,H*(tall?.1:.15),{size:fitSize(c,s.sub,e.font,W*.84,46*u),font:e.font,color:fg,entrance:s.entrance,lt,delay:.1});
      const gap=22*u,cw=tall?W*.8:Math.min((W*.86-gap*(n-1))/n,360*u),ch=tall?Math.min(H*.2,220*u):Math.min(H*.46,300*u);const totW=tall?cw:cw*n+gap*(n-1),totH=tall?ch*n+gap*(n-1):ch;const x0=W/2-totW/2,y0=H*(tall?.55:.58)-totH/2;const ics=['bolt','heart','star'];
      items.forEach((it,i)=>{const p=pop(lt,.35+i*.2,.65);if(p<=0)return;const[t1,t2]=it.split(/\s*\|\s*/);const x=tall?x0:x0+i*(cw+gap),y=(tall?y0+i*(ch+gap):y0)+(1-p)*60*u+Math.sin(lt*1.1+i*1.7)*4*u;c.save();c.globalAlpha=clamp(p*1.6);glass(c,x,y,cw,ch,24*u,u,dark);
        const ix=tall?x+ch*.5:x+cw/2,iy=tall?y+ch/2:y+ch*.3,ir=Math.min(ch*.22,38*u);c.fillStyle=P[1];c.beginPath();c.arc(ix,iy,ir,0,TAU);c.fill();icon(c,ics[i%3],ix,iy,ir*.55,onCol(P[1]));
        const tx=tall?x+ch+4*u:x+cw/2,al=tall?'left':'center',tw=tall?cw-ch-20*u:cw-36*u,ty=tall?y+ch/2-(t2?14*u:0):y+ch*.62;
        label(c,t1||'',tx,ty,fitSize(c,t1||'',e.font,tw,28*u),e.font,fg,al,'400');if(t2)label(c,t2,tx,ty+(tall?34:38)*u,fitSize(c,t2,e.body,tw,20*u),e.body,rgba(fg,.72),al);c.restore()});
    }},
  subscribe:{label:'구독 · 좋아요 · 알림',media:1,mediaLabel:['채널 로고'],opts:{button:'구독 버튼 클릭',trio:'좋아요·알림·구독',bar:'하단 채널 바'},
    cues:s=>s.opt==='trio'?[0,1,2].map(i=>({t:.3+i*.3,sfx:'pop',v:.8})).concat([{t:1.35,sfx:'chime',v:.7}]):[{t:.2,sfx:'swoosh',v:.6},{t:1.22,sfx:'click',v:.9},{t:1.4,sfx:'bell',v:.7}],
    draw(c,s,lt,e){const{W,H,u,P}=e;const o=s.opt||'button';softBg(c,e,P[0]);for(let i=0;i<7;i++){const x=W*hash(i,1),y=((H*hash(i,2)-lt*(10+hash(i,3)*14)*u)%H+H)%H,r=(40+hash(i,4)*110)*u;c.fillStyle=rgba(i%2?P[1]:P[2],.1);c.beginPath();c.arc(x,y,r,0,TAU);c.fill()}
      const on=lt>1.25,press=1-.07*Math.max(0,1-Math.abs(lt-1.25)/.12);const red=P[1],off=mix(P[0],lum(P[0])<.5?'#ffffff':'#000000',.2);
      const btn=(x,y,w,h,k)=>{if(k<=0)return;c.save();c.translate(x,y);c.scale(k*press,k*press);softShadow(c,u,.25,24,10);pill(c,0,0,w,h,on?off:red);c.shadowColor='transparent';const fc=onCol(on?off:red);label(c,on?'구독중':'구독',on?-h*.2:0,h*.03,h*.42,e.body,fc,'center','700');if(on){c.save();c.translate(w/2-h*.52,0);c.rotate(Math.sin((lt-1.3)*26)*.38*Math.max(0,1-(lt-1.3)/.9));icon(c,'bell',0,0,h*.24,fc);c.restore()}c.restore()};
      const cursor=(x,y)=>{const a=pr(lt,.7,.25)*(1-pr(lt,1.7,.3));if(a<=0)return;const q=E.inOutCubic(pr(lt,.7,.5));const px=x+lerp(160*u,18*u,q),py=y+lerp(130*u,16*u,q);c.save();c.globalAlpha=a;c.translate(px,py);c.scale(press,press);softShadow(c,u,.3,10,4);c.fillStyle='#ffffff';c.strokeStyle='#14131a';c.lineWidth=2.5*u;c.lineJoin='round';c.beginPath();c.moveTo(0,0);c.lineTo(0,34*u);c.lineTo(9*u,26*u);c.lineTo(15*u,40*u);c.lineTo(21*u,37*u);c.lineTo(15*u,24*u);c.lineTo(26*u,23*u);c.closePath();c.fill();c.stroke();c.restore();
        const rp=pr(lt,1.25,.5);if(rp>0&&rp<1){c.strokeStyle=rgba(onCol(P[0]),.5*(1-rp));c.lineWidth=3*u;c.beginPath();c.arc(x+18*u,y+16*u,(20+rp*60)*u,0,TAU);c.stroke()}};
      if(o==='trio'){const names=['좋아요','알림 설정','구독'],ics=['thumb','bell','user'];const R=H>W?W*.115:Math.min(W*.085,H*.1,74*u),gap=R*2.9,cy=H*.44;names.forEach((nm,i)=>{const p=pop(lt,.3+i*.3,.55);if(p<=0)return;const x=W/2+(i-1)*gap,act=lt>.55+i*.3;c.save();c.translate(x,cy);c.scale(p,p);softShadow(c,u,.22,22,10);c.fillStyle=act?P[1]:'#ffffff';c.beginPath();c.arc(0,0,R,0,TAU);c.fill();c.shadowColor='transparent';c.save();if(i===1&&act)c.rotate(Math.sin((lt-.85)*24)*.3*Math.max(0,1-(lt-.85)/.9));icon(c,ics[i],0,0,R*.5,act?onCol(P[1]):'#14131a');c.restore();c.restore();
          const rp=pr(lt,.55+i*.3,.5);if(rp>0&&rp<1){c.strokeStyle=rgba(P[1],1-rp);c.lineWidth=4*u;c.beginPath();c.arc(x,cy,R*(1+rp*.6),0,TAU);c.stroke()}
          c.globalAlpha=clamp(p);label(c,nm,x,cy+R+34*u,24*u,e.body,rgba(P[3],.85));c.globalAlpha=1});
        if(s.text)drawText(c,s.text,W/2,H*.76,{size:fitSize(c,s.text,e.font,W*.84,54*u),font:e.font,color:P[3],entrance:s.entrance,lt,delay:1.1});if(s.sub)drawText(c,s.sub,W/2,H*.76+56*u,{size:26*u,font:e.body,color:rgba(P[3],.75),entrance:'fade',lt,delay:1.4});return}
      if(o==='bar'){const bw=Math.min(W*.86,900*u),bh=120*u,p=expo(lt,.2,.8),x=W/2-bw/2,y=H*.78-bh/2+(1-p)*H*.4;c.save();softShadow(c,u,.3,40,16);c.fillStyle='#ffffff';rr(c,x,y,bw,bh,bh/2);c.fill();c.restore();avatar(c,e,s,0,x+bh/2,y+bh/2,bh*.4,1);
        const tw=bw-bh*1.1-210*u;label(c,s.text||'',x+bh+4*u,y+bh/2-(s.sub?14*u:0),fitSize(c,s.text||'',e.font,tw,32*u),e.font,'#14131a','left','400');if(s.sub)label(c,s.sub,x+bh+4*u,y+bh/2+22*u,fitSize(c,s.sub,e.body,tw,17*u),e.body,'rgba(20,19,26,.6)','left');
        btn(x+bw-110*u,y+bh/2,170*u,62*u,p);cursor(x+bw-110*u,y+bh/2);return}
      const cy=H*.44;avatar(c,e,s,0,W/2,cy-150*u,62*u,pop(lt,.1,.6));if(s.text)drawText(c,s.text,W/2,cy-50*u,{size:fitSize(c,s.text,e.font,W*.84,52*u),font:e.font,color:P[3],entrance:s.entrance,lt,delay:.3});
      btn(W/2,cy+60*u,300*u,96*u,pop(lt,.45,.55));cursor(W/2,cy+60*u);if(s.sub)drawText(c,s.sub,W/2,cy+160*u,{size:26*u,font:e.body,color:rgba(P[3],.78),entrance:'fade',lt,delay:1.45});
    }},
  endScreen:{label:'유튜브 엔드 스크린',media:3,mediaLabel:['추천 영상','최신 영상','채널 로고'],opts:{duo:'영상 2칸 + 구독',single:'영상 1칸 + 구독'},
    cues:()=>[{t:.15,sfx:'swoosh',v:.5},{t:.4,sfx:'swoosh',v:.5},{t:.9,sfx:'pop',v:.7}],
    draw(c,s,lt,e){const{W,H,u,P}=e;const tall=H>W,one=s.opt==='single';meshBg(c,W,H,mix(P[0],'#000000',.7),[P[1],P[2]],lt,.4);
      if(s.text)drawText(c,s.text,W/2,H*(tall?.08:.12),{size:fitSize(c,s.text,e.font,W*.84,46*u),font:e.font,color:'#ffffff',entrance:s.entrance,lt,delay:.1});
      const n=one?1:2;const cw=tall?W*.62:(one?W*.46:W*.29),ch=cw*9/16,gap=tall?26*u:W*.03;const ax=tall?W/2:W*.17,ay=tall?H*.26:H*.56,AR=Math.min(W,H)*.11;
      const ap=pop(lt,.9,.6);c.strokeStyle=rgba(P[1],.9);c.lineWidth=4*u;c.beginPath();c.arc(ax,ay,AR*1.16,-Math.PI/2,-Math.PI/2+TAU*E.inOutCubic(pr(lt,.5,.9)));c.stroke();
      const proxy={...s,imgs:[s.imgs&&s.imgs[2]]};avatar(c,e,proxy,0,ax,ay,AR,ap);
      if(ap>0){c.globalAlpha=clamp(ap);pill(c,ax,ay+AR+46*u,150*u,46*u,P[1]);label(c,'구독',ax,ay+AR+47*u,21*u,e.body,onCol(P[1]),'center','700');if(s.sub)label(c,s.sub,ax,ay+AR+98*u,fitSize(c,s.sub,e.body,tall?W*.8:W*.28,19*u),e.body,'rgba(255,255,255,.8)');c.globalAlpha=1}
      const labs=['추천 영상','최신 영상'];for(let i=0;i<n;i++){const p=expo(lt,.15+i*.25,.85);if(p<=0)continue;const x=tall?W/2-cw/2:(one?W*.42:W*.36+i*(cw+gap)),y=(tall?H*.44+i*(ch+gap+34*u):H*.56-ch/2)+(1-p)*80*u;c.save();c.globalAlpha=clamp(p*1.5);c.save();softShadow(c,u,.4,36,16);c.fillStyle='#000';rr(c,x,y,cw,ch,14*u);c.fill();c.restore();drawMedia(c,e,s,i,x,y,cw,ch,lt,{r:14*u});
        c.strokeStyle='rgba(255,255,255,.28)';c.lineWidth=1.5*u;rr(c,x,y,cw,ch,14*u);c.stroke();const pr2=30*u*(1+.06*Math.sin(lt*4+i));c.fillStyle='rgba(0,0,0,.45)';c.beginPath();c.arc(x+cw/2,y+ch/2,pr2,0,TAU);c.fill();icon(c,'play',x+cw/2,y+ch/2,pr2*.5,'#ffffff');
        label(c,labs[i],x+4*u,y+ch+26*u,21*u,e.body,'rgba(255,255,255,.82)','left');c.restore()}
    }},
  statCount:{label:'숫자 카운트업 (성과·통계)',opts:{big:'빅 넘버',ring:'링 게이지',trio:'3가지 지표'},
    cues:(s,vis)=>[.3,.55,.8,1.05].map(t=>({t,sfx:'tick',v:.4})).concat([{t:1.6,sfx:'pop',v:.8}]),
    draw(c,s,lt,e){const{W,H,u,P}=e;const o=s.opt||'big',tall=H>W;softBg(c,e,P[0]);const toks=String(s.text||'100').split(/\s+/).filter(Boolean).map(parseStat);const labs=partsOf(s.sub);const cp=d=>E.outExpo(pr(lt,d,1.4));
      if(o==='trio'){const n=Math.min(3,toks.length)||1;for(let i=0;i<n;i++){const x=tall?W/2:W*(.5+(i-(n-1)/2)*.29),y=tall?H*(.5+(i-(n-1)/2)*.24):H*.47;const a=pr(lt,.2+i*.2,.4);if(a<=0)continue;c.globalAlpha=a;const txt=fmtStat(toks[i],cp(.25+i*.2));const size=fitSize(c,fmtStat(toks[i],1),e.font,tall?W*.7:W*.25,Math.min(W*.11,104*u))*PRO.ts;label(c,txt,x,y,size,e.font,i===1?P[1]:P[3],'center','400');
          if(labs[i])label(c,labs[i],x,y+size*.62+26*u,26*u,e.body,rgba(P[3],.72));c.globalAlpha=1;
          if(i<n-1){c.fillStyle=rgba(P[3],.18);if(tall)c.fillRect(W*.3,y+H*.12,W*.4,1.5*u);else c.fillRect(x+W*.145,H*.36,1.5*u,H*.26*expo(lt,.3,.8))}}return}
      const st=toks[0]||parseStat('100');const p=cp(.25);const txt=fmtStat(st,p);
      if(o==='ring'){const R=Math.min(W,H)*.25,cx=W/2,cy=H*.46;const frac=st.num==null?1:clamp(st.num/100);c.lineCap='round';c.strokeStyle=rgba(P[3],.12);c.lineWidth=22*u;c.beginPath();c.arc(cx,cy,R,0,TAU);c.stroke();const g=c.createLinearGradient(cx-R,cy-R,cx+R,cy+R);g.addColorStop(0,P[1]);g.addColorStop(1,P[2]);c.strokeStyle=g;c.beginPath();c.arc(cx,cy,R,-Math.PI/2,-Math.PI/2+TAU*frac*p+.001);c.stroke();
        const ha=-Math.PI/2+TAU*frac*p;c.fillStyle='#ffffff';c.beginPath();c.arc(cx+Math.cos(ha)*R,cy+Math.sin(ha)*R,7*u,0,TAU);c.fill();
        label(c,txt,cx,cy+4*u,fitSize(c,fmtStat(st,1),e.font,R*1.5,R*.62)*PRO.ts,e.font,P[3],'center','400');if(s.sub)drawText(c,s.sub,W/2,cy+R+62*u,{size:26*u,font:e.body,color:rgba(P[3],.8),entrance:'rise',lt,delay:.6});return}
      const size=fitSize(c,fmtStat(st,1),e.font,W*.82,Math.min(H*.36,W*.3))*PRO.ts;const a=pr(lt,.15,.35);c.save();c.globalAlpha=a;c.translate(W/2,H*.45);const sc=lerp(.86,1,E.outCubic(pr(lt,.15,.9)));c.scale(sc,sc);
      c.font=`400 ${size}px ${e.font}`;c.textAlign='center';c.textBaseline='middle';c.fillStyle=rgba(P[1],.22);c.fillText(txt,size*.035,size*.045);const g=c.createLinearGradient(0,-size*.5,0,size*.5);g.addColorStop(0,P[3]);g.addColorStop(1,mix(P[3],P[1],.55));c.fillStyle=g;c.fillText(txt,0,0);c.restore();
      c.fillStyle=P[1];const bw=W*.22*expo(lt,.5,1);c.fillRect(W/2-bw/2,H*.45+size*.56,bw,5*u);if(s.sub)drawText(c,s.sub,W/2,H*.45+size*.56+48*u,{size:28*u,font:e.body,color:rgba(P[3],.82),entrance:'rise',lt,delay:.7,spacing:.06});
    }},
  steps:{label:'단계 · 체크리스트',opts:{steps:'번호 단계',check:'체크리스트',timeline:'타임라인'},
    cues:s=>rowsOf(s.text,5).map((_,i)=>({t:.35+i*.3,sfx:s.opt==='check'?'click':'pop',v:.6})),
    draw(c,s,lt,e){const{W,H,u,P}=e;const o=s.opt||'steps';softBg(c,e,P[0]);const items=rowsOf(s.text,5);const n=Math.max(1,items.length);const m=W*.1;const top=H*(s.sub?.28:.16),bot=H*.9;const rh=Math.min((bot-top)/n,120*u);const y0=(top+bot)/2-rh*n/2;
      if(s.sub){drawText(c,s.sub,m,H*.14,{size:fitSize(c,s.sub,e.font,W-2*m,46*u),font:e.font,color:P[3],align:'left',entrance:s.entrance,lt,delay:.05});c.fillStyle=P[1];c.fillRect(m,H*.14+40*u,70*u*expo(lt,.3,.7),5*u)}
      const br=Math.min(rh*.3,30*u);const lineP=E.inOutCubic(pr(lt,.3,.3*n+.3));if(o!=='check'&&n>1){c.strokeStyle=rgba(P[3],.18);c.lineWidth=3*u;c.beginPath();c.moveTo(m+br,y0+rh*.5);c.lineTo(m+br,y0+rh*(n-.5));c.stroke();c.strokeStyle=P[1];c.beginPath();c.moveTo(m+br,y0+rh*.5);c.lineTo(m+br,y0+rh*.5+rh*(n-1)*lineP);c.stroke()}
      items.forEach((it,i)=>{const d=.35+i*.3,p=expo(lt,d,.7),bp=pop(lt,d,.45);if(p<=0)return;const y=y0+rh*(i+.5),bx=m+br;const[t1,t2]=it.split(/\s*\|\s*/);
        c.save();c.translate(bx,y);c.scale(bp,bp);if(o==='check'){const done=pr(lt,d+.25,.3);c.fillStyle=done>0?P[1]:'rgba(0,0,0,0)';c.strokeStyle=done>0?P[1]:rgba(P[3],.5);c.lineWidth=3*u;rr(c,-br,-br,br*2,br*2,br*.35);c.fill();c.stroke();if(done>0){c.strokeStyle=onCol(P[1]);c.lineWidth=br*.22;c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(-br*.5,0);c.lineTo(-br*.5+br*.36*clamp(done*2),br*.36*clamp(done*2));if(done>.5)c.lineTo(-br*.14+br*.66*(done-.5)*2,br*.36-br*.72*(done-.5)*2);c.stroke()}}
        else{c.fillStyle=o==='timeline'?P[0]:P[1];c.strokeStyle=P[1];c.lineWidth=4*u;c.beginPath();c.arc(0,0,o==='timeline'?br*.5:br,0,TAU);c.fill();if(o==='timeline')c.stroke();else label(c,String(i+1),0,br*.06,br*1.05,e.font,onCol(P[1]),'center','400')}c.restore();
        const tx=m+br*2+24*u,tw=W-m-tx;c.save();c.globalAlpha=clamp(pr(lt,d,.35));c.translate((1-p)*-40*u,0);label(c,t1||'',tx,y-(t2?13*u:0),fitSize(c,t1||'',e.font,tw,Math.min(34*u,rh*.36))*PRO.ts,e.font,P[3],'left','400');if(t2)label(c,t2,tx,y+24*u,fitSize(c,t2,e.body,tw,21*u),e.body,rgba(P[3],.68),'left');c.restore()});
    }},
  versus:{label:'VS 비교 대결',opts:{diagonal:'대각 분할',straight:'수직 분할'},
    cues:()=>[{t:.05,sfx:'whoosh',v:.7},{t:.6,sfx:'impact',v:1,shake:1}],
    draw(c,s,lt,e){const{W,H,u,P}=e;const tall=H>W;const[a,b]=[...rowsOf(s.text,2),'',''];const[sa,sb]=[...partsOf(s.sub),'',''];const sk=s.opt==='straight'?0:(tall?H*.06:W*.09);const p1=expo(lt,.05,.7),p2=expo(lt,.15,.7);const ca=P[1],cb=lum(P[4])<.5?P[4]:P[2];
      c.fillStyle=cb;c.fillRect(0,0,W,H);c.save();if(tall){c.translate(0,-(1-p1)*H*.6);c.beginPath();c.moveTo(0,0);c.lineTo(W,0);c.lineTo(W,H/2-sk);c.lineTo(0,H/2+sk);c.closePath()}else{c.translate(-(1-p1)*W*.6,0);c.beginPath();c.moveTo(0,0);c.lineTo(W/2+sk,0);c.lineTo(W/2-sk,H);c.lineTo(0,H);c.closePath()}c.fillStyle=ca;c.fill();c.clip();
      c.fillStyle=rgba('#ffffff',.08);for(let i=-8;i<16;i++){c.save();c.translate(i*90*u+((lt*60*u)%(90*u)),0);c.transform(1,0,-.4,1,0,0);c.fillRect(0,0,34*u,H*1.2);c.restore()}c.restore();
      const g=c.createRadialGradient(tall?W/2:W*.78,tall?H*.76:H/2,0,tall?W/2:W*.78,tall?H*.76:H/2,Math.max(W,H)*.5);g.addColorStop(0,rgba(P[2],.3*p2));g.addColorStop(1,rgba(P[2],0));c.fillStyle=g;c.fillRect(0,0,W,H);
      const pa=tall?[W/2,H*.24]:[W*.25,H*.48],pb=tall?[W/2,H*.76]:[W*.75,H*.48];const mw=tall?W*.8:W*.38;
      drawText(c,a,pa[0],pa[1],{size:fitSize(c,a,e.font,mw,Math.min(W*.12,104*u)),font:e.font,color:onCol(ca),entrance:s.entrance,lt,delay:.25});if(sa)drawText(c,sa,pa[0],pa[1]+84*u,{size:26*u,font:e.body,color:rgba(onCol(ca),.8),entrance:'fade',lt,delay:.9});
      drawText(c,b,pb[0],pb[1],{size:fitSize(c,b,e.font,mw,Math.min(W*.12,104*u)),font:e.font,color:onCol(cb),entrance:s.entrance,lt,delay:.35});if(sb)drawText(c,sb,pb[0],pb[1]+84*u,{size:26*u,font:e.body,color:rgba(onCol(cb),.8),entrance:'fade',lt,delay:1});
      const vp=pr(lt,.6,.2);if(vp>0){const sc=1+2.2*(1-E.outCubic(vp)),R=Math.min(W,H)*.1;c.save();c.translate(W/2,H/2);c.rotate(-.1);c.scale(sc,sc);c.globalAlpha=clamp(vp*3);softShadow(c,u,.4,30,10);c.fillStyle='#ffffff';starPath(c,0,0,R*1.45,R*1.1,12,lt*.4);c.fill();c.shadowColor='transparent';label(c,'VS',0,R*.06,R*1.05,FONTS.anton.css,'#14131a','center','400');c.restore()}
    }},
  review:{label:'별점 후기 카드',opts:{card:'화이트 카드',dark:'다크 글래스'},
    cues:()=>[0,1,2,3,4].map(i=>({t:.5+i*.1,sfx:'tick',v:.5})).concat([{t:1.05,sfx:'sparkle',v:.5}]),
    draw(c,s,lt,e){const{W,H,u,P}=e;const dark=s.opt==='dark';if(dark)meshBg(c,W,H,mix(P[0],'#000000',.72),[P[1],P[2]],lt,.5);else softBg(c,e,P[0]);
      const m=/(\d(?:\.\d)?)\s*$/.exec(s.sub||'');const rate=m?clamp(parseFloat(m[1]),0,5):5;const who=String(s.sub||'').replace(/[·\-—\s]*\d(?:\.\d)?\s*$/,'').trim();
      const cw=Math.min(W*.8,860*u),ch=Math.min(H*.62,cw*.62),x=W/2-cw/2,p=pop(lt,.1,.7),y=H/2-ch/2+(1-p)*60*u;const fg=dark?'#ffffff':'#14131a';c.save();c.globalAlpha=clamp(p*1.6);
      if(dark)glass(c,x,y,cw,ch,28*u,u,true);else{c.save();softShadow(c,u,.2,50,22);c.fillStyle='#ffffff';rr(c,x,y,cw,ch,28*u);c.fill();c.restore()}
      c.fillStyle=rgba(P[1],.2);c.font=`800 ${ch*.7}px ${FONTS.myeongjo.css}`;c.textBaseline='middle';c.textAlign='left';c.fillText('“',x+24*u,y+ch*.36);
      const ss=Math.min(22*u,cw*.035);for(let i=0;i<5;i++){const q=pop(lt,.5+i*.1,.4);const sx=W/2+(i-2)*ss*2.5,sy=y+ch*.17;c.fillStyle=rgba(fg,.14);starPath(c,sx,sy,ss,ss*.45);c.fill();if(q>0&&i<Math.round(rate)){c.fillStyle='#ffb400';starPath(c,sx,sy,ss*q,ss*.45*q);c.fill()}}
      c.restore();const n=String(s.text||'').split('\n').length;const size=fitSize(c,s.text,e.font,cw*.82,Math.min(40*u,ch*.5/n/1.4));drawText(c,s.text,W/2,y+ch*.5,{size,font:e.font,color:fg,entrance:s.entrance,lt,delay:.7,lineH:1.4});
      if(who){const a=pr(lt,1.2,.4);c.globalAlpha=a;const ay=y+ch*.84;c.font=`500 ${20*u}px ${e.body}`;const tw=c.measureText(who).width;const ax=W/2-tw/2-22*u;c.fillStyle=P[1];c.beginPath();c.arc(ax,ay,17*u,0,TAU);c.fill();icon(c,'user',ax,ay,9*u,onCol(P[1]));label(c,who,ax+28*u,ay+1*u,20*u,e.body,rgba(fg,.75),'left');c.globalAlpha=1}
    }},
  sale:{label:'세일 · 쿠폰 배너',opts:{burst:'버스트 배지',ticket:'쿠폰 티켓',stripe:'스트라이프 마키'},
    cues:()=>[{t:.05,sfx:'whoosh',v:.6},{t:.32,sfx:'impact',v:1,shake:1},{t:.9,sfx:'sparkle',v:.5}],
    draw(c,s,lt,e){const{W,H,u,P}=e;const o=s.opt||'burst';const big=s.text||'50%';
      if(o==='ticket'){softBg(c,e,P[0]);const cw=Math.min(W*.82,880*u),ch=Math.min(cw*.42,H*.5),p=expo(lt,.1,.8),x=W/2-cw/2+(1-p)*W,y=H/2-ch/2,cut=cw*.7,nr=20*u;c.save();c.translate(W/2,H/2);c.rotate(-.04+Math.sin(lt*1.2)*.01);c.translate(-W/2,-H/2);softShadow(c,u,.28,40,18);
        c.fillStyle=P[1];c.beginPath();c.moveTo(x+18*u,y);c.lineTo(x+cut-nr,y);c.arc(x+cut,y,nr,Math.PI,0,true);c.lineTo(x+cw-18*u,y);c.quadraticCurveTo(x+cw,y,x+cw,y+18*u);c.lineTo(x+cw,y+ch-18*u);c.quadraticCurveTo(x+cw,y+ch,x+cw-18*u,y+ch);c.lineTo(x+cut+nr,y+ch);c.arc(x+cut,y+ch,nr,0,Math.PI,true);c.lineTo(x+18*u,y+ch);c.quadraticCurveTo(x,y+ch,x,y+ch-18*u);c.lineTo(x,y+18*u);c.quadraticCurveTo(x,y,x+18*u,y);c.closePath();c.fill();c.shadowColor='transparent';
        const fc=onCol(P[1]);c.strokeStyle=rgba(fc,.5);c.lineWidth=2.5*u;c.setLineDash([10*u,9*u]);c.beginPath();c.moveTo(x+cut,y+nr+8*u);c.lineTo(x+cut,y+ch-nr-8*u);c.stroke();c.setLineDash([]);
        label(c,big,x+cut/2,y+ch*.46,fitSize(c,big,e.font,cut*.8,ch*.52)*PRO.ts,e.font,fc,'center','400');if(s.sub)label(c,s.sub,x+cut/2,y+ch*.82,fitSize(c,s.sub,e.body,cut*.84,20*u),e.body,rgba(fc,.85));
        c.save();c.translate(x+cut+(cw-cut)/2,y+ch/2);c.rotate(-Math.PI/2);label(c,'COUPON',0,0,Math.min(34*u,ch*.2),FONTS.anton.css,fc,'center','400');c.restore();
        const sp=pr(lt,.9,.8);if(sp>0&&sp<1){c.save();rr(c,x,y,cw,ch,18*u);c.clip();c.globalCompositeOperation='lighter';c.translate(x+lerp(-cw*.2,cw*1.2,sp),y);c.rotate(.35);sweep(c,0,cw*.1,ch*2,.5);c.restore()}c.restore();return}
      if(o==='stripe'){c.fillStyle=P[0];c.fillRect(0,0,W,H);const msg=((s.sub||'SALE')+'   ✦   ').repeat(3);c.font=`400 ${38*u}px ${e.font}`;const mw=Math.max(60*u,c.measureText(msg).width);[[H*.16,-1,P[1]],[H*.84,1,P[4]]].forEach(([y,dir,col],k)=>{c.save();c.translate(W/2,y);c.rotate(dir*-.05);const bp=expo(lt,.05+k*.1,.7);c.fillStyle=col;c.fillRect(-W*.7*bp,-38*u,W*1.4*bp,76*u);c.beginPath();c.rect(-W*.7*bp,-38*u,W*1.4*bp,76*u);c.clip();c.fillStyle=onCol(col);c.textBaseline='middle';c.textAlign='left';c.font=`400 ${38*u}px ${e.font}`;const off=((lt*120*u*dir)%mw+mw)%mw;for(let x=-W*.7-mw+off;x<W*.7;x+=mw)c.fillText(msg,x,3*u);c.restore()});
        const size=fitSize(c,big,e.font,W*.84,Math.min(H*.4,W*.3));drawText(c,big,W/2,H/2,{size,font:e.font,color:P[3],entrance:s.entrance==='none'?'none':'slam',lt,delay:.3,skew:-.1,shadow:P[1],shadowOff:size*.045});return}
      c.fillStyle=P[1];c.fillRect(0,0,W,H);c.save();c.translate(W/2,H/2);c.rotate(lt*.12);c.fillStyle=rgba('#ffffff',.1);for(let i=0;i<18;i++){c.beginPath();c.moveTo(0,0);c.arc(0,0,Math.hypot(W,H),i*TAU/18,i*TAU/18+TAU/36);c.closePath();c.fill()}c.restore();
      const bp=E.outElastic(pr(lt,.3,1)),R=Math.min(W,H)*.34*bp;if(R>2){c.save();c.translate(W/2,H*.48);c.rotate(lt*.25);softShadow(c,u,.3,40,16);c.fillStyle=P[2];starPath(c,0,0,R*1.12,R*.96,20);c.fill();c.shadowColor='transparent';c.strokeStyle=rgba(onCol(P[2]),.35);c.lineWidth=3*u;c.setLineDash([6*u,8*u]);c.beginPath();c.arc(0,0,R*.82,0,TAU);c.stroke();c.setLineDash([]);c.restore();
        const size=fitSize(c,big,e.font,R*1.36,R*.78);drawText(c,big,W/2,H*.48,{size,font:e.font,color:onCol(P[2]),entrance:'none',lt,skew:-.08,shadow:rgba(P[1],.9),shadowOff:size*.05})}
      for(let i=0;i<10;i++){const q=pr(lt,.9+i*.06,.5);if(q<=0)continue;const an=hash(i,3)*TAU,r=Math.min(W,H)*(.42+hash(i,4)*.1);c.fillStyle='#ffffff';starPath(c,W/2+Math.cos(an)*r*1.3,H*.48+Math.sin(an)*r*.8,14*u*E.outBack(q)*(1+.2*Math.sin(lt*6+i)),5*u,4);c.fill()}
      if(s.sub){const p=pop(lt,.8,.5);c.font=`700 ${26*u}px ${e.body}`;const tw=c.measureText(s.sub).width+56*u;if(p>0){c.save();c.translate(W/2,H*.9);c.scale(p,p);pill(c,0,0,tw,58*u,P[4]);label(c,s.sub,0,2*u,26*u,e.body,onCol(P[4]),'center','700');c.restore()}}
    }},
  invite:{label:'초대장 · 안내 카드',media:1,mediaLabel:['사진'],opts:{classic:'클래식 프레임',modern:'모던 정보형',photo:'아치 사진'},
    cues:()=>[{t:.1,sfx:'swell',v:.4},{t:1.1,sfx:'chime',v:.6}],
    draw(c,s,lt,e){const{W,H,u,P}=e;const o=s.opt||'classic',tall=H>W;softBg(c,e,P[0]);const rows=partsOf(s.sub);const n=String(s.text||'').split('\n').length;const info=(x,y,al)=>rows.forEach((r,i)=>{const a=pr(lt,1+i*.18,.45);if(a<=0)return;c.globalAlpha=a;const yy=y+i*44*u+(1-E.outCubic(a))*14*u;if(al==='left'){icon(c,i%2?'pin':'clock',x+10*u,yy,10*u,P[1]);label(c,r,x+34*u,yy+1*u,24*u,e.body,rgba(P[3],.86),'left')}else label(c,r,x,yy,24*u,e.body,rgba(P[3],.86));c.globalAlpha=1});
      if(o==='modern'){const m=W*.09;const bw=tall?W:W*.34;c.fillStyle=P[1];const bp=expo(lt,0,.9);if(tall)c.fillRect(0,0,W,H*.3*bp);else c.fillRect(W-bw*bp,0,bw*bp,H);const fc=onCol(P[1]);c.globalAlpha=pr(lt,.5,.5);label(c,'INVITATION',tall?W/2:W-bw/2,tall?H*.15:H*.5,Math.min(tall?W*.1:bw*.14,60*u),FONTS.anton.css,rgba(fc,.9),'center','400');c.globalAlpha=1;
        const ty=tall?H*.48:H*.4;const size=fitSize(c,s.text,e.font,tall?W-2*m:W*.5,tall?W*.12:Math.min(W*.085,78*u));drawText(c,s.text,m,ty,{size,font:e.font,color:P[3],align:'left',entrance:s.entrance,lt,delay:.35,lineH:1.16});const ly=ty+size*1.16*n/2+26*u;c.fillStyle=P[1];c.fillRect(m,ly,80*u*expo(lt,.8,.7),5*u);info(m,ly+44*u,'left');return}
      if(o==='photo'){const aw=tall?W*.62:Math.min(W*.3,H*.5),ah=aw*1.3,ax=tall?W/2:W*.28,ay=tall?H*.33:H*.5;const p=expo(lt,.1,1);c.save();c.beginPath();c.moveTo(ax-aw/2,ay+ah/2);c.lineTo(ax-aw/2,ay-ah/2+aw/2);c.arc(ax,ay-ah/2+aw/2,aw/2,Math.PI,0);c.lineTo(ax+aw/2,ay+ah/2);c.closePath();c.save();softShadow(c,u,.25,40,18);c.fillStyle=P[2];c.fill();c.restore();c.clip();c.translate(0,(1-p)*ah*.25);c.globalAlpha=clamp(p*1.5);drawMedia(c,e,s,0,ax-aw/2,ay-ah/2,aw,ah,lt);c.restore();
        c.strokeStyle=rgba(P[1],.9);c.lineWidth=2*u;const q=E.inOutCubic(pr(lt,.3,1.1));c.beginPath();c.arc(ax,ay-ah/2+aw/2,aw/2+14*u,Math.PI,Math.PI+Math.PI*q);c.stroke();
        const tx=tall?W/2:W*.66,ty=tall?H*.7:H*.4;const size=fitSize(c,s.text,e.font,tall?W*.84:W*.4,tall?W*.11:Math.min(W*.08,70*u));drawText(c,s.text,tx,ty,{size,font:e.font,color:P[3],entrance:s.entrance,lt,delay:.5,lineH:1.2});const ly=ty+size*1.2*n/2+22*u;c.fillStyle=P[1];const lw=60*u*expo(lt,.9,.7);c.fillRect(tx-lw/2,ly,lw,2*u);info(tx,ly+40*u,'center');return}
      const fm=Math.min(W,H)*.06,fp=E.inOutCubic(pr(lt,0,1.2));c.strokeStyle=P[1];c.lineWidth=2*u;const per=2*(W+H-4*fm);c.setLineDash([per*fp,per]);c.strokeRect(fm,fm,W-2*fm,H-2*fm);c.setLineDash([]);c.strokeStyle=rgba(P[1],.4*pr(lt,.8,.6));c.lineWidth=1*u;c.strokeRect(fm+10*u,fm+10*u,W-2*fm-20*u,H-2*fm-20*u);
      const ty=H*(rows.length?.4:.48);const dp=pop(lt,.3,.6);if(dp>0){c.save();c.translate(W/2,ty-H*.2);c.rotate(Math.PI/4);c.scale(dp,dp);c.fillStyle=P[1];c.fillRect(-7*u,-7*u,14*u,14*u);c.restore();c.fillStyle=rgba(P[1],.6);c.fillRect(W/2-90*u*dp,ty-H*.2-.5*u,66*u*dp,1*u);c.fillRect(W/2+24*u,ty-H*.2-.5*u,66*u*dp,1*u)}
      const size=fitSize(c,s.text,e.font,W*.72,tall?W*.11:Math.min(W*.085,78*u));drawText(c,s.text,W/2,ty,{size,font:e.font,color:P[3],entrance:s.entrance,lt,delay:.4,lineH:1.25});info(W/2,ty+size*1.25*n/2+50*u,'center');
    }},
  phoneMock:{label:'스마트폰 목업 (화면 넣기)',media:1,mediaLabel:['앱 화면'],opts:{float:'플로팅',tilt:'기울임 + 알림 칩'},
    cues:()=>[{t:.15,sfx:'swoosh',v:.6},{t:.9,sfx:'notify',v:.6}],
    draw(c,s,lt,e){const{W,H,u,P}=e;const tall=H>W;meshBg(c,W,H,mix(P[0],lum(P[0])<.5?'#000000':'#ffffff',.35),[P[1],P[2]],lt,.5);const dark=lum(P[0])<.5;const fg=dark?'#ffffff':inkOf(P);
      const ph=tall?H*.52:H*.78,pw=ph*.49,cx=tall?W/2:W*.7,cy=tall?H*.6:H*.52;const p=expo(lt,.15,1);c.save();c.translate(cx,cy+(1-p)*H*.7+Math.sin(lt*1.1)*6*u);c.rotate((s.opt==='tilt'?-.12:0)+(1-p)*.25);c.save();softShadow(c,u,.4,60,30);c.fillStyle='#101014';rr(c,-pw/2,-ph/2,pw,ph,pw*.14);c.fill();c.restore();
      const b=pw*.035,sr=pw*.11;const has=PRO.img(s.imgs&&s.imgs[0]);if(has)drawMedia(c,e,s,0,-pw/2+b,-ph/2+b,pw-2*b,ph-2*b,lt,{r:sr,still:true});
      else{c.save();rr(c,-pw/2+b,-ph/2+b,pw-2*b,ph-2*b,sr);c.clip();const g=c.createLinearGradient(0,-ph/2,0,ph/2);g.addColorStop(0,mix(P[1],'#ffffff',.1));g.addColorStop(1,mix(P[2],P[1],.3));c.fillStyle=g;c.fillRect(-pw/2,-ph/2,pw,ph);
        const iw=pw-2*b-pw*.14,ix=-iw/2;[[.16,.2,.9],[.4,.12,.75],[.56,.12,.75],[.72,.12,.75]].forEach(([fy,fh,al],i)=>{const q=expo(lt,.6+i*.12,.6);c.globalAlpha=q*al;c.fillStyle='rgba(255,255,255,.92)';rr(c,ix,-ph/2+ph*fy+(1-q)*30*u,iw,ph*fh,pw*.05);c.fill();if(i){c.fillStyle=rgba(P[1],.9);c.beginPath();c.arc(ix+ph*fh*.5,-ph/2+ph*(fy+fh/2)+(1-q)*30*u,ph*fh*.28,0,TAU);c.fill();c.fillStyle='rgba(20,19,26,.25)';rr(c,ix+ph*fh,-ph/2+ph*(fy+fh*.3)+(1-q)*30*u,iw*.5,ph*fh*.16,3*u);c.fill();rr(c,ix+ph*fh,-ph/2+ph*(fy+fh*.58)+(1-q)*30*u,iw*.32,ph*fh*.14,3*u);c.fill()}});c.globalAlpha=1;c.restore()}
      c.fillStyle='#101014';rr(c,-pw*.16,-ph/2+b+pw*.03,pw*.32,pw*.07,pw*.035);c.fill();c.save();rr(c,-pw/2,-ph/2,pw,ph,pw*.14);c.clip();c.globalCompositeOperation='lighter';const sp=((lt*.35)%1.8);c.translate(lerp(-pw,pw,sp),0);c.rotate(.4);sweep(c,0,pw*.2,ph,.14);c.restore();
      if(s.opt==='tilt'){[[-.78,-.22,'check','결제 완료'],[.74,.16,'heart','새 알림 3건']].forEach(([fx,fy,ic,tx],i)=>{const q=pop(lt,.9+i*.3,.5);if(q<=0)return;c.save();c.translate(pw*fx,ph*fy+Math.sin(lt*1.4+i*2)*6*u);c.rotate(.12);c.scale(q,q);c.font=`600 ${17*u}px ${e.body}`;const w=c.measureText(tx).width+74*u;softShadow(c,u,.25,24,10);c.fillStyle='#ffffff';rr(c,-w/2,-26*u,w,52*u,26*u);c.fill();c.shadowColor='transparent';c.fillStyle=P[1];c.beginPath();c.arc(-w/2+27*u,0,16*u,0,TAU);c.fill();icon(c,ic,-w/2+27*u,0,8.5*u,onCol(P[1]));label(c,tx,-w/2+52*u,1*u,17*u,e.body,'#14131a','left','600');c.restore()})}
      c.restore();const tx=tall?W/2:W*.09,al=tall?'center':'left',ty=tall?H*.14:H*.44,tw=tall?W*.84:W*.42;const n=String(s.text||'').split('\n').length;const size=fitSize(c,s.text,e.font,tw,Math.min(W*.085,78*u));
      drawText(c,s.text,tx,ty,{size,font:e.font,color:fg,align:al,entrance:s.entrance,lt,delay:.4,lineH:1.16});if(s.sub)drawText(c,s.sub,tx,ty+size*1.16*n/2+36*u,{size:Math.min(23*u,fitSize(c,s.sub,e.body,tw,23*u)),font:e.body,color:rgba(fg,.78),align:al,entrance:'fade',lt,delay:.85});
    }},
  chapter:{label:'챕터 넘버 타이틀',opts:{number:'아웃라인 숫자',bar:'사이드 바'},
    cues:()=>[{t:.1,sfx:'whoosh',v:.5},{t:.5,sfx:'click',v:.6}],
    draw(c,s,lt,e){const{W,H,u,P}=e;softBg(c,e,P[0]);const num=(/\d+/.exec(s.sub||'')||['01'])[0].padStart(2,'0');const m=W*.09;const n=String(s.text||'').split('\n').length;
      if(s.opt==='bar'){const bp=expo(lt,0,.8);c.fillStyle=P[1];c.fillRect(0,0,W*.035*bp,H);c.fillRect(m,H*.5-70*u,6*u,140*u*bp);label(c,num,m+34*u,H*.5-44*u,54*u,FONTS.anton.css,rgba(P[1],pr(lt,.2,.4)),'left','400');
        const size=fitSize(c,s.text,e.font,W-m*2-40*u,Math.min(W*.08,76*u));drawText(c,s.text,m+34*u,H*.5+26*u+(n-1)*size*.5,{size,font:e.font,color:P[3],align:'left',entrance:s.entrance,lt,delay:.35});if(s.sub)drawText(c,s.sub,W-m,H*.12,{size:17*u,font:FONTS.mono.css,color:rgba(P[3],.6),align:'right',entrance:'typewriter',lt,delay:.5,spacing:.2});return}
      const ns=Math.min(H*.78,W*.5);c.save();c.font=`400 ${ns}px ${FONTS.anton.css}`;c.textAlign='right';c.textBaseline='middle';const sl=(1-expo(lt,0,1.2))*W*.2-lt*8*u;c.strokeStyle=rgba(P[1],.9*pr(lt,0,.5));c.lineWidth=3*u;c.strokeText(num,W-m*.6+sl,H*.52);c.fillStyle=rgba(P[1],.1*pr(lt,.3,.6));c.fillText(num,W-m*.6+sl,H*.52);c.restore();
      if(s.sub)drawText(c,s.sub,m,H*.36,{size:19*u,font:FONTS.mono.css,color:P[1],align:'left',entrance:'typewriter',lt,delay:.2,spacing:.3});
      const size=fitSize(c,s.text,e.font,W*.7,Math.min(W*.09,88*u)),lh=size*1.14;drawText(c,s.text,m,H*.36+44*u+lh*n/2,{size,font:e.font,color:P[3],align:'left',entrance:s.entrance,lt,delay:.4,lineH:1.14});c.fillStyle=P[3];c.fillRect(m,H*.36+66*u+lh*n,W*.26*expo(lt,.7,.9),3*u);
    }},
  menu:{label:'가격표 · 메뉴판',opts:{dark:'다크 보드',paper:'페이퍼'},
    cues:s=>rowsOf(s.text,6).map((_,i)=>({t:.4+i*.14,sfx:'tick',v:.4})),
    draw(c,s,lt,e){const{W,H,u,P}=e;const paper=s.opt==='paper';const bg=paper?mix(P[0],'#fff7e8',.75):mix(P[0],'#000000',.6);softBg(c,e,bg);const fg=paper?inkOf(P):'#ffffff';const items=rowsOf(s.text,6);const m=Math.min(W,H)*.07;
      c.strokeStyle=rgba(P[1],.8);c.lineWidth=2*u;const fp=E.inOutCubic(pr(lt,0,1));const per=2*(W+H-4*m);c.setLineDash([per*fp,per]);rr(c,m,m,W-2*m,H-2*m,18*u);c.stroke();c.setLineDash([]);
      const cw=Math.min(W-m*4,820*u),x0=W/2-cw/2;if(s.sub){drawText(c,s.sub,W/2,m+H*.1,{size:fitSize(c,s.sub,e.font,cw,52*u),font:e.font,color:fg,entrance:s.entrance,lt,delay:.15});const lp=expo(lt,.4,.8);c.fillStyle=P[1];c.fillRect(W/2-40*u*lp,m+H*.1+46*u,80*u*lp,4*u)}
      const top=m+H*(s.sub?.24:.08),bot=H-m-H*.05,n=Math.max(1,items.length),rh=Math.min((bot-top)/n,(H>W?124:78)*u),y0=(top+bot)/2-rh*n/2;
      items.forEach((it,i)=>{const p=expo(lt,.4+i*.14,.7);if(p<=0)return;const mm=/^(.*?)[\s·:]+([₩$]?[\d,.]+\s*(?:원|만원|천원|%|k|K)?)$/.exec(it);const name=mm?mm[1]:it,price=mm?mm[2]:'';const y=y0+rh*(i+.5)+(1-p)*22*u;c.globalAlpha=clamp(pr(lt,.4+i*.14,.4));const fs=Math.min((H>W?40:30)*u,rh*.42)*PRO.ts;
        c.font=`400 ${fs}px ${e.font}`;const pw=price?c.measureText(price).width:0;const nfs=fitSize(c,name,e.font,cw-pw-70*u,fs);label(c,name,x0,y,nfs,e.font,fg,'left','400');c.font=`400 ${nfs}px ${e.font}`;const nw=c.measureText(name).width;
        if(price){label(c,price,x0+cw,y,fs,e.font,P[1],'right','400');c.strokeStyle=rgba(fg,.35);c.lineWidth=2*u;c.setLineDash([2*u,8*u]);c.lineCap='round';c.beginPath();c.moveTo(x0+nw+18*u,y+fs*.25);c.lineTo(x0+nw+18*u+(cw-nw-pw-36*u)*p,y+fs*.25);c.stroke();c.setLineDash([]);c.lineCap='butt'}c.globalAlpha=1});
    }},
  lyrics:{label:'가사 자막 (노래방 하이라이트)',opts:{center:'중앙 대형',bottom:'하단 자막'},
    draw(c,s,lt,e){const{W,H,u,P}=e;meshBg(c,W,H,mix(P[0],'#000000',.72),[P[1],P[2],mix(P[1],'#000000',.4)],lt*1.6,.5);
      for(let i=0;i<5;i++){const R=Math.min(W,H)*(.16+i*.09)*(1+.04*Math.sin(lt*5.2+i));c.strokeStyle=rgba(i%2?P[1]:P[2],.14);c.lineWidth=2*u;c.beginPath();c.arc(W/2,H*.5,R,0,TAU);c.stroke()}
      const lines=rowsOf(s.text,8);if(!lines.length)return;const seg=e.vis/lines.length,k=Math.min(lines.length-1,Math.floor(lt/seg)),wl=lt-k*seg,fill=clamp(wl/(seg*.82));const bot=s.opt==='bottom';const y=bot?H*.8:H*.5;const cur=lines[k];
      const size=fitSize(c,cur,e.font,W*.86,bot?Math.min(W*.07,60*u):Math.min(W*.1,104*u))*PRO.ts;c.font=`400 ${size}px ${e.font}`;c.textAlign='left';c.textBaseline='middle';const tw=c.measureText(cur).width,x=W/2-tw/2;const ap=E.outCubic(pr(wl,0,.3)),dy=(1-ap)*size*.4,out=1-pr(wl,seg-.18,.18);c.globalAlpha=ap*out;
      c.lineJoin='round';c.strokeStyle='rgba(0,0,0,.55)';c.lineWidth=size*.1;c.strokeText(cur,x,y+dy);c.fillStyle='rgba(255,255,255,.38)';c.fillText(cur,x,y+dy);c.save();c.beginPath();c.rect(x-size*.1,y-size,(tw+size*.2)*fill,size*2);c.clip();const g=c.createLinearGradient(x,0,x+tw,0);g.addColorStop(0,'#ffffff');g.addColorStop(1,mix(P[1],'#ffffff',.25));c.fillStyle=g;c.fillText(cur,x,y+dy);c.restore();
      c.fillStyle=P[1];c.beginPath();c.arc(x+tw*fill,y-size*.72+dy-Math.abs(Math.sin(wl*9))*size*.14,size*.07,0,TAU);c.fill();c.globalAlpha=1;
      if(lines[k+1]&&!bot)label(c,lines[k+1],W/2,y+size*1.05,Math.min(size*.42,fitSize(c,lines[k+1],e.body,W*.8,size*.42)),e.body,`rgba(255,255,255,${(.4*ap).toFixed(2)})`);
      if(s.sub)drawText(c,s.sub,W/2,bot?H*.12:H*.9,{size:19*u,font:e.body,color:'rgba(255,255,255,.7)',entrance:'fade',lt,delay:.3,spacing:.2});
    }},
});

PRO.sample={aurora:['새로운 시작','BRAND FILM 2026'],bigType:['MAKE\nIT\nMOVE','MOTION — 2026'],logoSting:['BRAND','Slogan goes here'],photoHero:['제주, 그 여름','TRAVEL FILM'],photoTrio:['우리의 순간들','2026 PHOTO BOOK'],glassCards:['빠른 속도|3초 만에 완성\n쉬운 편집|끌어다 놓기\n고화질|1080p 내보내기','왜 이 서비스일까요?'],subscribe:['채널 이름','구독과 좋아요는 큰 힘이 됩니다'],endScreen:['다음 영상도 보러 가기','매주 화·금 업로드'],statCount:['98% 12,000+ 4.9','만족도 / 누적 고객 / 평점'],steps:['회원가입|1분이면 끝\n템플릿 선택\n내보내기','이용 방법 3단계'],versus:['아이폰\n갤럭시','카메라 / 배터리'],review:['배송도 빠르고\n품질이 정말 좋아요!','김OO 님 · 5'],sale:['50%','주말 한정 특가'],invite:['홈커밍 데이\n초대합니다','2026. 12. 24 SAT 2PM / 서울 성수동 스튜디오'],phoneMock:['일상이 쉬워지는 앱','지금 무료로 시작하세요'],chapter:['모션의 기본 원리','CHAPTER 01'],menu:['아메리카노 4,500\n카페라떼 5,000\n바닐라라떼 5,500\n레몬에이드 6,000','MENU'],lyrics:['너와 걷던 그 길 위에\n아직 남아 있는 온기\n다시 한번 불러 본다','가사 · 작사가']};

/* keep text readable whatever palette the user picks */
Object.keys(PRO.sample).forEach(k=>{const d=SC[k].draw;SC[k].draw=function(c,s,lt,e){const P=e.P;if(Math.abs(lum(P[3])-lum(P[0]))<.3)e={...e,P:[P[0],P[1],P[2],onCol(P[0]),P[4]]};return d.call(this,c,s,lt,e)}});
