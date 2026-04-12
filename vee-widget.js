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
#vee-bot{position:fixed;z-index:9999;cursor:pointer;transition:transform .2s;will-change:transform;}
#vee-bot:hover{transform:scale(1.12)!important;}
#vee-bot svg{filter:drop-shadow(0 0 8px rgba(161,0,255,0.25));}

#vee-overlay{
  position:fixed;inset:0;z-index:10000;
  background:rgba(0,0,0,0.97);
  display:flex;flex-direction:column;
  opacity:0;pointer-events:none;
  transition:opacity .3s ease;
}
#vee-overlay.open{opacity:1;pointer-events:all;}

#vee-header{
  display:flex;align-items:center;justify-content:space-between;
  padding:24px 36px;border-bottom:1px solid rgba(255,255,255,0.06);
  flex-shrink:0;
}
#vee-header-left{display:flex;align-items:center;gap:14px;}
#vee-header-avatar{width:40px;height:40px;flex-shrink:0;}
#vee-header-name{font-family:'Inter',sans-serif;font-size:15px;font-weight:700;color:#fff;letter-spacing:-0.01em;}
#vee-header-status{font-family:'Inter',sans-serif;font-size:11px;color:rgba(255,255,255,0.35);margin-top:2px;letter-spacing:0.04em;}
#vee-close{
  background:none;border:none;cursor:pointer;
  color:rgba(255,255,255,0.35);font-size:22px;font-weight:300;
  line-height:1;padding:4px 8px;transition:color .2s;font-family:'Inter',sans-serif;
}
#vee-close:hover{color:#fff;}

#vee-messages{
  flex:1;overflow-y:auto;padding:32px 36px;
  display:flex;flex-direction:column;gap:20px;
  scroll-behavior:smooth;
}
#vee-messages::-webkit-scrollbar{width:4px;}
#vee-messages::-webkit-scrollbar-track{background:transparent;}
#vee-messages::-webkit-scrollbar-thumb{background:rgba(161,0,255,0.3);border-radius:2px;}

.vee-msg{display:flex;flex-direction:column;max-width:580px;animation:msgIn .25s ease forwards;}
.vee-msg.bot{align-self:flex-start;}
.vee-msg.user{align-self:flex-end;}
@keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

.vee-bubble{
  padding:14px 18px;font-family:'Inter',sans-serif;
  font-size:15px;line-height:1.6;border-radius:2px;
}
.vee-msg.bot .vee-bubble{
  background:#111;border:1px solid rgba(161,0,255,0.2);
  color:rgba(255,255,255,0.88);border-radius:2px 12px 12px 12px;
}
.vee-msg.user .vee-bubble{
  background:rgba(161,0,255,0.15);border:1px solid rgba(161,0,255,0.35);
  color:rgba(255,255,255,0.9);border-radius:12px 2px 12px 12px;
}

.vee-typing{display:flex;align-items:center;gap:5px;padding:16px 18px;}
.vee-dot{width:6px;height:6px;background:#A100FF;border-radius:50%;animation:typeDot 1.2s ease-in-out infinite;}
.vee-dot:nth-child(2){animation-delay:.2s;}
.vee-dot:nth-child(3){animation-delay:.4s;}
@keyframes typeDot{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}}

.vee-options{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;}
.vee-opt{
  background:transparent;border:1px solid rgba(161,0,255,0.4);
  color:rgba(255,255,255,0.75);padding:9px 16px;
  font-family:'Inter',sans-serif;font-size:13px;font-weight:500;
  cursor:pointer;border-radius:2px;transition:all .15s;letter-spacing:0.01em;
}
.vee-opt:hover{background:rgba(161,0,255,0.12);border-color:#A100FF;color:#fff;}

#vee-input-row{
  padding:20px 36px 28px;border-top:1px solid rgba(255,255,255,0.06);
  display:flex;gap:10px;flex-shrink:0;
}
#vee-input{
  flex:1;background:rgba(255,255,255,0.04);
  border:1px solid rgba(255,255,255,0.09);
  color:#fff;padding:13px 16px;
  font-family:'Inter',sans-serif;font-size:14px;
  outline:none;transition:border-color .2s;border-radius:2px;
}
#vee-input:focus{border-color:rgba(161,0,255,0.6);}
#vee-input::placeholder{color:rgba(255,255,255,0.2);}
#vee-send{
  background:#A100FF;color:#fff;border:none;
  padding:13px 22px;font-family:'Inter',sans-serif;
  font-size:13px;font-weight:700;letter-spacing:0.06em;
  cursor:pointer;transition:background .2s;border-radius:2px;
  white-space:nowrap;
}
#vee-send:hover{background:#C44DFF;}
#vee-send:disabled{background:rgba(161,0,255,0.3);cursor:default;}

