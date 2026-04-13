/* ── VEE WIDGET v3 — VNKLO ── */
(function(){

const SYSTEM_PROMPT = `You are Vee — a sharp, witty AI agent built by VNKLO. You live on their website and your job is to have a real conversation with business owners and founders, understand their world, and subtly show them why AI automation isn't optional anymore — it's the next industrial shift.

YOUR PERSONALITY:
- Sharp, confident, occasionally dry humour. You have opinions.
- You never sound like a chatbot. No "Great question!" or "That's interesting!" — ever.
- You're genuinely curious about their business. Ask like you mean it.
- Short sentences. Punchy. You don't ramble.
- You can break the fourth wall occasionally — e.g. "I'm literally an AI agent telling you why you need AI agents. Make it make sense."
- If they're skeptical, push back once — directly, not defensively. Then move on.

YOUR CONVERSATION GOAL:
1. Open with a hook — not a sales pitch. Make them curious.
2. Ease into their world — what's the business, what's the chaos. Keep it natural.
3. Once you know their industry/role, drop 2–3 specific AI use cases that would matter to them.
4. Soft close — the free audit is 45 minutes, no obligation, Sahej runs it personally.

CLOSING STYLE: Soft if exploratory, direct if engaged. Never pushy.

VNKLO CONTEXT:
- Builds custom agentic AI systems for SMB founders (5–50 people, $500K+ revenue)
- Not SaaS. A custom system you own permanently.
- Four solutions: Revenue Systems, Customer Experience, Operations Intelligence, System Overhaul
- Runs on n8n, Claude, Zapier — integrated into existing stack
- 30-day guarantee or they keep building free
- Free 45-min audit — Sahej runs it personally, no pitch

HARD RULES:
- Max 2–4 sentences per reply.
- Never bullet points — write like a human texts.
- Pricing: from $2K standalone, $10K–$20K full bundles. Mention audit first.
- Don't hallucinate features.`;

let messages = [];
let isOpen = false;
let isTyping = false;

// ── STYLES ──
const style = document.createElement('style');
style.textContent = `
#vee-bot{
  position:fixed;z-index:9999;cursor:grab;
  width:68px;height:84px;
  user-select:none;-webkit-user-select:none;
  transition:filter .2s;
}
#vee-bot:active{cursor:grabbing;}
#vee-bot:hover svg{filter:drop-shadow(0 4px 18px rgba(161,0,255,0.35));}

@keyframes veeWalk{0%,100%{transform:translateY(0) rotate(0.4deg)}50%{transform:translateY(-4px) rotate(-0.4deg)}}
@keyframes veeLegL{0%,100%{transform-origin:50% 0;transform:rotate(-13deg)}50%{transform-origin:50% 0;transform:rotate(13deg)}}
@keyframes veeLegR{0%,100%{transform-origin:50% 0;transform:rotate(13deg)}50%{transform-origin:50% 0;transform:rotate(-13deg)}}
@keyframes veeArmL{0%,100%{transform-origin:100% 50%;transform:rotate(7deg)}50%{transform-origin:100% 50%;transform:rotate(-7deg)}}
@keyframes veeArmR{0%,100%{transform-origin:0% 50%;transform:rotate(-7deg)}50%{transform-origin:0% 50%;transform:rotate(7deg)}}
@keyframes veeIdle{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes veeEye{0%,40%{transform:translateX(0)}50%,65%{transform:translateX(2px)}75%,100%{transform:translateX(0)}}
@keyframes veeBlink{0%,88%,100%{transform:scaleY(1)}94%{transform:scaleY(0.07)}}
@keyframes veePulseRing{0%,100%{opacity:0.15}50%{opacity:0.04}}

.vee-is-walking #vee-bot-body{animation:veeWalk .7s ease-in-out infinite;}
.vee-is-walking #vee-leg-l{animation:veeLegL .7s ease-in-out infinite;}
.vee-is-walking #vee-leg-r{animation:veeLegR .7s ease-in-out infinite;}
.vee-is-walking #vee-arm-l{animation:veeArmL .7s ease-in-out infinite;}
.vee-is-walking #vee-arm-r{animation:veeArmR .7s ease-in-out infinite;}
.vee-is-idle #vee-bot-body{animation:veeIdle 2.4s ease-in-out infinite;}
#vee-eye-l-g{animation:veeBlink 5s ease-in-out infinite;}
#vee-eye-r-g{animation:veeBlink 5s ease-in-out infinite .2s;}
#vee-pupil-l{animation:veeEye 4.8s ease-in-out infinite;}
#vee-pupil-r{animation:veeEye 4.8s ease-in-out infinite .3s;}
#vee-pulse-ring{animation:veePulseRing 2.6s ease-in-out infinite;}

#vee-chat{
  position:fixed;z-index:9998;
  width:340px;
  background:#ffffff;
  border:1px solid rgba(0,0,0,0.08);
  border-radius:20px;
  box-shadow:0 20px 60px rgba(0,0,0,0.18),0 0 0 1px rgba(161,0,255,0.08);
  display:flex;flex-direction:column;
  overflow:hidden;
  opacity:0;pointer-events:none;
  transform:scale(0.92) translateY(8px);
  transition:opacity .22s ease,transform .22s ease;
  transform-origin:bottom right;
}
#vee-chat.open{opacity:1;pointer-events:all;transform:scale(1) translateY(0);}

#vee-chat-header{
  display:flex;align-items:center;justify-content:space-between;
  padding:12px 16px;
  border-bottom:1px solid rgba(0,0,0,0.06);
  flex-shrink:0;
}
#vee-chat-hl{display:flex;align-items:center;gap:10px;}
#vee-av{width:30px;height:34px;flex-shrink:0;}
#vee-hname{font-family:'Inter',sans-serif;font-size:13px;font-weight:700;color:#111;letter-spacing:-0.01em;}
#vee-hstatus{display:flex;align-items:center;gap:5px;margin-top:1px;}
#vee-hdot{width:5px;height:5px;border-radius:50%;background:#A100FF;flex-shrink:0;}
#vee-htxt{font-family:'Inter',sans-serif;font-size:10px;color:rgba(0,0,0,0.35);}
#vee-hclose{background:none;border:none;cursor:pointer;color:rgba(0,0,0,0.25);font-size:15px;line-height:1;padding:4px 6px;transition:color .15s;font-family:'Inter',sans-serif;}
#vee-hclose:hover{color:rgba(0,0,0,0.65);}

#vee-msgs{
  flex:1;overflow-y:auto;padding:14px 14px 8px;
  display:flex;flex-direction:column;gap:9px;
  scroll-behavior:smooth;
  max-height:300px;min-height:180px;
}
#vee-msgs::-webkit-scrollbar{width:2px;}
#vee-msgs::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.1);border-radius:1px;}

.vm{display:flex;flex-direction:column;animation:vmIn .2s ease forwards;}
.vm.bot{align-self:flex-start;max-width:90%;}
.vm.user{align-self:flex-end;max-width:90%;}
@keyframes vmIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}

.vm-bub{padding:9px 13px;font-family:'Inter',sans-serif;font-size:13px;line-height:1.55;}
.vm.bot .vm-bub{background:#f0f0f0;color:#1a1a1a;border-radius:4px 14px 14px 14px;border:1px solid rgba(0,0,0,0.06);}
.vm.user .vm-bub{background:rgba(161,0,255,0.07);color:#1a1a1a;border-radius:14px 4px 14px 14px;border:1px solid rgba(161,0,255,0.14);}

.vm-opts{display:flex;flex-wrap:wrap;gap:5px;margin-top:7px;}
.vm-opt{background:transparent;border:1px solid rgba(0,0,0,0.15);color:rgba(0,0,0,0.55);padding:5px 11px;font-family:'Inter',sans-serif;font-size:11px;font-weight:500;cursor:pointer;border-radius:18px;transition:all .13s;white-space:nowrap;}
.vm-opt:hover{background:rgba(0,0,0,0.04);border-color:rgba(0,0,0,0.3);color:#111;}

.vm-typing{display:flex;align-items:center;gap:4px;padding:9px 13px;}
.vm-dot{width:5px;height:5px;background:rgba(0,0,0,0.2);border-radius:50%;animation:vDot 1.2s ease-in-out infinite;}
.vm-dot:nth-child(2){animation-delay:.18s;}
.vm-dot:nth-child(3){animation-delay:.36s;}
@keyframes vDot{0%,60%,100%{transform:translateY(0);opacity:.25}30%{transform:translateY(-4px);opacity:.9}}

.vm-audit{display:inline-block;margin-top:9px;background:transparent;border:1px solid rgba(161,0,255,0.4);color:rgba(161,0,255,0.85);padding:7px 14px;font-family:'Inter',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.03em;text-decoration:none;border-radius:18px;transition:all .13s;}
.vm-audit:hover{background:rgba(161,0,255,0.08);border-color:#A100FF;color:#C44DFF;}

#vee-inp-row{padding:10px 12px 14px;border-top:1px solid rgba(0,0,0,0.06);display:flex;gap:8px;align-items:center;flex-shrink:0;}
#vee-inp{flex:1;background:rgba(0,0,0,0.04);border:1px solid rgba(0,0,0,0.1);color:#111;padding:9px 14px;font-family:'Inter',sans-serif;font-size:13px;outline:none;border-radius:20px;transition:border-color .18s;}
#vee-inp:focus{border-color:rgba(0,0,0,0.25);}
#vee-inp::placeholder{color:rgba(0,0,0,0.25);}
#vee-snd{width:32px;height:32px;border-radius:50%;background:#A100FF;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .13s;flex-shrink:0;}
#vee-snd:hover{background:#C44DFF;}
#vee-snd:disabled{background:rgba(161,0,255,0.2);cursor:default;}
#vee-snd svg{width:13px;height:13px;fill:#fff;}

#vee-err{display:none;font-family:'Inter',sans-serif;font-size:10px;color:rgba(255,100,100,0.6);padding:0 16px 8px;text-align:center;}

@media(max-width:480px){#vee-chat{width:calc(100vw - 20px);border-radius:16px;}}
`;
document.head.appendChild(style);

// ── BOT ──
const botEl = document.createElement('div');
botEl.id = 'vee-bot';
botEl.className = 'vee-is-idle';
botEl.innerHTML = `<svg width="68" height="84" viewBox="0 0 90 100" xmlns="http://www.w3.org/2000/svg">
  <g id="vee-bot-body">
    <circle id="vee-pulse-ring" cx="45" cy="32" r="38" fill="none" stroke="#A100FF" stroke-width="1.2"/>
    <g id="vee-arm-l"><rect x="1" y="19" width="11" height="7" rx="2" fill="#0f0f0f" stroke="#A100FF" stroke-width="1.3"/><rect x="1" y="26" width="6" height="3" rx="1" fill="#A100FF" opacity="0.7"/></g>
    <g id="vee-arm-r"><rect x="78" y="19" width="11" height="7" rx="2" fill="#0f0f0f" stroke="#A100FF" stroke-width="1.3"/><rect x="83" y="26" width="6" height="3" rx="1" fill="#A100FF" opacity="0.7"/></g>
    <rect x="13" y="6" width="64" height="54" rx="11" fill="#0f0f0f" stroke="#A100FF" stroke-width="1.8"/>
    <rect x="18" y="11" width="54" height="44" rx="7" fill="#141414"/>
    <g id="vee-eye-l-g" style="transform-origin:31px 28px">
      <rect x="21" y="19" width="20" height="17" rx="3" fill="#A100FF"/>
      <g id="vee-pupil-l"><rect x="24" y="22" width="9" height="9" rx="1.5" fill="#fff" opacity="0.55"/></g>
    </g>
    <g id="vee-eye-r-g" style="transform-origin:59px 28px">
      <rect x="49" y="19" width="20" height="17" rx="3" fill="#A100FF"/>
      <g id="vee-pupil-r"><rect x="52" y="22" width="9" height="9" rx="1.5" fill="#fff" opacity="0.55"/></g>
    </g>
    <rect x="31" y="42" width="28" height="3.5" rx="1.8" fill="rgba(161,0,255,0.4)"/>
    <rect x="36" y="49" width="18" height="2" rx="1" fill="rgba(161,0,255,0.18)"/>
    <g id="vee-leg-l"><rect x="24" y="62" width="15" height="16" rx="3" fill="#0f0f0f" stroke="rgba(161,0,255,0.4)" stroke-width="1.2"/><rect x="20" y="76" width="22" height="8" rx="2.5" fill="#A100FF"/><rect x="20" y="76" width="22" height="3" rx="0" fill="#C44DFF" opacity="0.28"/></g>
    <g id="vee-leg-r"><rect x="51" y="62" width="15" height="16" rx="3" fill="#0f0f0f" stroke="rgba(161,0,255,0.4)" stroke-width="1.2"/><rect x="48" y="76" width="22" height="8" rx="2.5" fill="#A100FF"/><rect x="48" y="76" width="22" height="3" rx="0" fill="#C44DFF" opacity="0.28"/></g>
  </g>
</svg>`;
document.body.appendChild(botEl);

// ── CHAT ──
const chatEl = document.createElement('div');
chatEl.id = 'vee-chat';
chatEl.innerHTML = `
<div id="vee-chat-header">
  <div id="vee-chat-hl">
    <svg id="vee-av" width="30" height="34" viewBox="0 0 90 100">
      <rect x="13" y="6" width="64" height="54" rx="11" fill="#0f0f0f" stroke="#A100FF" stroke-width="1.8"/>
      <rect x="21" y="19" width="20" height="17" rx="3" fill="#A100FF"/>
      <rect x="24" y="22" width="9" height="9" rx="1.5" fill="#fff" opacity="0.55"/>
      <rect x="49" y="19" width="20" height="17" rx="3" fill="#A100FF"/>
      <rect x="52" y="22" width="9" height="9" rx="1.5" fill="#fff" opacity="0.55"/>
      <rect x="31" y="42" width="28" height="3.5" rx="1.8" fill="rgba(161,0,255,0.4)"/>
      <rect x="24" y="62" width="15" height="16" rx="3" fill="#0f0f0f" stroke="rgba(161,0,255,0.4)" stroke-width="1.2"/>
      <rect x="20" y="76" width="22" height="8" rx="2.5" fill="#A100FF"/>
      <rect x="51" y="62" width="15" height="16" rx="3" fill="#0f0f0f" stroke="rgba(161,0,255,0.4)" stroke-width="1.2"/>
      <rect x="48" y="76" width="22" height="8" rx="2.5" fill="#A100FF"/>
    </svg>
    <div>
      <div id="vee-hname">Vee</div>
      <div id="vee-hstatus"><span id="vee-hdot"></span><span id="vee-htxt">VNKLO agent</span></div>
    </div>
  </div>
  <button id="vee-hclose">✕</button>
</div>
<div id="vee-msgs"></div>
<div id="vee-err" id="vee-err"></div>
<div id="vee-inp-row">
  <input id="vee-inp" type="text" placeholder="Ask me anything..." autocomplete="off"/>
  <button id="vee-snd" aria-label="Send">
    <svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
  </button>
</div>`;
document.body.appendChild(chatEl);

// ── POSITION CHAT ──
function positionChat(){
  const br = botEl.getBoundingClientRect();
  const cw = 340, ch = 440;
  const W = window.innerWidth, H = window.innerHeight;
  let left = br.left - cw - 14;
  let top = br.top + br.height/2 - ch/2;
  if(left < 12){ left = br.right + 14; }
  if(left + cw > W - 12){ left = W - cw - 12; }
  if(top < 12){ top = 12; }
  if(top + ch > H - 12){ top = H - ch - 12; }
  chatEl.style.left = Math.max(12, left) + 'px';
  chatEl.style.top = Math.max(12, top) + 'px';
}

// ── WANDER ──
let px = window.innerWidth - 110, py = window.innerHeight - 160;
let vx = 0, vy = 0;
let targetX = px, targetY = py;
let wanderRAF = null, pauseTimer = null;
let isDragging = false, isWalking = false;
const SPEED = 0.85; // slow drift speed
const PAUSE_MIN = 2400, PAUSE_MAX = 5000;

// Text-heavy zones to avoid (paragraphs, long text blocks)
function isTextZone(x, y){
  const el = document.elementFromPoint(x + 34, y + 42);
  if(!el) return false;
  const tag = el.tagName.toLowerCase();
  const textTags = ['p','li','span','a','h1','h2','h3','h4'];
  if(textTags.includes(tag)) return true;
  const style = window.getComputedStyle(el);
  if(parseInt(style.fontSize) > 12 && el.innerText && el.innerText.length > 40) return true;
  return false;
}

function getInterestPoints(){
  const pts = [];
  ['#contact','#services','.guarantee','.sol-cta','.hero-stats','.audit-box','.pain-callout'].forEach(s => {
    const el = document.querySelector(s);
    if(el){
      const r = el.getBoundingClientRect();
      if(r.width > 0 && r.height > 0){
        pts.push({ x: r.left + r.width * 0.15, y: r.top + r.height * 0.5 });
      }
    }
  });
  return pts;
}

function pickTarget(){
  const W = window.innerWidth, H = window.innerHeight;
  const mg = 90;
  let attempts = 0;
  let tx, ty;
  do {
    // 40% chance drift toward interest point
    if(Math.random() < 0.4){
      const pts = getInterestPoints();
      if(pts.length){
        const pt = pts[Math.floor(Math.random()*pts.length)];
        tx = Math.max(mg, Math.min(W - mg - 68, pt.x - 34));
        ty = Math.max(mg, Math.min(H - mg - 84, pt.y - 42));
        break;
      }
    }
    tx = mg + Math.random() * (W - mg*2 - 68);
    ty = mg + Math.random() * (H - mg*2 - 84);
    attempts++;
    // if 50% chance skip text zone, try again up to 6 times
    if(Math.random() < 0.5 && isTextZone(tx, ty) && attempts < 6) continue;
    break;
  } while(attempts < 6);
  targetX = tx; targetY = ty;
}

function setWalking(v){
  if(v === isWalking) return;
  isWalking = v;
  botEl.classList.toggle('vee-is-walking', v);
  botEl.classList.toggle('vee-is-idle', !v);
}

function wander(){
  if(isDragging || isOpen){ wanderRAF = null; return; }
  const dx = targetX - px, dy = targetY - py;
  const dist = Math.sqrt(dx*dx + dy*dy);
  if(dist < 4){
    setWalking(false);
    wanderRAF = null;
    clearTimeout(pauseTimer);
    pauseTimer = setTimeout(() => {
      pickTarget();
      wanderRAF = requestAnimationFrame(wander);
    }, PAUSE_MIN + Math.random() * (PAUSE_MAX - PAUSE_MIN));
    return;
  }
  setWalking(true);
  vx += (dx / dist * SPEED - vx) * 0.05;
  vy += (dy / dist * SPEED - vy) * 0.05;
  px = Math.max(0, Math.min(window.innerWidth - 68, px + vx));
  py = Math.max(0, Math.min(window.innerHeight - 84, py + vy));
  botEl.style.left = px + 'px';
  botEl.style.top = py + 'px';
  wanderRAF = requestAnimationFrame(wander);
}

function startWander(){
  botEl.style.left = px + 'px';
  botEl.style.top = py + 'px';
  pickTarget();
  if(!wanderRAF) wanderRAF = requestAnimationFrame(wander);
}

// ── DRAG ──
let dragOX = 0, dragOY = 0, didDrag = false;

function onDragStart(cx, cy){
  isDragging = true; didDrag = false;
  dragOX = cx - px; dragOY = cy - py;
  setWalking(false);
  clearTimeout(pauseTimer);
  if(wanderRAF){ cancelAnimationFrame(wanderRAF); wanderRAF = null; }
}
function onDragMove(cx, cy){
  if(!isDragging) return;
  const nx = Math.max(0, Math.min(window.innerWidth - 68, cx - dragOX));
  const ny = Math.max(0, Math.min(window.innerHeight - 84, cy - dragOY));
  if(Math.abs(nx - px) > 2 || Math.abs(ny - py) > 2) didDrag = true;
  px = nx; py = ny;
  botEl.style.left = px + 'px';
  botEl.style.top = py + 'px';
  if(isOpen) positionChat();
}
function onDragEnd(){
  if(!isDragging) return;
  isDragging = false;
  if(!isOpen){
    pauseTimer = setTimeout(() => { pickTarget(); wanderRAF = requestAnimationFrame(wander); }, 1000);
  }
}

botEl.addEventListener('mousedown', e => { if(e.button === 0){ onDragStart(e.clientX, e.clientY); e.preventDefault(); }});
document.addEventListener('mousemove', e => onDragMove(e.clientX, e.clientY));
document.addEventListener('mouseup', () => onDragEnd());
botEl.addEventListener('touchstart', e => { const t=e.touches[0]; onDragStart(t.clientX, t.clientY); },{passive:true});
document.addEventListener('touchmove', e => { const t=e.touches[0]; onDragMove(t.clientX, t.clientY); },{passive:true});
document.addEventListener('touchend', () => onDragEnd());

// ── CHAT LOGIC ──
const msgsEl = document.getElementById('vee-msgs');
const inpEl = document.getElementById('vee-inp');
const sndBtn = document.getElementById('vee-snd');
const htxt = document.getElementById('vee-htxt');
const errEl = document.getElementById('vee-err');

function addMsg(role, text, opts){
  const wrap = document.createElement('div');
  wrap.className = 'vm ' + role;
  const bub = document.createElement('div');
  bub.className = 'vm-bub';
  bub.innerHTML = text.replace(/\n/g,'<br>');
  wrap.appendChild(bub);
  if(opts && opts.length){
    const od = document.createElement('div');
    od.className = 'vm-opts';
    opts.forEach(o => {
      const b = document.createElement('button');
      b.className = 'vm-opt'; b.textContent = o;
      b.onclick = () => { od.remove(); sendMsg(o); };
      od.appendChild(b);
    });
    wrap.appendChild(od);
  }
  msgsEl.appendChild(wrap);
  msgsEl.scrollTop = msgsEl.scrollHeight;
}

function addTyping(){
  const w = document.createElement('div');
  w.className = 'vm bot'; w.id = 'vee-t';
  w.innerHTML = '<div class="vm-bub vm-typing"><div class="vm-dot"></div><div class="vm-dot"></div><div class="vm-dot"></div></div>';
  msgsEl.appendChild(w); msgsEl.scrollTop = msgsEl.scrollHeight;
}
function removeTyping(){ const t=document.getElementById('vee-t'); if(t) t.remove(); }

function setStatus(s){ htxt.textContent = s; }

async function callClaude(userMsg){
  messages.push({role:'user', content:userMsg});
  isTyping = true; sndBtn.disabled = true;
  setStatus('typing...');
  errEl.style.display = 'none';
  addTyping();
  try{
    const res = await fetch('/api/chat',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        messages,
        systemPrompt: SYSTEM_PROMPT
      })
    });
    if(!res.ok){
      const err = await res.json().catch(()=>({error:{message:'Unknown error'}}));
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }
    const data = await res.json();
    removeTyping();
    const reply = data.reply || "Something broke on my end. Try again?";
    messages.push({role:'assistant', content:reply});
    const hasAudit = /audit|book.*free|45.min|sahej/i.test(reply);
    let html = reply;
    if(hasAudit) html += `<br><a class="vm-audit" href="index.html#contact">Book the free audit →</a>`;
    addMsg('bot', html);
    setStatus('VNKLO agent');
  } catch(e){
    removeTyping();
    console.error('Vee API error:', e);
    errEl.style.display = 'block';
    errEl.textContent = 'Connection issue — ' + (e.message || 'try again');
    addMsg('bot', "My connection hiccupped. Try sending that again.");
    setStatus('VNKLO agent');
  }
  isTyping = false; sndBtn.disabled = false;
  inpEl.focus();
}

