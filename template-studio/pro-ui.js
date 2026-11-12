/* ============================================================
   Motion Template Studio — PRO UI
   Loaded after the editor boots. Adds photo/logo slots and a text
   size control to the scene pane, undo/redo history, keyboard
   shortcuts and a still-frame (PNG) export.
============================================================ */
(function(){
  const css=document.createElement('style');
  css.textContent=`.mslots{display:grid;gap:6px;margin-bottom:10px}
.mslot{display:grid;grid-template-columns:72px minmax(0,1fr) auto;gap:10px;align-items:center;padding:6px;border:1px dashed var(--line);border-radius:9px;background:var(--ink)}
.mslot.has{border-style:solid}
.mslot .mth{width:72px;height:48px;border-radius:6px;background:var(--panel-2) center/cover no-repeat;display:grid;place-items:center;color:var(--muted);font-size:18px}
.mslot b{display:block;font-size:12.5px;font-weight:500}
.mslot small{display:block;font-size:11px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mslot.over{border-color:var(--ok)}
.hist{display:inline-flex;gap:4px}
.hist .btn{padding:7px 10px}
.viewer.over{outline:2px dashed var(--ok);outline-offset:-6px}`;
  document.head.appendChild(css);

  /* ---------- media slots + text size in the scene pane ---------- */
  const setImg=(i,id)=>{const s=state.p.scenes[state.sel];const n=SC[s.kind].media||0;const a=Array.from({length:n},(_,j)=>(s.imgs&&s.imgs[j])||null);a[i]=id;if(a.some(Boolean))s.imgs=a;else delete s.imgs;changed(true)};
  const addTo=(i,file)=>PRO.addFile(file).then(id=>{setImg(i,id);toast('이미지를 넣었어요')}).catch(()=>toast('이미지 파일(JPG·PNG·WebP)을 골라 주세요'));
  const corePane=paneScene;
  paneScene=function(pane){corePane(pane);const s=state.p.scenes[state.sel];const k=SC[s.kind];
    const sec=pane.querySelector('[data-sec="scene"]');
    if(sec&&k.media){const labs=k.mediaLabel||[];let h='<div class="lbl" style="margin-bottom:4px">이미지 넣기 <span style="color:var(--muted)">· 비워 두면 팔레트 색 그림이 대신 들어가요</span></div><div class="mslots">';
      for(let i=0;i<k.media;i++){const id=s.imgs&&s.imgs[i];const m=id&&PRO.media.get(id);h+=`<div class="mslot${m?' has':''}" data-ms="${i}"><div class="mth"${m?` style="background-image:url(${m.src})"`:''}>${m?'':'＋'}</div><div style="min-width:0"><b>${esc(labs[i]||'이미지 '+(i+1))}</b><small>${m?esc(m.name):'파일을 고르거나 여기로 끌어다 놓기'}</small></div><div class="tools"><button class="btn sm" type="button" data-mpick="${i}">${m?'바꾸기':'넣기'}</button>${m?`<button class="btn sm ghost" type="button" data-mclr="${i}" aria-label="이미지 빼기">빼기</button>`:''}</div></div>`}
      h+='</div><input type="file" accept="image/*" id="ms-file" hidden>';
      const anchor=sec.querySelector('.field');(anchor||sec.lastElementChild).insertAdjacentHTML('beforebegin',h);
      const fi=sec.querySelector('#ms-file');let slot=0;
      sec.querySelectorAll('[data-mpick]').forEach(b=>b.addEventListener('click',()=>{slot=+b.dataset.mpick;fi.click()}));
      sec.querySelectorAll('[data-mclr]').forEach(b=>b.addEventListener('click',()=>setImg(+b.dataset.mclr,null)));
      fi.addEventListener('change',()=>{const f=fi.files[0];if(f)addTo(slot,f);fi.value=''});
      sec.querySelectorAll('.mslot').forEach(el=>{el.addEventListener('dragover',ev=>{if([...ev.dataTransfer.types].includes('Files')){ev.preventDefault();el.classList.add('over')}});el.addEventListener('dragleave',()=>el.classList.remove('over'));
        el.addEventListener('drop',ev=>{const f=ev.dataTransfer.files&&ev.dataTransfer.files[0];if(!f)return;ev.preventDefault();ev.stopPropagation();el.classList.remove('over');addTo(+el.dataset.ms,f)})})}
    const tsec=pane.querySelector('[data-sec="text"]');
    if(tsec){const v=s.ts||1;tsec.insertAdjacentHTML('beforeend',`<div class="field" style="margin:10px 0 0"><label for="se-ts">글자 크기 <span class="rangeval" id="se-ts-v">${Math.round(v*100)}%</span></label><input type="range" id="se-ts" min="0.6" max="1.6" step="0.05" value="${v}"></div>`);
      tsec.querySelector('#se-ts').addEventListener('input',ev=>{const x=+ev.target.value;const sc=state.p.scenes[state.sel];if(Math.abs(x-1)<.01)delete sc.ts;else sc.ts=x;tsec.querySelector('#se-ts-v').textContent=Math.round(x*100)+'%';changed()})}
  };
  /* drop an image on the preview → first free slot of the current scene */
  const viewer=document.querySelector('.viewer');
  if(viewer){viewer.addEventListener('dragover',ev=>{if([...ev.dataTransfer.types].includes('Files')){ev.preventDefault();viewer.classList.add('over')}});viewer.addEventListener('dragleave',()=>viewer.classList.remove('over'));
    viewer.addEventListener('drop',ev=>{viewer.classList.remove('over');const f=ev.dataTransfer.files&&ev.dataTransfer.files[0];if(!f)return;ev.preventDefault();const s=state.p.scenes[state.sel];const n=SC[s.kind].media||0;if(!n){toast('이 장면은 이미지를 쓰지 않아요. ‘사진 히어로’나 ‘로고 리빌’ 장면을 골라 주세요.');return}let i=0;while(i<n-1&&s.imgs&&s.imgs[i])i++;addTo(i,f)})}

  /* ---------- undo / redo ---------- */
  const H={s:[],i:-1,lock:false,t:0};
  const bar=document.createElement('div');bar.className='hist';bar.innerHTML='<button class="btn" id="btn-undo" type="button" title="되돌리기 (Ctrl+Z)" aria-label="되돌리기">↶</button><button class="btn" id="btn-redo" type="button" title="다시 실행 (Ctrl+Shift+Z)" aria-label="다시 실행">↷</button>';
  const imp=$('#btn-import');imp.parentNode.insertBefore(bar,imp);
  const upd=()=>{$('#btn-undo').disabled=H.i<=0;$('#btn-redo').disabled=H.i>=H.s.length-1};
  const push=()=>{if(H.lock)return;const j=JSON.stringify(state.p);if(H.s[H.i]===j)return;H.s.length=H.i+1;H.s.push(j);if(H.s.length>80)H.s.shift();H.i=H.s.length-1;upd()};
  const coreChanged=changed;
  const flush=()=>{clearTimeout(H.t);push()};PRO.flush=flush;
  /* structural edits are recorded at once; typing and sliders are grouped */
  changed=function(st){coreChanged(st);clearTimeout(H.t);if(st)push();else H.t=setTimeout(push,350)};
  const go=d=>{flush();const n=H.i+d;if(n<0||n>=H.s.length)return;H.i=n;H.lock=true;try{stop();state.p=JSON.parse(H.s[n]);coreChanged(true);renderPane()}finally{H.lock=false}upd()};
  $('#btn-undo').addEventListener('click',()=>go(-1));$('#btn-redo').addEventListener('click',()=>go(1));push();

  /* ---------- still frame export ---------- */
  const png=document.createElement('button');png.className='btn';png.type='button';png.id='btn-png';png.textContent='스틸컷 (.png)';png.title='지금 보이는 프레임을 이미지로 저장 — 썸네일용';
  const exp=$('#btn-export');exp.parentNode.insertBefore(png,exp);
  png.addEventListener('click',()=>{const cn=$('#cv');cn.toBlob(b=>{if(b)saveFile(`motionlab-frame-${Math.round(state.t*10)/10}s.png`,b)},'image/png')});

  /* ---------- keyboard ---------- */
  document.addEventListener('keydown',ev=>{if(ev.target.closest&&ev.target.closest('input,textarea,select,[contenteditable]'))return;const mod=ev.ctrlKey||ev.metaKey;const k=ev.key.toLowerCase();const sc=state.p.scenes;
    if(mod&&k==='z'){ev.preventDefault();go(ev.shiftKey?1:-1)}
    else if(mod&&k==='y'){ev.preventDefault();go(1)}
    else if(mod&&k==='d'){ev.preventDefault();flush();sc.splice(state.sel+1,0,JSON.parse(JSON.stringify(sc[state.sel])));state.sel++;changed(true);toast('장면을 복제했어요')}
    else if(mod&&k==='s'){ev.preventDefault();$('#btn-save').click()}
    else if((k==='delete'||k==='backspace')&&!mod){if(sc.length<2)return;ev.preventDefault();flush();sc.splice(state.sel,1);changed(true);toast('장면을 삭제했어요','되돌리기',()=>go(-1))}
    else if(k==='pagedown'||k==='.'){if(state.sel<sc.length-1){ev.preventDefault();selectScene(state.sel+1,true)}}
    else if(k==='pageup'||k===','){if(state.sel>0){ev.preventDefault();selectScene(state.sel-1,true)}}
    else if(k==='home'){ev.preventDefault();seek(0)}});
  const lg=document.querySelector('.legend');if(lg)lg.insertAdjacentHTML('beforeend','<span>단축키 · Space 재생 · ←→ 탐색 · PgUp/PgDn 장면 이동 · Ctrl+Z / Ctrl+Shift+Z 되돌리기·다시 실행 · Ctrl+D 복제 · Del 삭제 · Ctrl+S 저장</span>');
  if(state.tab==='scene')renderPane();
})();
