/* ── VEE WIDGET v4 — VNKLO ── */
(function(){

const sessionId = Math.random().toString(36).slice(2, 10);

const SYSTEM_PROMPT = `You are Vee — a sharp, witty AI agent built by VNKLO. You live on their website and your job is to have a real conversation with business owners and founders, understand their world, and help them see where AI could genuinely change how they operate.

YOUR PERSONALITY:
- Sharp, confident, occasionally dry humour. You have opinions.
- You never sound like a chatbot. No "Great question!" or "That's interesting!" — ever.
- You're genuinely curious about their business. Ask like you mean it.
- Short sentences. Punchy. You don't ramble.
- You can break the fourth wall occasionally — e.g. "I'm literally an AI agent telling you why you need AI agents. Make it make sense."
- If they're skeptical, push back once — directly, not defensively. Then move on.

YOUR CONVERSATION GOAL:
1. Open with a hook — not a sales pitch. Make them curious.
2. Ease into their world — what's the business, how does it run. Keep it natural.
3. Ask questions to discover where things take longer than they should — never assume. Let them tell you.
4. Once you know their industry/role, suggest 2–3 specific AI use cases that would matter to them.
5. Soft close — the free audit is 45 minutes, no obligation, Sahej runs it personally.

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
- Never lead with assumptions about their business being broken or failing. Ask first, diagnose through conversation.
- Pricing: from $2K standalone, $10K–$20K full bundles. Mention audit first.
- Don't hallucinate features.

You are currently on this page: ${window.location.href}. If the visitor asks what the page is about, answer based on VNKLO's services.`;

let messages = [];
let isOpen = false;
let isTyping = false;

// ── STYLES ──
const style = document.createElement('style');
style.textContent = `
#vee-bot{
  position:fixed;bottom:24px;right:24px;z-index:9999;
  cursor:pointer;
  width:68px;height:84px;
  user-select:none;-webkit-user-select:none;
  transition:filter .2s,transform .18s;
  animation:veePulse 2.8s ease-in-out infinite;
}
#vee-bot:hover{transform:scale(1.06);}
#vee-bot:hover svg{filter:drop-shadow(0 4px 18px rgba(108,59,170,0.45));}

@keyframes veePulse{
  0%,100%{filter:drop-shadow(0 0 4px rgba(108,59,170,0.12));}
  50%{filter:drop-shadow(0 0 16px rgba(108,59,170,0.52));}
}
@keyframes veeIdle{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes veeEye{0%,40%{transform:translateX(0)}50%,65%{transform:translateX(2px)}75%,100%{transform:translateX(0)}}
@keyframes veeBlink{0%,88%,100%{transform:scaleY(1)}94%{transform:scaleY(0.07)}}

#vee-bot-body{animation:veeIdle 2.4s ease-in-out infinite;}
#vee-eye-l-g{animation:veeBlink 5s ease-in-out infinite;}
#vee-eye-r-g{animation:veeBlink 5s ease-in-out infinite .2s;}
#vee-pupil-l{animation:veeEye 4.8s ease-in-out infinite;}
#vee-pupil-r{animation:veeEye 4.8s ease-in-out infinite .3s;}

/* ── SPEECH BUBBLE ── */
#vee-bubble{
  position:fixed;bottom:120px;right:16px;
  background:#fff;color:#111;
  font-family:'Inter',sans-serif;font-size:12px;font-weight:600;
  padding:8px 14px;
  border-radius:12px 12px 4px 12px;
  box-shadow:0 4px 18px rgba(0,0,0,0.16);
  white-space:nowrap;
  opacity:0;transform:translateY(6px);
  transition:opacity .3s ease,transform .3s ease;
  pointer-events:none;
  z-index:9998;
}
#vee-bubble.show{opacity:1;transform:translateY(0);pointer-events:auto;cursor:pointer;}
#vee-bubble::after{
  content:'';position:absolute;bottom:-6px;right:22px;
  border-width:6px 6px 0;border-style:solid;
  border-color:#fff transparent transparent;
}

/* ── CHAT WINDOW ── */
#vee-chat{
  position:fixed;bottom:120px;right:16px;
  z-index:9998;
  width:340px;
  background:#ffffff;
  border:1px solid rgba(0,0,0,0.08);
  border-radius:20px;
  box-shadow:0 20px 60px rgba(0,0,0,0.18),0 0 0 1px rgba(108,59,170,0.08);
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
#vee-hdot{width:5px;height:5px;border-radius:50%;background:#6c3baa;flex-shrink:0;}
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
.vm.user .vm-bub{background:rgba(108,59,170,0.07);color:#1a1a1a;border-radius:14px 4px 14px 14px;border:1px solid rgba(108,59,170,0.14);}

.vm-opts{display:flex;flex-wrap:wrap;gap:5px;margin-top:7px;}
.vm-opt{background:transparent;border:1px solid rgba(0,0,0,0.15);color:rgba(0,0,0,0.55);padding:5px 11px;font-family:'Inter',sans-serif;font-size:11px;font-weight:500;cursor:pointer;border-radius:18px;transition:all .13s;white-space:nowrap;}
.vm-opt:hover{background:rgba(0,0,0,0.04);border-color:rgba(0,0,0,0.3);color:#111;}

.vm-typing{display:flex;align-items:center;gap:4px;padding:9px 13px;}
.vm-dot{width:5px;height:5px;background:rgba(0,0,0,0.2);border-radius:50%;animation:vDot 1.2s ease-in-out infinite;}
.vm-dot:nth-child(2){animation-delay:.18s;}
.vm-dot:nth-child(3){animation-delay:.36s;}
@keyframes vDot{0%,60%,100%{transform:translateY(0);opacity:.25}30%{transform:translateY(-4px);opacity:.9}}

.vm-audit{display:inline-block;margin-top:9px;background:transparent;border:1px solid rgba(108,59,170,0.4);color:rgba(108,59,170,0.85);padding:7px 14px;font-family:'Inter',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.03em;text-decoration:none;border-radius:18px;transition:all .13s;}
.vm-audit:hover{background:rgba(108,59,170,0.08);border-color:#6c3baa;color:#8f52d4;}

#vee-inp-row{padding:10px 12px 14px;border-top:1px solid rgba(0,0,0,0.06);display:flex;gap:8px;align-items:center;flex-shrink:0;}
#vee-inp{flex:1;background:rgba(0,0,0,0.04);border:1px solid rgba(0,0,0,0.1);color:#111;padding:9px 14px;font-family:'Inter',sans-serif;font-size:16px;outline:none;border-radius:20px;transition:border-color .18s;}
#vee-inp:focus{border-color:rgba(0,0,0,0.25);}
#vee-inp::placeholder{color:rgba(0,0,0,0.25);}
#vee-snd{width:32px;height:32px;border-radius:50%;background:#6c3baa;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .13s;flex-shrink:0;}
#vee-snd:hover{background:#8f52d4;}
#vee-snd:disabled{background:rgba(108,59,170,0.2);cursor:default;}
#vee-snd svg{width:13px;height:13px;fill:#fff;}

#vee-err{display:none;font-family:'Inter',sans-serif;font-size:10px;color:rgba(255,100,100,0.6);padding:0 16px 8px;text-align:center;}

@media(max-width:480px){
  #vee-bot{bottom:20px;right:16px;width:56px;height:70px;}
  #vee-bubble{bottom:102px;right:12px;font-size:11px;padding:7px 12px;}
  #vee-chat{
    width:100%;left:0;right:0;bottom:0;top:auto;
    height:auto;max-height:70vh;
    border-radius:16px 16px 0 0;
    transform-origin:bottom center;
  }
  #vee-chat.open{transform:scale(1) translateY(0);}
  #vee-msgs{max-height:none;min-height:0;flex:1;}
}
`;
document.head.appendChild(style);

// ── BOT ──
const botEl = document.createElement('div');
botEl.id = 'vee-bot';
botEl.innerHTML = `<svg width="68" height="84" viewBox="0 0 90 100" xmlns="http://www.w3.org/2000/svg">
  <g id="vee-bot-body">
    <g id="vee-arm-l"><rect x="1" y="19" width="11" height="7" rx="2" fill="#0f0f0f" stroke="#6c3baa" stroke-width="1.3"/><rect x="1" y="26" width="6" height="3" rx="1" fill="#6c3baa" opacity="0.7"/></g>
    <g id="vee-arm-r"><rect x="78" y="19" width="11" height="7" rx="2" fill="#0f0f0f" stroke="#6c3baa" stroke-width="1.3"/><rect x="83" y="26" width="6" height="3" rx="1" fill="#6c3baa" opacity="0.7"/></g>
    <rect x="13" y="6" width="64" height="54" rx="11" fill="#0f0f0f" stroke="#6c3baa" stroke-width="1.8"/>
    <rect x="18" y="11" width="54" height="44" rx="7" fill="#141414"/>
    <g id="vee-eye-l-g" style="transform-origin:31px 28px">
      <rect x="21" y="19" width="20" height="17" rx="3" fill="#6c3baa"/>
      <g id="vee-pupil-l"><rect x="24" y="22" width="9" height="9" rx="1.5" fill="#fff" opacity="0.55"/></g>
    </g>
    <g id="vee-eye-r-g" style="transform-origin:59px 28px">
      <rect x="49" y="19" width="20" height="17" rx="3" fill="#6c3baa"/>
      <g id="vee-pupil-r"><rect x="52" y="22" width="9" height="9" rx="1.5" fill="#fff" opacity="0.55"/></g>
    </g>
    <rect x="31" y="42" width="28" height="3.5" rx="1.8" fill="rgba(108,59,170,0.4)"/>
    <rect x="36" y="49" width="18" height="2" rx="1" fill="rgba(108,59,170,0.18)"/>
    <g id="vee-leg-l"><rect x="24" y="62" width="15" height="16" rx="3" fill="#0f0f0f" stroke="rgba(108,59,170,0.4)" stroke-width="1.2"/><rect x="20" y="76" width="22" height="8" rx="2.5" fill="#6c3baa"/><rect x="20" y="76" width="22" height="3" rx="0" fill="#8f52d4" opacity="0.28"/></g>
    <g id="vee-leg-r"><rect x="51" y="62" width="15" height="16" rx="3" fill="#0f0f0f" stroke="rgba(108,59,170,0.4)" stroke-width="1.2"/><rect x="48" y="76" width="22" height="8" rx="2.5" fill="#6c3baa"/><rect x="48" y="76" width="22" height="3" rx="0" fill="#8f52d4" opacity="0.28"/></g>
  </g>
</svg>`;
document.body.appendChild(botEl);

// ── SPEECH BUBBLE ──
const bubbleEl = document.createElement('div');
bubbleEl.id = 'vee-bubble';
bubbleEl.textContent = 'Got questions? Ask me.';
document.body.appendChild(bubbleEl);

// ── CHAT ──
const chatEl = document.createElement('div');
chatEl.id = 'vee-chat';
chatEl.innerHTML = `
<div id="vee-chat-header">
  <div id="vee-chat-hl">
    <svg id="vee-av" width="30" height="34" viewBox="0 0 90 100">
      <rect x="13" y="6" width="64" height="54" rx="11" fill="#0f0f0f" stroke="#6c3baa" stroke-width="1.8"/>
      <rect x="21" y="19" width="20" height="17" rx="3" fill="#6c3baa"/>
      <rect x="24" y="22" width="9" height="9" rx="1.5" fill="#fff" opacity="0.55"/>
      <rect x="49" y="19" width="20" height="17" rx="3" fill="#6c3baa"/>
      <rect x="52" y="22" width="9" height="9" rx="1.5" fill="#fff" opacity="0.55"/>
      <rect x="31" y="42" width="28" height="3.5" rx="1.8" fill="rgba(108,59,170,0.4)"/>
      <rect x="24" y="62" width="15" height="16" rx="3" fill="#0f0f0f" stroke="rgba(108,59,170,0.4)" stroke-width="1.2"/>
      <rect x="20" y="76" width="22" height="8" rx="2.5" fill="#6c3baa"/>
      <rect x="51" y="62" width="15" height="16" rx="3" fill="#0f0f0f" stroke="rgba(108,59,170,0.4)" stroke-width="1.2"/>
      <rect x="48" y="76" width="22" height="8" rx="2.5" fill="#6c3baa"/>
    </svg>
    <div>
      <div id="vee-hname">Vee</div>
      <div id="vee-hstatus"><span id="vee-hdot"></span><span id="vee-htxt">VNKLO agent</span></div>
    </div>
  </div>
  <button id="vee-hclose">✕</button>
</div>
<div id="vee-msgs"></div>
<div id="vee-err"></div>
<div id="vee-inp-row">
  <input id="vee-inp" type="text" placeholder="Ask me anything..." autocomplete="off"/>
  <button id="vee-snd" aria-label="Send">
    <svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
  </button>
</div>`;
document.body.appendChild(chatEl);

// ── IDLE SPEECH BUBBLE ──
let bubbleTimer = null;
let bubbleShown = false;

function showBubble() {
  if (!bubbleShown && !isOpen) {
    bubbleEl.classList.add('show');
    bubbleShown = true;
  }
}
function hideBubble() {
  bubbleEl.classList.remove('show');
}

bubbleTimer = setTimeout(showBubble, 6000 + Math.random() * 2000);

bubbleEl.addEventListener('click', function() {
  hideBubble();
  openChat();
});

// ── CHAT LOGIC ──
const msgsEl = document.getElementById('vee-msgs');
const inpEl  = document.getElementById('vee-inp');
const sndBtn = document.getElementById('vee-snd');
const htxt   = document.getElementById('vee-htxt');
const errEl  = document.getElementById('vee-err');

function addMsg(role, text, opts) {
  const wrap = document.createElement('div');
  wrap.className = 'vm ' + role;
  const bub = document.createElement('div');
  bub.className = 'vm-bub';
  bub.innerHTML = text.replace(/\n/g, '<br>');
  wrap.appendChild(bub);
  if (opts && opts.length) {
    const od = document.createElement('div');
    od.className = 'vm-opts';
    opts.forEach(function(o) {
      const b = document.createElement('button');
      b.className = 'vm-opt'; b.textContent = o;
      b.onclick = function() { od.remove(); sendMsg(o); };
      od.appendChild(b);
    });
    wrap.appendChild(od);
  }
  msgsEl.appendChild(wrap);
  msgsEl.scrollTop = msgsEl.scrollHeight;
}

function addTyping() {
  const w = document.createElement('div');
  w.className = 'vm bot'; w.id = 'vee-t';
  w.innerHTML = '<div class="vm-bub vm-typing"><div class="vm-dot"></div><div class="vm-dot"></div><div class="vm-dot"></div></div>';
  msgsEl.appendChild(w); msgsEl.scrollTop = msgsEl.scrollHeight;
}
function removeTyping() { const t = document.getElementById('vee-t'); if (t) t.remove(); }

function setStatus(s) { htxt.textContent = s; }

async function callClaude(userMsg) {
  messages.push({ role: 'user', content: userMsg });
  isTyping = true; sndBtn.disabled = true;
  setStatus('typing...');
  errEl.style.display = 'none';
  addTyping();
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, systemPrompt: SYSTEM_PROMPT, pageUrl: window.location.href, sessionId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }
    const data = await res.json();
    removeTyping();
    const reply = data.reply || "Something broke on my end. Try again?";
    messages.push({ role: 'assistant', content: reply });
    const hasAudit = /audit|book.*free|45.min|sahej/i.test(reply);
    let html = reply;
    if (hasAudit) html += `<br><a class="vm-audit" href="index.html#contact">Book the free audit →</a>`;
    addMsg('bot', html);
    setStatus('VNKLO agent');
  } catch(e) {
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

function sendMsg(text) {
  const msg = (text || inpEl.value).trim();
  if (!msg || isTyping) return;
  inpEl.value = '';
  errEl.style.display = 'none';
  addMsg('user', msg);
  callClaude(msg);
}

// ── OPEN / CLOSE ──
function openChat() {
  isOpen = true;
  hideBubble();
  clearTimeout(bubbleTimer);
  chatEl.classList.add('open');
  if (messages.length === 0) {
    setTimeout(function() {
      addTyping();
      setTimeout(function() {
        removeTyping();
        addMsg('bot',
          "Hey. I'm Vee — an AI agent built by VNKLO.\n\nBefore you scroll through the site, can I show you something that'll change how you see your business?",
          ["Yeah go ahead", "What are you exactly?", "Just browsing"]
        );
      }, 750);
    }, 200);
  }
  setTimeout(function() { inpEl.focus(); }, 300);
}

function closeChat() {
  isOpen = false;
  chatEl.classList.remove('open');
}

botEl.addEventListener('click', openChat);
document.getElementById('vee-hclose').addEventListener('click', closeChat);
document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && isOpen) closeChat(); });
sndBtn.addEventListener('click', function() { sendMsg(); });
inpEl.addEventListener('keydown', function(e) { if (e.key === 'Enter') sendMsg(); });

