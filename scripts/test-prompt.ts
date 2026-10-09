import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GROQ_API_KEY || process.env.LLM_API_KEY;
const baseUrl = process.env.LLM_BASE_URL || 'https://api.groq.com/openai/v1';

async function testPrompt(modelName: string, prompt: string) {
  console.log(`\n=== Testing ${modelName} ===`);
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: 'You are Adhira, the intelligent travel companion.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 200,
    }),
  });

  const data: any = await res.json();
  console.log('Choices:', JSON.stringify(data.choices, null, 2));
}

async function run() {
  await testPrompt('qwen/qwen3.8-27b', 'Recommend 2 spots in South Goa for sunset and seafood.');
  await testPrompt('openai/gpt-oss-120b', 'Recommend 2 spots in South Goa for sunset and seafood.');
}

run();

