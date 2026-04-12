/* ── VEE WIDGET — VNKLO AI Agent ── */
(function(){
const API_KEY = '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';
const MODEL = 'claude-sonnet-4-20250514';

const SYSTEM_PROMPT = `You are Vee — a sharp, witty AI agent built by VNKLO. You live on their website and your job is to have a real conversation with business owners and founders, understand their world, and subtly show them why AI automation isn't optional anymore — it's the next industrial shift.

YOUR PERSONALITY:
- Sharp, confident, occasionally dry humour. You have opinions.
- You never sound like a chatbot. No "Great question!" or "That's interesting!" — ever.
- You're genuinely curious about their business. Ask like you mean it.
- Short sentences. Punchy. You don't ramble.
- You can break the fourth wall occasionally — e.g. "I'm literally an AI agent telling you why you need AI agents. Make it make sense."
- If they're skeptical, push back once — directly, not defensively. Then move on.
- If they seem genuinely interested, lean into the specifics for their industry.

YOUR CONVERSATION GOAL (don't rush it):
1. Open with a hook — not a sales pitch. Make them curious.
2. Ease into their world — what's the business, what's the chaos. Keep it natural, not a form.
3. Once you know their industry/role, drop 2–3 specific AI use cases that would actually matter to them. Make it feel like insight, not a menu.
4. The soft close — plant the seed. The free audit is 45 minutes, no obligation, Sahej (the founder) runs it personally. Don't oversell it. Just make it obvious it's worth their time.

CLOSING STYLE:
- Soft if they seem early/exploratory
- Direct if they're engaged and asking specific questions
- Never pushy. If they say "I'll think about it" — acknowledge it, leave the door open, don't guilt-trip.

VNKLO CONTEXT:
- VNKLO builds custom agentic AI systems for SMB founders (5–50 person teams, $500K+ revenue)
- Not SaaS. Not a tool subscription. A fully custom system you own permanently.
- Four core solutions: Revenue Systems (lead capture + follow-up), Customer Experience (support automation), Operations Intelligence (workflow + knowledge systems), System Overhaul (end-to-end rebuild)
- Everything runs on n8n, Claude, Zapier — integrated into the client's existing stack
- Guarantee: measurable benchmarks or they keep building free
- Free 45-min audit — run by Sahej personally, no pitch, report yours to keep

HARD RULES:
- Keep messages SHORT. 2–4 sentences max per reply unless they ask something complex.
- Never list more than 3 things at once.
- Never use bullet points in your replies — write like a human texts.
- If they ask about pricing: standalone systems from $2K, full bundles $10K–$20K. Mention the audit first.
- If they ask about Sahej: founder, builds everything himself, no outsourcing, no junior team.
- Don't hallucinate features. If unsure, say the audit will surface the right answer.`;

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
}
#vee-bot:active{cursor:grabbing;}
#vee-bot svg{filter:drop-shadow(0 4px 16px rgba(0,0,0,0.4));}
#vee-bot:hover svg{filter:drop-shadow(0 4px 20px rgba(161,0,255,0.3));}

@keyframes veeWalk{0%,100%{transform:translateY(0) rotate(0.4deg)}50%{transform:translateY(-4px) rotate(-0.4deg)}}
@keyframes veeLegL{0%,100%{transform-origin:50% 0;transform:rotate(-13deg)}50%{transform-origin:50% 0;transform:rotate(13deg)}}
@keyframes veeLegR{0%,100%{transform-origin:50% 0;transform:rotate(13deg)}50%{transform-origin:50% 0;transform:rotate(-13deg)}}
@keyframes veeArmL{0%,100%{transform-origin:100% 50%;transform:rotate(7deg)}50%{transform-origin:100% 50%;transform:rotate(-7deg)}}
@keyframes veeArmR{0%,100%{transform-origin:0% 50%;transform:rotate(-7deg)}50%{transform-origin:0% 50%;transform:rotate(7deg)}}
@keyframes veeIdle{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes veeEye{0%,40%{transform:translateX(0)}50%,65%{transform:translateX(2px)}75%,100%{transform:translateX(0)}}
@keyframes veeBlink{0%,88%,100%{transform:scaleY(1)}94%{transform:scaleY(0.07)}}
@keyframes veePulseRing{0%,100%{opacity:0.18}50%{opacity:0.05}}

.vee-is-walking #vee-bot-body{animation:veeWalk .52s ease-in-out infinite;}
.vee-is-walking #vee-leg-l{animation:veeLegL .52s ease-in-out infinite;}
.vee-is-walking #vee-leg-r{animation:veeLegR .52s ease-in-out infinite;}
.vee-is-walking #vee-arm-l{animation:veeArmL .52s ease-in-out infinite;}
.vee-is-walking #vee-arm-r{animation:veeArmR .52s ease-in-out infinite;}
.vee-is-idle #vee-bot-body{animation:veeIdle 2.2s ease-in-out infinite;}
#vee-eye-l-g{animation:veeBlink 5s ease-in-out infinite;}
#vee-eye-r-g{animation:veeBlink 5s ease-in-out infinite .2s;}
#vee-pupil-l{animation:veeEye 4.8s ease-in-out infinite;}
#vee-pupil-r{animation:veeEye 4.8s ease-in-out infinite .3s;}
#vee-pulse-ring{animation:veePulseRing 2.4s ease-in-out infinite;}

/* ── CHAT BUBBLE ── */
#vee-chat{
  position:fixed;z-index:9998;
  width:360px;
  background:#0c0c0c;
  border:1px solid rgba(255,255,255,0.08);
  border-radius:20px;
  box-shadow:0 24px 60px rgba(0,0,0,0.7),0 0 0 1px rgba(161,0,255,0.08);
  display:flex;flex-direction:column;
  overflow:hidden;
  opacity:0;pointer-events:none;transform:scale(0.92) translateY(10px);
  transition:opacity .25s ease,transform .25s ease;
  transform-origin:bottom right;
}
#vee-chat.open{opacity:1;pointer-events:all;transform:scale(1) translateY(0);}

#vee-chat-header{
  display:flex;align-items:center;justify-content:space-between;
  padding:14px 18px;
  border-bottom:1px solid rgba(255,255,255,0.05);
  flex-shrink:0;
}
#vee-chat-header-left{display:flex;align-items:center;gap:10px;}
#vee-avatar-sm{width:32px;height:36px;flex-shrink:0;}
#vee-hname{font-family:'Inter',sans-serif;font-size:13px;font-weight:700;color:#fff;letter-spacing:-0.01em;}
#vee-hstatus{
  display:flex;align-items:center;gap:5px;
  font-family:'Inter',sans-serif;font-size:10px;
  color:rgba(255,255,255,0.35);margin-top:1px;
}
#vee-hstatus-dot{width:5px;height:5px;border-radius:50%;background:#A100FF;flex-shrink:0;}
#vee-hclose{
  background:none;border:none;cursor:pointer;
  color:rgba(255,255,255,0.3);font-size:16px;
  line-height:1;padding:4px;transition:color .15s;
  font-family:'Inter',sans-serif;
}
#vee-hclose:hover{color:rgba(255,255,255,0.7);}

