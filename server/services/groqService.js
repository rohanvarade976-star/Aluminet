const Groq = require('groq-sdk');

// Single source of truth for model names
const MODELS = {
  default: 'qwen/qwen3.8-27b',
  fast:    'qwen/qwen3.8-27b',
};

let groq = null;

const getGroq = () => {
  if (!groq) {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      throw new Error('GROQ_API_KEY is not configured. Get a free key at https://console.groq.com');
    }
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
};

const chat = async (messages, options = {}) => {
  const g = getGroq();
  const response = await g.chat.completions.create({
    model: options.model || MODELS.default,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens || 1024,
  });
  return response.choices[0]?.message?.content || '';
};

const jsonChat = async (messages, options = {}) => {
  const text = await chat(messages, { ...options, model: options.model || MODELS.default });
  // Strip markdown code blocks if present
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try {
    return JSON.parse(clean);
  } catch {
    // Try to extract JSON from within the response
    const match = clean.match(/[\[{][\s\S]*[\]}]/);
    if (match) {
      try { return JSON.parse(match[0]); } catch {}
    }
    console.warn('groqService: Failed to parse JSON response:', clean.substring(0, 200));
    return null;
  }
};

module.exports = { getGroq, chat, jsonChat, MODELS };
