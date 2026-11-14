/* ============================================================
   Motion Template Studio — on-canvas editing
   Click a part of the preview to select it and open its editor,
   drag to move, drag the corner dot to resize. Also: free layers
   (extra text / logo anywhere), centre snapping, safe-area guides.
   Everything here is DOM laid over the canvas, so none of it ends
   up in the exported video.
============================================================ */
(function(){
  const css=document.createElement('style');
  css.textContent=`.viewer{position:relative}
#ov{position:absolute;touch-action:none;user-select:none;overflow:hidden;border-radius:4px}
#ov .bx{position:absolute;border:1.5px dashed transparent;border-radius:3px;pointer-events:none}
#ov .bx.hov{border-color:rgba(255,255,255,.75)}
#ov .bx.sel{border:2px solid #6b8bff;box-shadow:0 0 0 1px rgba(0,0,0,.35)}
#ov .bx.sel i{position:absolute;right:-7px;bottom:-7px;width:13px;height:13px;border-radius:50%;background:#fff;border:2px solid #6b8bff}
#ov .chip{position:absolute;display:flex;gap:2px;align-items:center;background:#6b8bff;color:#0d1020;border-radius:6px;padding:2px 3px 2px 8px;font-size:11.5px;font-weight:600;white-space:nowrap;transform:translateY(-100%);margin-top:-6px}
#ov .chip button{border:0;background:rgba(13,16,32,.16);color:inherit;border-radius:4px;padding:1px 6px;font-size:11.5px;font-weight:600}
#ov .chip button:hover{background:rgba(13,16,32,.3)}
#ov .gl{position:absolute;background:#ff4f86;pointer-events:none}
#ov .safe{position:absolute;border:1px dashed rgba(255,255,255,.55);pointer-events:none}
#ov .zone{position:absolute;background:rgba(255,79,134,.16);border:1px dashed rgba(255,79,134,.7);pointer-events:none;font-size:10px;color:#ffd0de;padding:2px 4px}
#ov .cl{position:absolute;background:rgba(255,255,255,.35);pointer-events:none}
.lyrow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;padding:6px 9px;border-radius:8px;background:var(--panel-2);border:1px solid transparent;text-align:left;width:100%;margin-bottom:4px;font-size:12.5px}
.lyrow.sel{border-color:var(--accent-2)}
.lyrow span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lyrow small{color:var(--muted);font-size:11px}
@media (max-width:1500px){.brand span{display:none}}
@media (min-width:981px){.viewer{flex:0 0 auto}.viewer canvas{max-height:max(220px,min(calc(100vh - 520px),720px))}}`;
  document.head.appendChild(css);

  const cv=$('#cv'),viewer=document.querySelector('.viewer');
  const ov=document.createElement('div');ov.id='ov';viewer.appendChild(ov);
  const C={sel:null,hov:null,drag:null,guides:false,gx:false,gy:false};
  PRO.csel=()=>C.sel;
  const NAMES={text:'메인 텍스트',sub:'보조 텍스트',g:'그래픽'};
  const nameOf=k=>NAMES[k]||(k[0]==='L'?'추가 요소':(SC[scene().kind].mediaLabel||[])[+k.slice(3)]||'사진');
  const sceneIdx=()=>{let j=TL.items.findIndex(it=>state.t>=it.start&&state.t<it.end);return j<0?TL.items.length-1:j};
  const scene=()=>state.p.scenes[PRO.sel>=0&&PRO.sel<state.p.scenes.length?PRO.sel:state.sel];

  /* record hit boxes for the scene under the playhead on every preview draw */
  const coreDraw=draw;
  draw=function(){PRO.rec=[];PRO.sel=sceneIdx();PRO.recOn=true;try{coreDraw()}finally{PRO.recOn=false}refresh()};
  const coreIcon=setPlayIcon;setPlayIcon=function(on){coreIcon(on);ov.style.display=on?'none':'';if(!on)setTimeout(()=>{if(!PB.playing)draw()},0)};
  window.addEventListener('resize',()=>refresh());

  function refresh(){if(PB.playing)return;const k=cv.clientWidth/cv.width;ov.style.left=cv.offsetLeft+'px';ov.style.top=cv.offsetTop+'px';ov.style.width=cv.clientWidth+'px';ov.style.height=cv.clientHeight+'px';
    if(C.sel&&!PRO.rec.some(r=>r.key===C.sel)&&!C.drag)C.sel=null;
    let h='';const W=cv.clientWidth,H=cv.clientHeight;
    if(C.guides){h+=`<div class="safe" style="left:5%;top:5%;right:5%;bottom:5%"></div><div class="cl" style="left:50%;top:0;bottom:0;width:1px"></div><div class="cl" style="top:50%;left:0;right:0;height:1px"></div>`;
      if(state.p.aspect==='9:16')h+=`<div class="zone" style="left:0;right:0;top:0;height:9%">상단 UI</div><div class="zone" style="left:0;right:15%;bottom:0;height:22%">제목 · 설명 영역</div><div class="zone" style="right:0;width:15%;top:38%;bottom:0">버튼</div>`}
    PRO.rec.forEach(r=>{const cls=r.key===C.sel?' sel':r.key===C.hov?' hov':'';h+=`<div class="bx${cls}" style="left:${r.x0*k}px;top:${r.y0*k}px;width:${(r.x1-r.x0)*k}px;height:${(r.y1-r.y0)*k}px">${r.key===C.sel&&r.key.slice(0,3)!=='img'?'<i></i>':''}</div>`});
    const s=PRO.rec.find(r=>r.key===C.sel);
    if(s&&!C.drag){const isL=s.key[0]==='L',isImg=s.key.slice(0,3)==='img';h+=`<div class="chip" style="left:${clamp(s.x0*k,0,Math.max(0,W-190))}px;top:${Math.max(26,s.y0*k)}px">${esc(nameOf(s.key))}${isImg?' · 끌어서 구도 조정':''}${isL?'<button type="button" data-ca="dup">복제</button><button type="button" data-ca="del">삭제</button>':'<button type="button" data-ca="reset">원위치</button>'}</div>`}
    if(C.gx)h+=`<div class="gl" style="left:50%;top:0;bottom:0;width:1px"></div>`;if(C.gy)h+=`<div class="gl" style="top:50%;left:0;right:0;height:1px"></div>`;
    ov.innerHTML=h;if(!C.drag)bar()}

  const pt=ev=>{const r=ov.getBoundingClientRect();const k=cv.width/r.width;return[(ev.clientX-r.left)*k,(ev.clientY-r.top)*k]};
  const hit=(x,y)=>PRO.rec.filter(r=>x>=r.x0&&x<=r.x1&&y>=r.y0&&y<=r.y1).sort((a,b)=>(a.key[0]==='L'?0:1)-(b.key[0]==='L'?0:1)||(a.x1-a.x0)*(a.y1-a.y0)-(b.x1-b.x0)*(b.y1-b.y0))[0]||null;
  const onHandle=(x,y)=>{const s=PRO.rec.find(r=>r.key===C.sel);if(!s||s.key.slice(0,3)==='img')return false;const tol=12*cv.width/Math.max(1,cv.clientWidth);return Math.hypot(x-s.x1,y-s.y1)<tol};
  const getVal=key=>{const s=scene();if(key==='cam'){const v=s.cam||[0,0,1];return[...v]}if(key[0]==='L'){const l=s.layers[+key.slice(1)];return[l.x,l.y,l.t==='text'?l.size:l.w]}if(key.slice(0,3)==='img'){const v=(s.imgPos&&s.imgPos[+key.slice(3)])||[.5,.5,1];return[...v]}const v=(s.pos&&s.pos[key])||[0,0,1];return[v[0],v[1],v[2]||1]};
  const setVal=(key,v)=>{const s=scene();if(key==='cam'){if(v[2]<=1.001)delete s.cam;else s.cam=[clamp(v[0],-.5,.5),clamp(v[1],-.5,.5),clamp(v[2],1,3)];return}if(key[0]==='L'){const l=s.layers[+key.slice(1)];l.x=v[0];l.y=v[1];if(l.t!=='text')l.w=clamp(v[2],.01,2);else l.size=clamp(v[2],.015,.4)}
    else if(key.slice(0,3)==='img'){s.imgPos=s.imgPos||{};s.imgPos[+key.slice(3)]=[clamp(v[0]),clamp(v[1]),clamp(v[2],1,4)]}
    else{s.pos=s.pos||{};if(Math.abs(v[0])<1e-4&&Math.abs(v[1])<1e-4&&Math.abs(v[2]-1)<1e-3){delete s.pos[key];if(!Object.keys(s.pos).length)delete s.pos}else s.pos[key]=[v[0],v[1],clamp(v[2],.3,4)]}};

  /* open the matching editor on the right — "click the thing, edit the thing" */
  function openEditor(key,focusField){const j=PRO.sel;if(j>=0&&j!==state.sel)state.sel=j;const isL=key[0]==='L',isImg=key.slice(0,3)==='img';state.focus=isL?'all':isImg?'scene':'text';state.cueHi=null;
    if(state.tab!=='scene')setTab('scene');else renderPane();renderTimeline();
    const el=isL?document.querySelector('#ly-t')||document.querySelector('[data-sec="layers"]'):isImg?document.querySelector(`.mslot[data-ms="${+key.slice(3)}"]`):document.querySelector(key==='sub'?'#se-sub':'#se-text');
    if(el){el.scrollIntoView({block:'nearest'});if(focusField&&el.focus){el.focus({preventScroll:true});if(el.select)el.select()}if(isImg){el.classList.add('over');setTimeout(()=>el.classList.remove('over'),900)}}}

  ov.addEventListener('pointerdown',ev=>{if(ev.button!==0)return;const act=ev.target.closest&&ev.target.closest('[data-ca]');if(act){ev.preventDefault();chipAct(act.dataset.ca);return}
    const[x,y]=pt(ev);const scale=onHandle(x,y);const h=scale?PRO.rec.find(r=>r.key===C.sel):hit(x,y);
    if(!h){if(C.sel){C.sel=null;refresh()}const cm=scene().cam;if(cm&&cm[2]>1.001){ev.preventDefault();try{ov.setPointerCapture(ev.pointerId)}catch(e){}if(PRO.flush)PRO.flush();C.drag={key:'cam',sx:x,sy:y,v0:[...cm],cx:0,cy:0,mode:'move',moved:false,was:null}}else{ev.preventDefault();try{ov.setPointerCapture(ev.pointerId)}catch(e){}if(PRO.flush)PRO.flush();C.drag={key:'all',sx:x,sy:y,v0:getVal('all'),cx:-9e6,cy:-9e6,mode:'move',moved:false,was:null}}return}
    ev.preventDefault();try{ov.setPointerCapture(ev.pointerId)}catch(e){}if(PRO.flush)PRO.flush();const was=C.sel;C.sel=h.key;
    C.drag={key:h.key,sx:x,sy:y,v0:getVal(h.key),cx:(h.x0+h.x1)/2,cy:(h.y0+h.y1)/2,mode:scale?'scale':'move',moved:false,was};refresh()});
  ov.addEventListener('pointermove',ev=>{const[x,y]=pt(ev);const d=C.drag;
    if(!d){const h=hit(x,y);const k=h?h.key:null;ov.style.cursor=onHandle(x,y)?'nwse-resize':k?'move':'default';if(k!==C.hov){C.hov=k;refresh()}return}
    const W=cv.width,H=cv.height;let dx=(x-d.sx)/W,dy=(y-d.sy)/H;if(!d.moved&&Math.hypot(x-d.sx,y-d.sy)<4*W/Math.max(1,cv.clientWidth))return;d.moved=true;C.gx=C.gy=false;
    if(d.mode==='scale'){const f=clamp(Math.hypot(x-d.cx,y-d.cy)/Math.max(8,Math.hypot(d.sx-d.cx,d.sy-d.cy)),.2,6);setVal(d.key,[d.v0[0],d.v0[1],d.v0[2]*f])}
    else if(d.key==='cam'){const z=d.v0[2]-1;setVal('cam',[d.v0[0]-dx/z,d.v0[1]-dy/z,d.v0[2]])}
    else if(d.key.slice(0,3)==='img'){setVal(d.key,[d.v0[0]-dx*1.4,d.v0[1]-dy*1.4,d.v0[2]])}
    else{if(!ev.altKey){if(Math.abs(d.cx/W+dx-.5)<.012){dx=.5-d.cx/W;C.gx=true}if(Math.abs(d.cy/H+dy-.5)<.012){dy=.5-d.cy/H;C.gy=true}}
      if(ev.shiftKey){if(Math.abs(dx)>Math.abs(dy))dy=0;else dx=0}setVal(d.key,[d.v0[0]+dx,d.v0[1]+dy,d.v0[2]])}
    changed()});
  const end=ev=>{const d=C.drag;if(!d)return;C.drag=null;C.gx=C.gy=false;try{ov.releasePointerCapture(ev.pointerId)}catch(e){}
    if(d.moved&&PRO.flush)PRO.flush();if(d.key==='cam'||d.key==='all'){refresh();return}if(!d.moved)openEditor(d.key,d.was===d.key||ev.detail>1);else if(d.key[0]==='L'&&state.tab==='scene')renderPane();refresh()};
  ov.addEventListener('pointerup',end);ov.addEventListener('pointercancel',end);
  ov.addEventListener('pointerleave',()=>{if(C.hov&&!C.drag){C.hov=null;refresh()}});
  ov.addEventListener('dblclick',ev=>{const[x,y]=pt(ev);const h=hit(x,y);if(h)openEditor(h.key,true)});
  ov.addEventListener('wheel',ev=>{if(!C.sel||C.sel.slice(0,3)!=='img')return;ev.preventDefault();const v=getVal(C.sel);setVal(C.sel,[v[0],v[1],v[2]*(ev.deltaY<0?1.06:1/1.06)]);changed()},{passive:false});

  function chipAct(a){const s=scene(),key=C.sel;if(!key)return;
    if(a==='reset'){if(key.slice(0,3)==='img'){if(s.imgPos){delete s.imgPos[+key.slice(3)];if(!Object.keys(s.imgPos).length)delete s.imgPos}}else setVal(key,[0,0,1]);changed(true)}
    if(a==='del'){s.layers.splice(+key.slice(1),1);if(!s.layers.length)delete s.layers;C.sel=null;changed(true)}
    if(a==='dup'){const l=JSON.parse(JSON.stringify(s.layers[+key.slice(1)]));l.x=Math.min(1.2,l.x+.04);l.y=Math.min(1.2,l.y+.04);s.layers.push(l);C.sel='L'+(s.layers.length-1);changed(true)}}

  /* keyboard: nudge / delete / deselect the selected part (runs before the scene shortcuts) */
  document.addEventListener('keydown',ev=>{if(!C.sel||(ev.target.closest&&ev.target.closest('input,textarea,select,[contenteditable]')))return;const k=ev.key;const st=ev.shiftKey?.02:.004;
    const mv={ArrowLeft:[-st,0],ArrowRight:[st,0],ArrowUp:[0,-st],ArrowDown:[0,st]}[k];
    if(mv){ev.preventDefault();ev.stopImmediatePropagation();const v=getVal(C.sel);const sg=C.sel.slice(0,3)==='img'?-1:1;setVal(C.sel,[v[0]+mv[0]*sg,v[1]+mv[1]*sg,v[2]]);changed()}
    else if(k==='Escape'){ev.stopImmediatePropagation();C.sel=null;refresh()}
    else if((k==='Delete'||k==='Backspace')&&C.sel[0]==='L'){ev.preventDefault();ev.stopImmediatePropagation();chipAct('del')}
    else if((k==='Delete'||k==='Backspace')){ev.stopImmediatePropagation()}},true);

  /* ---------- layers section in the scene pane ---------- */
  const addLayer=l=>{const s=state.p.scenes[state.sel];s.layers=s.layers||[];if(s.layers.length>=12){toast('추가 요소는 장면당 12개까지 넣을 수 있어요');return}s.layers.push(l);const it=TL.items[state.sel];if(state.t<it.start||state.t>=it.end)state.t=it.start+Math.min(1.2,it.s.dur*.5);C.sel='L'+(s.layers.length-1);changed(true);draw();const f=document.querySelector('#ly-t');if(f){f.focus();f.select()}};
  const corePane=paneScene;
  paneScene=function(pane){corePane(pane);const s=state.p.scenes[state.sel];const F=state.focus==='music'?'all':state.focus;if(F!=='all'&&F!=='scene'&&F!=='text')return;
    const L=s.layers||[];const si=C.sel&&C.sel[0]==='L'&&PRO.sel===state.sel?+C.sel.slice(1):-1;const l=L[si];
    let h=`<div class="sec" data-sec="layers"><h3>${DOT('#6b8bff')}추가 요소 <small>화면 아무 곳에나 놓는 텍스트 · 로고</small></h3>
     <p class="hint">미리보기 화면에서 <b>끌어서 옮기고</b>, 모서리 점을 끌어 크기를 바꿔요. 화살표 키로 미세 이동, 가운데에 가까우면 자동으로 붙습니다.</p>
     ${L.map((x,i)=>`<button type="button" class="lyrow${i===si?' sel':''}" data-ly="${i}"><span>${x.t==='img'?'🖼 이미지'+(x.img&&PRO.media.get(x.img)?' · '+esc(PRO.media.get(x.img).name):' (파일 없음)'):x.t==='shape'?'◆ '+esc(PRO.SHAPES[x.k]||'도형'):'T '+esc(x.text||'(빈 텍스트)')}</span><small>${i===si?'편집 중':'선택'}</small></button>`).join('')}
     <div class="tools" style="margin:6px 0 2px"><button class="btn sm" id="ly-add-t" type="button">＋ 텍스트</button><button class="btn sm" id="ly-add-i" type="button">＋ 이미지 · 로고</button><input type="file" accept="image/*" id="ly-file" hidden></div>`;
    if(l&&l.t==='text')h+=`<div class="field" style="margin-top:10px"><label for="ly-t">내용</label><textarea id="ly-t" rows="2">${esc(l.text)}</textarea></div>
     <div class="row2"><div class="field"><label for="ly-size">크기 <span class="rangeval" id="ly-size-v">${Math.round(l.size*1000)/10}</span></label><input type="range" id="ly-size" min="0.015" max="0.3" step="0.005" value="${l.size}"></div>
     <div class="field"><label for="ly-delay">나타나는 시점 <span class="rangeval" id="ly-delay-v">${(l.delay||0).toFixed(1)}초</span></label><input type="range" id="ly-delay" min="0" max="6" step="0.1" value="${l.delay||0}"></div></div>
     <div class="row2"><div class="field"><label for="ly-color">색</label><select id="ly-color">${optHtml({text:'팔레트 텍스트색',accent:'팔레트 포인트색',white:'흰색',black:'검정'},l.color)}</select></div>
     <div class="field"><label for="ly-font">서체</label><select id="ly-font">${optHtml({title:'제목 서체',body:'본문 서체'},l.font)}</select></div></div>
     <div class="field"><label for="ly-ent">등장 기법</label><select id="ly-ent">${optHtml(ENTR,l.ent)}</select></div>
     <label class="toggle"><input type="checkbox" id="ly-bg"${l.bg?' checked':''}> 배경 라벨 깔기 (어떤 화면에서도 잘 보이게)</label>`;
    if(l&&l.t==='img')h+=`<div class="row2" style="margin-top:10px"><div class="field"><label for="ly-size">크기 <span class="rangeval" id="ly-size-v">${Math.round(l.w*100)}%</span></label><input type="range" id="ly-size" min="0.03" max="1" step="0.01" value="${l.w}"></div>
     <div class="field"><label for="ly-delay">나타나는 시점 <span class="rangeval" id="ly-delay-v">${(l.delay||0).toFixed(1)}초</span></label><input type="range" id="ly-delay" min="0" max="6" step="0.1" value="${l.delay||0}"></div></div>
     <label class="toggle"><input type="checkbox" id="ly-round"${l.round?' checked':''}> 원형으로 자르기</label>`;
    if(l&&l.t==='shape')h+='<p class="hint" style="margin:10px 0 0">미리보기 아래 도구 막대에서 색 · 투명도 · 회전 · 비율을 바꾸고, 화면에서 모서리 점을 끌어 크기를 조절하세요.</p>';
    if(l)h+=`<div class="tools" style="margin-top:10px"><button class="btn sm" id="ly-all" type="button">모든 장면에 복사</button><button class="btn sm" id="ly-center" type="button">가운데로</button><button class="btn sm" id="ly-del" type="button">삭제</button></div>`;
    h+='</div>';pane.insertAdjacentHTML('beforeend',h);
    const on=(id,evn,fn)=>{const el=pane.querySelector(id);if(el)el.addEventListener(evn,fn)};const cur=()=>(state.p.scenes[state.sel].layers||[])[si];
    pane.querySelectorAll('[data-ly]').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.ly;const it=TL.items[state.sel];if(state.t<it.start||state.t>=it.end){state.t=it.start+Math.min(1.2,it.s.dur*.5)}C.sel='L'+i;draw();renderPane()}));
    on('#ly-add-t','click',()=>addLayer({t:'text',text:'새 텍스트',x:.5,y:.82,size:.06,color:'white',font:'title',bg:true,ent:'rise',delay:.3}));
    on('#ly-add-i','click',()=>pane.querySelector('#ly-file').click());
    on('#ly-file','change',ev=>{const f=ev.target.files[0];if(!f)return;PRO.addFile(f).then(id=>addLayer({t:'img',img:id,x:.88,y:.12,w:.14,round:false,delay:0})).catch(()=>toast('이미지 파일(JPG·PNG·WebP)을 골라 주세요'))});
    on('#ly-t','input',ev=>{cur().text=ev.target.value;changed()});
    on('#ly-size','input',ev=>{const v=+ev.target.value;const x=cur();if(x.t==='img'){x.w=v;pane.querySelector('#ly-size-v').textContent=Math.round(v*100)+'%'}else{x.size=v;pane.querySelector('#ly-size-v').textContent=Math.round(v*1000)/10}changed()});
    on('#ly-delay','input',ev=>{cur().delay=+ev.target.value;pane.querySelector('#ly-delay-v').textContent=(+ev.target.value).toFixed(1)+'초';changed()});
    on('#ly-color','change',ev=>{cur().color=ev.target.value;changed()});on('#ly-font','change',ev=>{cur().font=ev.target.value;changed()});on('#ly-ent','change',ev=>{cur().ent=ev.target.value;changed()});
    on('#ly-bg','change',ev=>{cur().bg=ev.target.checked;changed()});on('#ly-round','change',ev=>{cur().round=ev.target.checked;changed()});
    on('#ly-center','click',()=>{const x=cur();x.x=.5;x.y=.5;changed()});
    on('#ly-del','click',()=>chipAct('del'));
    on('#ly-all','click',()=>{const x=JSON.stringify(cur());let n=0;state.p.scenes.forEach((sc,i)=>{if(i===state.sel)return;sc.layers=sc.layers||[];if(sc.layers.length<12&&!sc.layers.some(y=>JSON.stringify(y)===x)){sc.layers.push(JSON.parse(x));n++}});changed(true);toast(`다른 장면 ${n}개에 복사했어요 (워터마크·로고에 좋아요)`)});
  };

  /* ---------- transport extras: guides + export format ---------- */
  const tr=document.querySelector('.transport'),now=$('#now-label');
  const g=document.createElement('label');g.className='toggle';g.innerHTML='<input type="checkbox" id="chk-guides"> 가이드';tr.insertBefore(g,now);
  g.querySelector('input').addEventListener('change',ev=>{C.guides=ev.target.checked;refresh()});
  const mp4ok=!!(window.MediaRecorder&&MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported('video/mp4'));
  const f=document.createElement('select');f.id='sel-format';f.title='내보내기 형식';f.style.cssText='width:auto;padding:6px 8px';f.innerHTML=`<option value="mp4"${mp4ok?'':' disabled'}>MP4${mp4ok?'':' (이 브라우저 미지원)'}</option><option value="webm">WebM</option>`;f.value=mp4ok&&PRO.wantMp4()?'mp4':'webm';
  f.addEventListener('change',()=>{try{localStorage.setItem('mls-format',f.value)}catch(e){}});const exp=$('#btn-export');exp.parentNode.insertBefore(f,exp);
  const lg=document.querySelector('.legend');if(lg)lg.insertAdjacentHTML('afterbegin','<span><b style="color:var(--fg)">화면에서 바로 편집</b> · 글자·사진을 클릭하면 그 항목 편집이 열리고, 끌면 위치가 바뀝니다. 빈 곳을 끌면 장면 내용 전체가 움직여요 (Alt: 자석 끄기 · Shift: 한 방향)</span>');

  /* ---------- contextual toolbar under the preview ---------- */
  const tb=document.createElement('div');tb.id='ctb';viewer.insertAdjacentElement('afterend',tb);
  const st2=document.createElement('style');st2.textContent=`#ctb{display:flex;gap:8px;align-items:center;flex-wrap:wrap;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:6px 10px;font-size:12px;min-height:42px}
#ctb b{font-weight:600;color:var(--fg);margin-right:2px}#ctb .sep{width:1px;height:20px;background:var(--line)}
#ctb input[type=color]{width:30px;height:26px;padding:1px;border:1px solid var(--line);border-radius:6px;background:none}
#ctb input[type=range]{width:96px}#ctb select{width:auto;padding:4px 6px;font-size:12px}#ctb label{display:inline-flex;align-items:center;gap:5px;color:var(--muted)}`;document.head.appendChild(st2);
  let sig='';const HEX6=/^#[0-9a-fA-F]{6}$/;const hex=v=>HEX6.test(v)?v:'#ffffff';
  function bar(force){const s=scene();if(!s)return;const key=C.sel;const k=SC[s.kind];const ns=PRO.sel+'|'+key+'|'+s.kind+'|'+(s.layers||[]).length+'|'+!!s.pal+'|'+!!(s.pos&&s.pos.all)+'|'+state.p.aspect;if(!force&&ns===sig)return;sig=ns;
    const P=s.pal||state.p.palette;const B=(id,t,title)=>`<button class="btn sm" type="button" data-b="${id}"${title?` title="${title}"`:''}>${t}</button>`;let h='';
    if(!key){h=`<b>장면 ${PRO.sel+1}</b><label title="이 장면에만 적용되는 색">색 ${['배경','포인트','보조','텍스트','잉크'].map((n,i)=>`<input type="color" data-pal="${i}" value="${hex(P[i])}" title="${n}">`).join('')}</label>${s.pal?B('palreset','↺','영상 전체 팔레트로 되돌리기')+B('palall','모든 장면에','이 색을 영상 전체에 적용'):''}
      ${k.opts?`<span class="sep"></span><label>변형 <select data-opt>${optHtml(k.opts,s.opt)}</select></label>`:''}
      <span class="sep"></span><label title="배경은 두고 내용만 키우거나 줄여요. 화면 빈 곳을 끌면 내용이 움직입니다">내용 크기 <input type="range" data-all min="0.4" max="1.8" step="0.02" value="${(s.pos&&s.pos.all&&s.pos.all[2])||1}"></label>${s.pos&&s.pos.all?B('allreset','원위치','내용 위치·크기 되돌리기'):''}<label>확대 <input type="range" data-cam min="1" max="2.5" step="0.02" value="${(s.cam&&s.cam[2])||1}"></label>
      <span class="sep"></span>${B('addt','＋ 텍스트')}<select data-adds><option value="">＋ 도형 · 아이콘</option>${optHtml(PRO.SHAPES,'')}</select>${B('addi','＋ 이미지')}<input type="file" accept="image/*" data-file hidden>`}
    else if(key[0]==='L'){const l=s.layers[+key.slice(1)];if(!l){tb.innerHTML='';return}const pal={text:P[3],accent:P[1],soft:P[2],white:'#ffffff',black:'#14131a'};
      h=`<b>${l.t==='img'?'이미지':l.t==='shape'?esc(PRO.SHAPES[l.k]||'도형'):'추가 텍스트'}</b>${l.t==='img'?'':`<label>색 <input type="color" data-lhex value="${hex(l.hex||pal[l.color]||P[3])}"></label>`}
      <label>투명도 <input type="range" data-lop min="0.05" max="1" step="0.05" value="${l.op==null?1:l.op}"></label><label>회전 <input type="range" data-lrot min="-180" max="180" step="1" value="${l.rot||0}"></label>
      ${l.t==='shape'?`<label>비율 <input type="range" data-lar min="0.02" max="3" step="0.02" value="${l.ar||1}"></label>`:''}<span class="sep"></span>${B('front','앞으로')}${B('back','뒤로')}${B('dup','복제')}${B('del','삭제')}`}
    else if(key.slice(0,3)==='img'){const v=(s.imgPos&&s.imgPos[+key.slice(3)])||[.5,.5,1];h=`<b>${esc(nameOf(key))}</b><label>확대 <input type="range" data-izoom min="1" max="3" step="0.02" value="${v[2]||1}"></label>${B('reset','원위치')}${B('edit','사진 바꾸기')}<span style="color:var(--muted)">사진을 끌면 보이는 부분이 바뀌어요</span>`}
    else{h=`<b>${esc(nameOf(key))}</b>${key==='g'?'':`<label>색 <input type="color" data-tcol value="${hex((s.col&&s.col[key])||P[3])}"></label>${s.col&&s.col[key]?B('colreset','↺','원래 색으로'):''}`}${B('smaller','작게')}${B('bigger','크게')}${B('center','가운데로')}${B('reset','원위치')}${key==='g'?'':B('edit','내용 편집')}`}
    tb.innerHTML=h}
  const reb=()=>{sig='';bar()};
  tb.addEventListener('input',ev=>{const t=ev.target,s=scene(),key=C.sel;
    if(t.dataset.pal!=null){s.pal=s.pal||[...state.p.palette];s.pal[+t.dataset.pal]=t.value;changed()}
    else if(t.dataset.all!=null){const v=getVal('all');setVal('all',[v[0],v[1],+t.value]);changed()}
    else if(t.dataset.cam!=null){const v=s.cam||[0,0,1];setVal('cam',[v[0],v[1],+t.value]);changed()}
    else if(t.dataset.tcol!=null){s.col=s.col||{};s.col[key]=t.value;changed()}
    else if(t.dataset.izoom!=null){const v=getVal(key);setVal(key,[v[0],v[1],+t.value]);changed()}
    else if(key&&key[0]==='L'){const l=s.layers[+key.slice(1)];if(t.dataset.lhex!=null)l.hex=t.value;if(t.dataset.lop!=null)l.op=+t.value;if(t.dataset.lrot!=null)l.rot=+t.value;if(t.dataset.lar!=null)l.ar=+t.value;changed()}});
  tb.addEventListener('change',ev=>{const t=ev.target,s=scene();
    if(t.dataset.opt!=null){s.opt=t.value;changed(true)}
    else if(t.dataset.adds!=null&&t.value){const k=t.value;state.sel=PRO.sel;addLayer({t:'shape',k,x:.5,y:.5,w:k==='line'?.3:.16,ar:k==='line'?.03:['rect','round','bubble','arrow'].includes(k)?.62:1,color:'accent',delay:.2});reb()}
    else if(t.dataset.file!=null){const f=t.files[0];if(f){state.sel=PRO.sel;PRO.addFile(f).then(id=>{addLayer({t:'img',img:id,x:.5,y:.5,w:.3,round:false,delay:0});reb()}).catch(()=>toast('이미지 파일(JPG·PNG·WebP)을 골라 주세요'))}}
    else if(t.dataset.pal!=null||t.dataset.tcol!=null||t.dataset.all!=null)reb()});
  tb.addEventListener('click',ev=>{const b=ev.target.closest('[data-b]');if(!b)return;const a=b.dataset.b,s=scene(),key=C.sel;
    if(a==='addt'){state.sel=PRO.sel;addLayer({t:'text',text:'새 텍스트',x:.5,y:.5,size:.07,color:'text',font:'title',bg:false,ent:'rise',delay:.2})}
    else if(a==='addi')tb.querySelector('[data-file]').click();
    else if(a==='palreset'){delete s.pal;changed(true)}
    else if(a==='allreset'){setVal('all',[0,0,1]);changed(true)}
    else if(a==='palall'){state.p.palette=[...s.pal];state.p.scenes.forEach(x=>delete x.pal);changed(true);toast('이 색을 영상 전체에 적용했어요')}
    else if(a==='colreset'){delete s.col[key];if(!Object.keys(s.col).length)delete s.col;changed(true)}
    else if(a==='smaller'||a==='bigger'){const v=getVal(key);setVal(key,[v[0],v[1],v[2]*(a==='bigger'?1.1:1/1.1)]);changed()}
    else if(a==='center'){const r=PRO.rec.find(x=>x.key===key);if(r){const v=getVal(key);setVal(key,[v[0]+.5-(r.x0+r.x1)/2/cv.width,v[1]+.5-(r.y0+r.y1)/2/cv.height,v[2]]);changed()}}
    else if(a==='edit')openEditor(key,true);
    else if(a==='front'||a==='back'){const i=+key.slice(1),j=i+(a==='front'?1:-1),L=s.layers;if(j<0||j>=L.length)return;[L[i],L[j]]=[L[j],L[i]];C.sel='L'+j;changed(true)}
    else chipAct(a);
    reb()});
  draw();if(state.tab==='scene')renderPane();
})();