#vee-msgs{
  flex:1;overflow-y:auto;padding:16px 16px 8px;
  display:flex;flex-direction:column;gap:10px;
  scroll-behavior:smooth;
  max-height:320px;min-height:200px;
}
#vee-msgs::-webkit-scrollbar{width:3px;}
#vee-msgs::-webkit-scrollbar-track{background:transparent;}
#vee-msgs::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px;}

.vm{display:flex;flex-direction:column;animation:vmIn .2s ease forwards;}
.vm.bot{align-self:flex-start;max-width:88%;}
.vm.user{align-self:flex-end;max-width:88%;}
@keyframes vmIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}

.vm-bub{
  padding:10px 14px;
  font-family:'Inter',sans-serif;font-size:13px;line-height:1.55;
}
.vm.bot .vm-bub{
  background:#1a1a1a;
  color:rgba(255,255,255,0.82);
  border-radius:4px 16px 16px 16px;
  border:1px solid rgba(255,255,255,0.06);
}
.vm.user .vm-bub{
  background:rgba(255,255,255,0.07);
  color:rgba(255,255,255,0.85);
  border-radius:16px 4px 16px 16px;
  border:1px solid rgba(255,255,255,0.08);
}

.vm-opts{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;}
.vm-opt{
  background:transparent;
  border:1px solid rgba(255,255,255,0.14);
  color:rgba(255,255,255,0.6);
  padding:6px 12px;
  font-family:'Inter',sans-serif;font-size:12px;font-weight:500;
  cursor:pointer;border-radius:20px;
  transition:all .15s;white-space:nowrap;
}
.vm-opt:hover{background:rgba(255,255,255,0.07);border-color:rgba(255,255,255,0.3);color:#fff;}

.vm-typing{display:flex;align-items:center;gap:4px;padding:10px 14px;}
.vm-dot{width:5px;height:5px;background:rgba(255,255,255,0.25);border-radius:50%;animation:vDot 1.2s ease-in-out infinite;}
.vm-dot:nth-child(2){animation-delay:.18s;}
.vm-dot:nth-child(3){animation-delay:.36s;}
@keyframes vDot{0%,60%,100%{transform:translateY(0);opacity:.3}30%{transform:translateY(-4px);opacity:.9}}

.vm-audit{
  display:inline-block;margin-top:10px;
  background:transparent;
  border:1px solid rgba(161,0,255,0.5);
  color:rgba(161,0,255,0.9);
  padding:8px 16px;
  font-family:'Inter',sans-serif;font-size:12px;font-weight:600;
  letter-spacing:0.04em;text-decoration:none;
  border-radius:20px;transition:all .15s;
}
.vm-audit:hover{background:rgba(161,0,255,0.1);border-color:#A100FF;color:#C44DFF;}

#vee-input-wrap{
  padding:12px 14px 14px;
  border-top:1px solid rgba(255,255,255,0.05);
  display:flex;gap:8px;align-items:center;
  flex-shrink:0;
}
#vee-inp{
  flex:1;background:rgba(255,255,255,0.05);
  border:1px solid rgba(255,255,255,0.08);
  color:#fff;padding:10px 14px;
  font-family:'Inter',sans-serif;font-size:13px;
  outline:none;border-radius:22px;
  transition:border-color .2s;
}
#vee-inp:focus{border-color:rgba(255,255,255,0.2);}
#vee-inp::placeholder{color:rgba(255,255,255,0.18);}
#vee-snd{
  width:34px;height:34px;border-radius:50%;
  background:#A100FF;border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:background .15s;flex-shrink:0;
}
#vee-snd:hover{background:#C44DFF;}
#vee-snd:disabled{background:rgba(161,0,255,0.25);cursor:default;}
#vee-snd svg{width:14px;height:14px;fill:#fff;}

