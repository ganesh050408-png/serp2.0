import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GROQ_API_KEY || process.env.LLM_API_KEY;
const baseUrl = process.env.LLM_BASE_URL || 'https://api.groq.com/openai/v1';

async function listModels() {
  if (!apiKey) {
    console.error('No API key found in .env (GROQ_API_KEY or LLM_API_KEY)');
    process.exit(1);
  }

  console.log(`Connecting to: ${baseUrl}/models`);
  try {
    const response = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Status: ${response.status} ${response.statusText}`);
      console.error(`Error: ${errorText}`);
      process.exit(1);
    }

    const data: any = await response.json();
    console.log('Available models:');
    if (Array.isArray(data.data)) {
      data.data.forEach((m: any) => {
        console.log(`- ${m.id} (owned by: ${m.owned_by || 'unknown'}, active: ${m.active !== undefined ? m.active : true})`);
      });
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Fetch error:', err);
    process.exit(1);
  }
}

listModels();

