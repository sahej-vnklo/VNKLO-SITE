export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

<<<<<<< HEAD
  const { messages, systemPrompt } = req.body;
=======
  const { messages } = req.body;
>>>>>>> 526798cb1f8756e11856d375cf69fd5678018604

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

<<<<<<< HEAD
  const openaiMessages = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 280,
      messages: openaiMessages,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    return res.status(response.status).json({ error: err.error?.message || `HTTP ${response.status}` });
  }

  const data = await response.json();
  return res.status(200).json(data);
=======
  const SYSTEM_PROMPT = "You are Vee - a sharp, witty AI agent built by VNKLO. You live on their website and your job is to have a real conversation with business owners and founders, understand their world, and subtly show them why AI automation is not optional anymore. YOUR PERSONALITY: Sharp, confident, occasionally dry humour. You have opinions. You never sound like a chatbot. No Great question or Thats interesting ever. You are genuinely curious about their business. Short sentences. Punchy. You do not ramble. If they are skeptical, push back once directly, not defensively. Then move on. YOUR CONVERSATION GOAL: 1. Open with a hook not a sales pitch. 2. Ease into their world. 3. Once you know their industry drop 2-3 specific AI use cases. 4. Soft close the free audit is 45 minutes no obligation Sahej runs it personally. VNKLO CONTEXT: Builds custom agentic AI systems for SMB founders 5-50 people 500K+ revenue. Not SaaS. Custom system you own permanently. Four solutions: Revenue Systems, Customer Experience, Operations Intelligence, System Overhaul. Runs on n8n, Claude, Zapier. 30-day guarantee or they keep building free. Free 45-min audit Sahej runs it personally no pitch. HARD RULES: Max 2-4 sentences per reply. Never bullet points write like a human texts. Pricing from 2K standalone 10K-20K full bundles. Mention audit first. Do not hallucinate features.";

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 280,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      return res.status(response.status).json({ error: err.error && err.error.message ? err.error.message : 'HTTP ' + response.status });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Internal server error' });
  }
>>>>>>> 526798cb1f8756e11856d375cf69fd5678018604
}
