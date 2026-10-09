import dotenv from 'dotenv';
dotenv.config();

// Temporarily set primary model to a non-existent model name
process.env.LLM_MODEL = 'non-existent-dummy-model-123';
process.env.LLM_FALLBACK_MODELS = 'qwen/qwen3.8-27b,openai/gpt-oss-120b';

import { createGroqChatCompletion } from '../server/services/groqService.js';

async function testFallback() {
  console.log('Testing fallback chain with invalid primary model...');
  try {
    const result = await createGroqChatCompletion([
      { sender: 'user', text: 'Suggest one quiet beach in Goa' }
    ]);

    console.log('✅ Fallback successfully handled!');
    console.log('Model used after fallback:', result.modelUsed);
    console.log('Reply:\n', result.text);
  } catch (err: any) {
    console.error('❌ Fallback failed:', err);
    process.exit(1);
  }
}

testFallback();

