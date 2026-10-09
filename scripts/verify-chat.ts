import dotenv from 'dotenv';
dotenv.config();
import { createGroqChatCompletion } from '../server/services/groqService.js';

async function testChat() {
  console.log('Sending "hi" to Adhira...');
  try {
    const result = await createGroqChatCompletion([
      { sender: 'user', text: 'hi' }
    ], 'Active Trip: Goa (4 Days), 2 Travelers, Budget ₹50,000');

    console.log('✅ Response received from model:', result.modelUsed);
    console.log('Reply:\n', result.text);
  } catch (err: any) {
    console.error('❌ Failed:', err);
    process.exit(1);
  }
}

testChat();