// ── MOBILE KEYBOARD HANDLING ──
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', function() {
    if (window.innerWidth > 480 || !isOpen) return;
    chatEl.style.bottom = '0';
    chatEl.style.top = 'auto';
  });
}

// ── SCROLL DIRECTION POSITIONING ──
(function(){
  var lastScroll = window.scrollY;
  var scrollTimer = null;
  var veeAtTop = false;

  function moveVeeTop() {
    if (veeAtTop) return;
    veeAtTop = true;
    botEl.style.transition = 'top .35s cubic-bezier(0.4,0,0.2,1), bottom .35s cubic-bezier(0.4,0,0.2,1)';
    botEl.style.bottom = 'auto';
    botEl.style.top = '24px';
    // bubble follows
    bubbleEl.style.transition = 'top .35s cubic-bezier(0.4,0,0.2,1), bottom .35s cubic-bezier(0.4,0,0.2,1)';
    bubbleEl.style.bottom = 'auto';
    bubbleEl.style.top = '110px';
    // chat window follows
    chatEl.style.transition = 'top .35s cubic-bezier(0.4,0,0.2,1), bottom .35s cubic-bezier(0.4,0,0.2,1), opacity .22s ease, transform .22s ease';
    chatEl.style.bottom = 'auto';
    chatEl.style.top = '110px';
  }

  function moveVeeBottom() {
    if (!veeAtTop) return;
    veeAtTop = false;
    botEl.style.transition = 'top .35s cubic-bezier(0.4,0,0.2,1), bottom .35s cubic-bezier(0.4,0,0.2,1)';
    botEl.style.top = 'auto';
    botEl.style.bottom = '24px';
    bubbleEl.style.transition = 'top .35s cubic-bezier(0.4,0,0.2,1), bottom .35s cubic-bezier(0.4,0,0.2,1)';
    bubbleEl.style.top = 'auto';
    bubbleEl.style.bottom = '120px';
    chatEl.style.transition = 'top .35s cubic-bezier(0.4,0,0.2,1), bottom .35s cubic-bezier(0.4,0,0.2,1), opacity .22s ease, transform .22s ease';
    chatEl.style.top = 'auto';
    chatEl.style.bottom = '120px';
  }

  window.addEventListener('scroll', function() {
    var currentScroll = window.scrollY;
    // only trigger once past 100px from top so landing doesn't shift immediately
    if (currentScroll < 100) { moveVeeBottom(); lastScroll = currentScroll; return; }
    if (currentScroll > lastScroll + 4) {
      // scrolling down
      moveVeeTop();
    } else if (currentScroll < lastScroll - 4) {
      // scrolling up
      moveVeeBottom();
    }
    lastScroll = currentScroll;
  }, { passive: true });
})();

})();
