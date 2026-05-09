const Groq = require('groq-sdk');

let groq = null;

const getGroq = () => {
  if (!groq) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
};

const chat = async (messages, options = {}) => {
  const g = getGroq();
  const response = await g.chat.completions.create({
    model: options.model || 'llama3-70b-8192',
    messages,
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 1024,
  });
  return response.choices[0]?.message?.content || '';
};

const jsonChat = async (messages, options = {}) => {
  const text = await chat(messages, { ...options, model: 'llama-3.3-70b-versatile' });
  // Strip markdown code blocks if present
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try {
    return JSON.parse(clean);
  } catch {
    // Try to extract JSON from the response
    const match = clean.match(/[\[\{][\s\S]*[\]\}]/);
    if (match) {
      try { return JSON.parse(match[0]); } catch {}
    }
    return null;
  }
};

module.exports = { getGroq, chat, jsonChat };