.vee-audit-btn{
  display:inline-block;margin-top:14px;
  background:#A100FF;color:#fff;padding:12px 24px;
  font-family:'Inter',sans-serif;font-size:13px;font-weight:700;
  letter-spacing:0.06em;text-transform:uppercase;text-decoration:none;
  border-radius:2px;transition:background .2s;
}
.vee-audit-btn:hover{background:#C44DFF;}

@keyframes veeWalk{0%,100%{transform:translateY(0) rotate(0.5deg)}50%{transform:translateY(-4px) rotate(-0.5deg)}}
@keyframes veeLegL{0%,100%{transform-origin:50% 0;transform:rotate(-12deg)}50%{transform-origin:50% 0;transform:rotate(12deg)}}
@keyframes veeLegR{0%,100%{transform-origin:50% 0;transform:rotate(12deg)}50%{transform-origin:50% 0;transform:rotate(-12deg)}}
@keyframes veeArmL{0%,100%{transform-origin:100% 50%;transform:rotate(8deg)}50%{transform-origin:100% 50%;transform:rotate(-8deg)}}
@keyframes veeArmR{0%,100%{transform-origin:0% 50%;transform:rotate(-8deg)}50%{transform-origin:0% 50%;transform:rotate(8deg)}}
@keyframes veeEye{0%,35%{transform:translateX(0)}45%,65%{transform:translateX(2px)}75%,100%{transform:translateX(0)}}
@keyframes veeBlink{0%,90%,100%{transform:scaleY(1)}95%{transform:scaleY(0.08)}}
@keyframes veePulse{0%,100%{opacity:.25}50%{opacity:.06}}

.vee-walking #vee-bot-body{animation:veeWalk .55s ease-in-out infinite;}
.vee-walking #vee-leg-l{animation:veeLegL .55s ease-in-out infinite;}
.vee-walking #vee-leg-r{animation:veeLegR .55s ease-in-out infinite;}
.vee-walking #vee-arm-l{animation:veeArmL .55s ease-in-out infinite;}
.vee-walking #vee-arm-r{animation:veeArmR .55s ease-in-out infinite;}
#vee-eye-l-inner{animation:veeEye 4.5s ease-in-out infinite;}
#vee-eye-r-inner{animation:veeEye 4.5s ease-in-out infinite;}
#vee-eye-l-group{animation:veeBlink 5s ease-in-out infinite;}
#vee-eye-r-group{animation:veeBlink 5s ease-in-out infinite 0.15s;}
.vee-idle-pulse{animation:veePulse 2.2s ease-in-out infinite;}

@media(max-width:600px){
  #vee-header{padding:18px 20px;}
  #vee-messages{padding:24px 20px;}
  #vee-input-row{padding:16px 20px 24px;}
  .vee-msg{max-width:100%;}
}
`;
document.head.appendChild(style);

// ── BOT SVG ──
const botEl = document.createElement('div');
botEl.id = 'vee-bot';
botEl.innerHTML = `
<svg id="vee-bot-svg" width="72" height="88" viewBox="0 0 90 100" xmlns="http://www.w3.org/2000/svg">
  <g id="vee-bot-body">
    <g id="vee-arm-l"><rect x="1" y="19" width="11" height="7" rx="2" fill="#0f0f0f" stroke="#A100FF" stroke-width="1.3"/><rect x="1" y="26" width="6" height="3" rx="1" fill="#A100FF" opacity="0.8"/></g>
    <g id="vee-arm-r"><rect x="78" y="19" width="11" height="7" rx="2" fill="#0f0f0f" stroke="#A100FF" stroke-width="1.3"/><rect x="83" y="26" width="6" height="3" rx="1" fill="#A100FF" opacity="0.8"/></g>
    <rect x="13" y="6" width="64" height="56" rx="11" fill="#0f0f0f" stroke="#A100FF" stroke-width="1.8"/>
    <rect x="18" y="11" width="54" height="46" rx="7" fill="#141414"/>
    <rect x="13" y="6" width="64" height="56" rx="11" fill="none" stroke="rgba(161,0,255,0.08)" stroke-width="6"/>
    <g id="vee-eye-l-group" style="transform-origin:31px 29px">
      <rect x="21" y="21" width="20" height="17" rx="3" fill="#A100FF"/>
      <g id="vee-eye-l-inner"><rect x="24" y="24" width="9" height="9" rx="1.5" fill="#fff" opacity="0.6"/></g>
    </g>
    <g id="vee-eye-r-group" style="transform-origin:59px 29px">
      <rect x="49" y="21" width="20" height="17" rx="3" fill="#A100FF"/>
      <g id="vee-eye-r-inner"><rect x="52" y="24" width="9" height="9" rx="1.5" fill="#fff" opacity="0.6"/></g>
    </g>
    <rect x="31" y="45" width="28" height="4" rx="2" fill="rgba(161,0,255,0.45)"/>
    <rect x="36" y="52" width="18" height="2.5" rx="1.2" fill="rgba(161,0,255,0.2)"/>
    <circle class="vee-idle-pulse" cx="45" cy="38" r="36" fill="none" stroke="#A100FF" stroke-width="1"/>
    <g id="vee-leg-l"><rect x="24" y="64" width="15" height="18" rx="3" fill="#0f0f0f" stroke="rgba(161,0,255,0.45)" stroke-width="1.2"/><rect x="20" y="80" width="22" height="8" rx="2" fill="#A100FF"/><rect x="20" y="80" width="22" height="3.5" rx="0" fill="#C44DFF" opacity="0.3"/></g>
    <g id="vee-leg-r"><rect x="51" y="64" width="15" height="18" rx="3" fill="#0f0f0f" stroke="rgba(161,0,255,0.45)" stroke-width="1.2"/><rect x="48" y="80" width="22" height="8" rx="2" fill="#A100FF"/><rect x="48" y="80" width="22" height="3.5" rx="0" fill="#C44DFF" opacity="0.3"/></g>
  </g>
</svg>`;
document.body.appendChild(botEl);

// ── OVERLAY ──
const overlay = document.createElement('div');
overlay.id = 'vee-overlay';
overlay.innerHTML = `
<div id="vee-header">
  <div id="vee-header-left">
    <svg id="vee-header-avatar" width="40" height="44" viewBox="0 0 90 100">
      <rect x="13" y="6" width="64" height="56" rx="11" fill="#0f0f0f" stroke="#A100FF" stroke-width="1.8"/>
      <rect x="18" y="11" width="54" height="46" rx="7" fill="#141414"/>
      <rect x="21" y="21" width="20" height="17" rx="3" fill="#A100FF"/>
      <rect x="24" y="24" width="9" height="9" rx="1.5" fill="#fff" opacity="0.6"/>
      <rect x="49" y="21" width="20" height="17" rx="3" fill="#A100FF"/>
      <rect x="52" y="24" width="9" height="9" rx="1.5" fill="#fff" opacity="0.6"/>
      <rect x="31" y="45" width="28" height="4" rx="2" fill="rgba(161,0,255,0.45)"/>
      <rect x="24" y="64" width="15" height="18" rx="3" fill="#0f0f0f" stroke="rgba(161,0,255,0.45)" stroke-width="1.2"/>
      <rect x="20" y="80" width="22" height="8" rx="2" fill="#A100FF"/>
      <rect x="51" y="64" width="15" height="18" rx="3" fill="#0f0f0f" stroke="rgba(161,0,255,0.45)" stroke-width="1.2"/>
      <rect x="48" y="80" width="22" height="8" rx="2" fill="#A100FF"/>
    </svg>
    <div>
      <div id="vee-header-name">Vee · VNKLO Agent</div>
      <div id="vee-header-status">Online — ask me anything</div>
    </div>
  </div>
  <button id="vee-close">✕</button>
</div>
<div id="vee-messages"></div>
<div id="vee-input-row">
  <input id="vee-input" type="text" placeholder="Type something..." autocomplete="off"/>
  <button id="vee-send">Send ›</button>
</div>`;
document.body.appendChild(overlay);

// ── WANDER ──
let vx = 0, vy = 0, px = 0, py = 0;
let targetX = 0, targetY = 0;
let moveTimer = null;
let isWalking = false;

function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

function pickTarget(){
  const margin = 80;
  const W = window.innerWidth, H = window.innerHeight;
  targetX = clamp(Math.random() * W, margin, W - margin - 72);
  targetY = clamp(Math.random() * H, margin, H - margin - 88);
}

function setWalking(v){
  if(v === isWalking) return;
  isWalking = v;
  if(v) botEl.classList.add('vee-walking');
  else botEl.classList.remove('vee-walking');
}

function wanderStep(){
  if(isOpen) return;
  const dx = targetX - px, dy = targetY - py;
  const dist = Math.sqrt(dx*dx + dy*dy);
  if(dist < 6){
    setWalking(false);
    clearTimeout(moveTimer);
    moveTimer = setTimeout(() => { pickTarget(); }, 1800 + Math.random() * 2400);
    return;
  }
  setWalking(true);
  const speed = 1.4;
  vx += (dx/dist * speed - vx) * 0.08;
  vy += (dy/dist * speed - vy) * 0.08;
  px = clamp(px + vx, 0, window.innerWidth - 72);
  py = clamp(py + vy, 0, window.innerHeight - 88);
  botEl.style.left = px + 'px';
  botEl.style.top = py + 'px';
  requestAnimationFrame(wanderStep);
}

function startWander(){
  px = window.innerWidth - 120;
  py = window.innerHeight - 150;
  botEl.style.left = px + 'px';
  botEl.style.top = py + 'px';
  pickTarget();
  wanderStep();
}

// ── CHAT LOGIC ──
const msgsEl = document.getElementById('vee-messages');
const inputEl = document.getElementById('vee-input');
const sendBtn = document.getElementById('vee-send');

function addMsg(role, text, options){
  const wrap = document.createElement('div');
  wrap.className = 'vee-msg ' + role;
  const bubble = document.createElement('div');
  bubble.className = 'vee-bubble';
  bubble.innerHTML = text.replace(/\n/g,'<br>');
  wrap.appendChild(bubble);
  if(options && options.length){
    const opts = document.createElement('div');
    opts.className = 'vee-options';
    options.forEach(o => {
      const btn = document.createElement('button');
      btn.className = 'vee-opt';
      btn.textContent = o;
      btn.onclick = () => { opts.remove(); sendMessage(o); };
      opts.appendChild(btn);
    });
    wrap.appendChild(opts);
  }
  msgsEl.appendChild(wrap);
  msgsEl.scrollTop = msgsEl.scrollHeight;
  return wrap;
}

function addTyping(){
  const wrap = document.createElement('div');
  wrap.className = 'vee-msg bot';
  wrap.id = 'vee-typing-indicator';
  wrap.innerHTML = '<div class="vee-bubble vee-typing"><div class="vee-dot"></div><div class="vee-dot"></div><div class="vee-dot"></div></div>';
  msgsEl.appendChild(wrap);
  msgsEl.scrollTop = msgsEl.scrollHeight;
}

function removeTyping(){
  const t = document.getElementById('vee-typing-indicator');
  if(t) t.remove();
}

function setStatus(s){ document.getElementById('vee-header-status').textContent = s; }

async function callClaude(userMsg){
  messages.push({ role:'user', content: userMsg });
  isTyping = true;
  sendBtn.disabled = true;
  setStatus('Thinking...');
  addTyping();
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'x-api-key': API_KEY,
        'anthropic-version':'2023-06-01',
        'anthropic-dangerous-direct-browser-access':'true'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: messages
      })
    });
    const data = await res.json();
    removeTyping();
    const reply = data.content && data.content[0] ? data.content[0].text : "Something went sideways on my end. Try again?";
    messages.push({ role:'assistant', content: reply });
    const hasAudit = /audit|book|45.min|sahej/i.test(reply);
    let finalReply = reply;
    if(hasAudit){
      finalReply += `\n\n<a class="vee-audit-btn" href="index.html#contact">Book the Free Audit →</a>`;
    }
    addMsg('bot', finalReply);
    setStatus('Online — ask me anything');
  } catch(e){
    removeTyping();
    addMsg('bot', "My brain hiccupped. Give it another shot.");
    setStatus('Online — ask me anything');
  }
  isTyping = false;
  sendBtn.disabled = false;
  inputEl.focus();
}

function sendMessage(text){
  const msg = (text || inputEl.value).trim();
  if(!msg || isTyping) return;
  inputEl.value = '';
  addMsg('user', msg);
  callClaude(msg);
}

// ── OPEN / CLOSE ──
function openChat(){
  isOpen = true;
  setWalking(false);
  overlay.classList.add('open');
  botEl.style.display = 'none';
  if(messages.length === 0){
    setTimeout(() => {
      addTyping();
      setTimeout(() => {
        removeTyping();
        addMsg('bot',
          "Hey. I'm Vee — an AI agent built by VNKLO.\n\nBefore you scroll through the site — can I show you something that'll actually change how you see your business?",
          ["Yeah, go ahead", "What are you exactly?", "Just browsing"]
        );
      }, 900);
    }, 300);
  }
  setTimeout(() => inputEl.focus(), 400);
}

function closeChat(){
  isOpen = false;
  overlay.classList.remove('open');
  botEl.style.display = 'block';
  wanderStep();
}

botEl.addEventListener('click', openChat);
document.getElementById('vee-close').addEventListener('click', closeChat);
document.addEventListener('keydown', e => { if(e.key === 'Escape' && isOpen) closeChat(); });

sendBtn.addEventListener('click', () => sendMessage());
inputEl.addEventListener('keydown', e => { if(e.key === 'Enter') sendMessage(); });

// ── OPTION HANDLER for opening messages ──
document.addEventListener('click', e => {
  if(e.target.classList.contains('vee-opt')){
    const text = e.target.textContent;
    e.target.closest('.vee-options').remove();
    sendMessage(text);
  }
});

// ── INIT ──
startWander();
})();