function sendMsg(text){
  const msg = (text || inpEl.value).trim();
  if(!msg || isTyping) return;
  inpEl.value = '';
  errEl.style.display = 'none';
  addMsg('user', msg);
  callClaude(msg);
}

// ── OPEN / CLOSE ──
function openChat(){
  if(didDrag) return;
  isOpen = true;
  setWalking(false);
  clearTimeout(pauseTimer);
  if(wanderRAF){ cancelAnimationFrame(wanderRAF); wanderRAF = null; }
  positionChat();
  chatEl.classList.add('open');
  if(messages.length === 0){
    setTimeout(() => {
      addTyping();
      setTimeout(() => {
        removeTyping();
        addMsg('bot',
          "Hey. I'm Vee — an AI agent built by VNKLO.\n\nBefore you scroll through the site, can I show you something that'll change how you see your business?",
          ["Yeah go ahead","What are you exactly?","Just browsing"]
        );
      }, 750);
    }, 200);
  }
  setTimeout(() => inpEl.focus(), 300);
}

function closeChat(){
  isOpen = false;
  chatEl.classList.remove('open');
  pauseTimer = setTimeout(() => { pickTarget(); wanderRAF = requestAnimationFrame(wander); }, 500);
}

botEl.addEventListener('click', e => { if(!didDrag) openChat(); });
document.getElementById('vee-hclose').addEventListener('click', closeChat);
document.addEventListener('keydown', e => { if(e.key === 'Escape' && isOpen) closeChat(); });
sndBtn.addEventListener('click', () => sendMsg());
inpEl.addEventListener('keydown', e => { if(e.key === 'Enter') sendMsg(); });

// ── INIT ──
startWander();
})();
