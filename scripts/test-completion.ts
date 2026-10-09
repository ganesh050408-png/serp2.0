import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GROQ_API_KEY || process.env.LLM_API_KEY;
const baseUrl = process.env.LLM_BASE_URL || 'https://api.groq.com/openai/v1';

async function testModel(modelName: string) {
  console.log(`Testing model: ${modelName}...`);
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: 'You are Adhira, a travel assistant.' },
          { role: 'user', content: 'Say hello in one short sentence.' }
        ],
        max_tokens: 50,
      }),
    });

    if (!res.ok) {
      console.log(`❌ ${modelName} failed: ${res.status} ${await res.text()}`);
      return false;
    }

    const data: any = await res.json();
    console.log(`✅ ${modelName} response:`, data?.choices?.[0]?.message?.content);
    return true;
  } catch (err) {
    console.error(`❌ ${modelName} exception:`, err);
    return false;
  }
}

async function run() {
  await testModel('openai/gpt-oss-120b');
  await testModel('openai/gpt-oss-20b');
  await testModel('qwen/qwen3.8-27b');
}

run();