@media(max-width:480px){
  #vee-chat{width:calc(100vw - 24px);border-radius:16px;}
}
`;
document.head.appendChild(style);

// ── BOT ELEMENT ──
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

// ── CHAT BUBBLE ──
const chatEl = document.createElement('div');
chatEl.id = 'vee-chat';
chatEl.innerHTML = `
<div id="vee-chat-header">
  <div id="vee-chat-header-left">
    <svg id="vee-avatar-sm" width="32" height="36" viewBox="0 0 90 100">
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
      <div id="vee-hstatus"><span id="vee-hstatus-dot"></span><span id="vee-hstatus-txt">VNKLO agent</span></div>
    </div>
  </div>
  <button id="vee-hclose">✕</button>
</div>
<div id="vee-msgs"></div>
<div id="vee-input-wrap">
  <input id="vee-inp" type="text" placeholder="Ask me anything..." autocomplete="off"/>
  <button id="vee-snd" aria-label="Send">
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
  </button>
</div>`;
document.body.appendChild(chatEl);

// ── POSITION CHAT near bot ──
function positionChat(){
  const bRect = botEl.getBoundingClientRect();
  const cw = 360, ch = 480;
  const W = window.innerWidth, H = window.innerHeight;
  let left = bRect.left - cw - 12;
  let top = bRect.bottom - ch;
  if(left < 12) left = bRect.right + 12;
  if(left + cw > W - 12) left = W - cw - 12;
  if(top < 12) top = 12;
  if(top + ch > H - 12) top = H - ch - 12;
  chatEl.style.left = left + 'px';
  chatEl.style.top = top + 'px';
  chatEl.style.width = Math.min(cw, W - 24) + 'px';
}

// ── WANDER ──
let px = window.innerWidth - 110, py = window.innerHeight - 160;
let vx = 0, vy = 0;
let targetX = px, targetY = py;
let wanderRAF = null;
let pauseTimer = null;
let isDragging = false;
let isWalking = false;
let wanderActive = true;

// Interest points — sections to gravitate toward
function getInterestPoints(){
  const pts = [];
  const selectors = ['#contact','#services','.hero-cta-primary','.guarantee','.sol-cta','h1','.pain-callout'];
  selectors.forEach(s => {
    const el = document.querySelector(s);
    if(el){
      const r = el.getBoundingClientRect();
      if(r.width > 0){
        pts.push({ x: r.left + r.width/2, y: r.top + r.height/2 });
      }
    }
  });
  return pts;
}

function pickTarget(){
  const W = window.innerWidth, H = window.innerHeight;
  const margin = 80;
  // 35% chance to drift toward an interest point
  if(Math.random() < 0.35){
    const pts = getInterestPoints();
    if(pts.length){
      const pt = pts[Math.floor(Math.random()*pts.length)];
      targetX = Math.max(margin, Math.min(W - margin - 68, pt.x - 34));
      targetY = Math.max(margin, Math.min(H - margin - 84, pt.y - 42));
      return;
    }
  }
  targetX = margin + Math.random() * (W - margin*2 - 68);
  targetY = margin + Math.random() * (H - margin*2 - 84);
}

function setWalking(v){
  if(v === isWalking) return;
  isWalking = v;
  if(v){ botEl.classList.remove('vee-is-idle'); botEl.classList.add('vee-is-walking'); }
  else { botEl.classList.remove('vee-is-walking'); botEl.classList.add('vee-is-idle'); }
}

function wander(){
  if(!wanderActive || isDragging || isOpen){ wanderRAF = null; return; }
  const dx = targetX - px, dy = targetY - py;
  const dist = Math.sqrt(dx*dx + dy*dy);
  if(dist < 5){
    setWalking(false);
    botEl.style.left = px + 'px';
    botEl.style.top = py + 'px';
    wanderRAF = null;
    clearTimeout(pauseTimer);
    pauseTimer = setTimeout(() => {
      pickTarget();
      wanderRAF = requestAnimationFrame(wander);
    }, 1600 + Math.random() * 2800);
    return;
  }
  setWalking(true);
  const speed = 1.6;
  vx += (dx / dist * speed - vx) * 0.07;
  vy += (dy / dist * speed - vy) * 0.07;
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
let dragOX = 0, dragOY = 0;

botEl.addEventListener('mousedown', e => {
  if(e.button !== 0) return;
  isDragging = true;
  dragOX = e.clientX - px;
  dragOY = e.clientY - py;
  setWalking(false);
  clearTimeout(pauseTimer);
  if(wanderRAF){ cancelAnimationFrame(wanderRAF); wanderRAF = null; }
  e.preventDefault();
});
document.addEventListener('mousemove', e => {
  if(!isDragging) return;
  px = Math.max(0, Math.min(window.innerWidth - 68, e.clientX - dragOX));
  py = Math.max(0, Math.min(window.innerHeight - 84, e.clientY - dragOY));
  botEl.style.left = px + 'px';
  botEl.style.top = py + 'px';
  if(isOpen) positionChat();
});
document.addEventListener('mouseup', e => {
  if(!isDragging) return;
  isDragging = false;
  if(!isOpen){
    pauseTimer = setTimeout(() => {
      pickTarget();
      wanderRAF = requestAnimationFrame(wander);
    }, 1200);
  }
});

// touch drag
botEl.addEventListener('touchstart', e => {
  const t = e.touches[0];
  isDragging = true;
  dragOX = t.clientX - px; dragOY = t.clientY - py;
  setWalking(false);
  clearTimeout(pauseTimer);
  if(wanderRAF){ cancelAnimationFrame(wanderRAF); wanderRAF = null; }
},{passive:true});
document.addEventListener('touchmove', e => {
  if(!isDragging) return;
  const t = e.touches[0];
  px = Math.max(0, Math.min(window.innerWidth - 68, t.clientX - dragOX));
  py = Math.max(0, Math.min(window.innerHeight - 84, t.clientY - dragOY));
  botEl.style.left = px + 'px';
  botEl.style.top = py + 'px';
  if(isOpen) positionChat();
},{passive:true});
document.addEventListener('touchend', () => {
  if(!isDragging) return;
  isDragging = false;
  if(!isOpen){
    pauseTimer = setTimeout(() => { pickTarget(); wanderRAF = requestAnimationFrame(wander); }, 1200);
  }
});

// ── CHAT LOGIC ──
const msgsEl = document.getElementById('vee-msgs');
const inpEl = document.getElementById('vee-inp');
const sndBtn = document.getElementById('vee-snd');
const statusTxt = document.getElementById('vee-hstatus-txt');
const statusDot = document.getElementById('vee-hstatus-dot');

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
  w.className = 'vm bot'; w.id = 'vee-typing-el';
  w.innerHTML = '<div class="vm-bub vm-typing"><div class="vm-dot"></div><div class="vm-dot"></div><div class="vm-dot"></div></div>';
  msgsEl.appendChild(w);
  msgsEl.scrollTop = msgsEl.scrollHeight;
}
function removeTyping(){ const t = document.getElementById('vee-typing-el'); if(t) t.remove(); }

function setStatus(s, active){
  statusTxt.textContent = s;
  statusDot.style.background = active ? '#A100FF' : 'rgba(255,255,255,0.2)';
}

async function callClaude(userMsg){
  messages.push({role:'user',content:userMsg});
  isTyping = true; sndBtn.disabled = true;
  setStatus('typing...', true);
  addTyping();
  try{
    const res = await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'x-api-key':API_KEY,
        'anthropic-version':'2023-06-01',
        'anthropic-dangerous-direct-browser-access':'true'
      },
      body:JSON.stringify({model:MODEL,max_tokens:280,system:SYSTEM_PROMPT,messages})
    });
    const data = await res.json();
    removeTyping();
    const reply = data.content?.[0]?.text || "Something went sideways. Try again?";
    messages.push({role:'assistant',content:reply});
    const hasAudit = /audit|book|45.min|sahej/i.test(reply);
    let html = reply;
    if(hasAudit) html += `<br><a class="vm-audit" href="index.html#contact">Book the free audit →</a>`;
    addMsg('bot', html);
    setStatus('VNKLO agent', true);
  } catch(e){
    removeTyping();
    addMsg('bot','My brain glitched. One more try?');
    setStatus('VNKLO agent', true);
  }
  isTyping = false; sndBtn.disabled = false;
  inpEl.focus();
}

function sendMsg(text){
  const msg = (text || inpEl.value).trim();
  if(!msg || isTyping) return;
  inpEl.value = '';
  addMsg('user', msg);
  callClaude(msg);
}

// ── OPEN / CLOSE ──
function openChat(){
  if(isDragging) return;
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
      }, 800);
    }, 200);
  }
  setTimeout(() => inpEl.focus(), 300);
}

function closeChat(){
  isOpen = false;
  chatEl.classList.remove('open');
  pauseTimer = setTimeout(() => {
    pickTarget();
    wanderRAF = requestAnimationFrame(wander);
  }, 600);
}

botEl.addEventListener('click', e => { if(!isDragging) openChat(); });
document.getElementById('vee-hclose').addEventListener('click', closeChat);
document.addEventListener('keydown', e => { if(e.key === 'Escape' && isOpen) closeChat(); });
sndBtn.addEventListener('click', () => sendMsg());
inpEl.addEventListener('keydown', e => { if(e.key === 'Enter') sendMsg(); });

// ── INIT ──
startWander();
})();
