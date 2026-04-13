module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, systemPrompt, pageUrl, sessionId } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      return res.status(response.status).json({ error: err.error?.message || `HTTP ${response.status}` });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "Something broke on my end. Try again?";

    // Fire-and-forget Notion logging — never affects the chat response
    const userMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
    const veeReply = text;
    fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.NOTION_API_KEY,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: 'a29674f5-d8ac-499b-bedf-6824a15f8370' },
        properties: {
          'Visitor Message': {
            title: [{ text: { content: userMessage } }],
          },
          'Vee Reply': {
            rich_text: [{ text: { content: veeReply } }],
          },
          'Page URL': {
            url: pageUrl || null,
          },
          'Session ID': {
            rich_text: [{ text: { content: sessionId || '' } }],
          },
        },
      }),
    .then(async notionRes => {
        const body = await notionRes.text();
        console.log('Notion response:', notionRes.status, body);
      })
      .catch(e => console.log('Notion log error:', e.message));

    return res.status(200).json({ reply: text });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Internal server error' });
  }
};
