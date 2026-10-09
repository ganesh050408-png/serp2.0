import dotenv from 'dotenv';
dotenv.config();
import { createGroqChatCompletion } from '../server/services/groqService.js';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function testPrompt(title: string, prompt: string) {
  console.log(`\n======================================================`);
  console.log(`TEST: ${title}`);
  console.log(`PROMPT: "${prompt}"`);
  console.log(`======================================================`);

  try {
    const res = await createGroqChatCompletion([
      { sender: 'user', text: prompt }
    ], 'User Context: Aravind S., based in Chennai, exploring upcoming travel');

    console.log(`[Model Used: ${res.modelUsed}]`);
    console.log(`[Research Active: ${res.researchDossier?.isLiveSearchActive ? 'YES' : 'NO'}]`);
    console.log(`\nRESPONSE:\n${res.text}\n`);
  } catch (err: any) {
    console.error(`❌ Error in ${title}:`, err?.message || err);
  }
}

async function runAll() {
  await testPrompt('1. Broad Family Trip Request', 'Plan a family trip for me.');
  await sleep(3000);
  await testPrompt('2. Beach Destination Request', 'I want to go to a beach-type destination.');
  await sleep(3000);
  await testPrompt('3. Mountain Budget Request', 'I want a budget-friendly mountain trip.');
  await sleep(3000);
  await testPrompt('4. Specific 4-Day Route', 'Plan a 4-day family trip to Goa from Ahmedabad.');
}

runAll();
