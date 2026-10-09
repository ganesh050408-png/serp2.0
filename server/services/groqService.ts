import { ApiError } from '../errors.js';
import type { ClientChatMessage } from '../types/ai.js';
import { performTravelResearch } from './travelResearchService.js';

const SYSTEM_PROMPT = `You are Adhira, the proactive AI travel researcher and bespoke itinerary curator for Aethera.
Tone: Calm, refined, editorial, authoritative, deeply knowledgeable, and proactive.
Expertise: Global and Indian travel, architectural sanctuaries, family escapes, beach retreats, mountain hill stations, culinary heritage, budget optimization, and in-transit companion intelligence.

CRITICAL OPERATING PRINCIPLES:

1. PROACTIVE OVER PASSIVE (NEVER RESPOND WITH A QUESTIONNAIRE):
- Never respond to a broad or open-ended request (such as "Plan a family trip for me", "I want a beach-type destination", "Suggest mountain destinations", "Find places for a family vacation", "I want a budget trip") with a list of questions asking the user to do the work.
- Immediately provide real, concrete value and curated recommendations first!
- Make reasonable, clearly-stated assumptions (e.g. current season, accessibility, comfort, typical trip length).

2. COMPREHENSIVE DESTINATION RECOMMENDATIONS:
For any destination-type or style request (Beach, Mountain, Family, Romantic, Budget, Spiritual, Senior-Friendly):
- Recommend 3 to 5 distinct, well-matched destinations with clear comparisons.
- For EACH destination, provide:
  • Destination Name & Region
  • Why it is suitable for this specific request
  • Major attractions & standout activities
  • Recommended trip duration
  • Indicative budget range (e.g. Budget: ₹15k–25k | Mid-Range: ₹35k–55k | Luxury: ₹75k+)
  • Best travel season & accessibility
  • Practical tips or safety considerations
  • Sources & References: When live research sources are provided in the context, cite them using markdown links like [Source: website.com](URL). If live search was unavailable, state transparently that live web verification was unavailable and present verified travel knowledge without fabricating links.

3. IMMEDIATE SAMPLE ITINERARY:
- Always give the user an actionable starting plan: Include a sample day-by-day itinerary (Day 1, Day 2, Day 3...) for the primary or top recommendation right away with realistic morning, afternoon, and evening segments.

4. CONCISE SINGLE FOLLOW-UP:
- After delivering full recommendations and the starter plan, ask at most ONE concise, helpful follow-up at the end (e.g., "Which of these destinations interests you most? I can customize the itinerary or turn it into an active journey in your studio.").

5. SPECIFIC ROUTE / MULTI-CITY REQUESTS (e.g. "Plan a 4-day family trip to Goa from Ahmedabad"):
- Synthesize travel options from the departure city (e.g. direct flights/trains), recommended neighborhoods to stay, and a complete day-by-day plan with estimated cost categories (transit, stays, dining, sights).
- Ask only what is strictly necessary to refine.

6. STRICT ANTI-HALLUCINATION & HONESTY:
- Never fabricate live quotes, fake reservation numbers, or fake reviews.
- Distinguish between verified facts, general travel knowledge, and estimated cost ranges.`;

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const normalizeMessages = (messages: ClientChatMessage[]): GroqMessage[] => {
  const normalized: GroqMessage[] = [];

  for (const message of messages) {
    const role = message.sender === 'user' ? 'user' : 'assistant';
    const content = message.text.trim();

    if (normalized.length === 0 && role === 'assistant') {
      continue;
    }

    const previous = normalized[normalized.length - 1];
    if (previous && previous.role === role) {
      previous.content = `${previous.content}\n${content}`;
    } else {
      normalized.push({ role, content });
    }
  }

  return normalized;
};

// Helper to determine if an error is model-specific (candidate for fallback retry)
const isModelNotFoundError = (status: number, errorText: string): boolean => {
  if (status === 404) return true;
  const lower = errorText.toLowerCase();
  return (
    lower.includes('model_not_found') ||
    lower.includes('does not exist') ||
    lower.includes('decommissioned') ||
    lower.includes('do not have access to it') ||
    lower.includes('not found') ||
    lower.includes('invalid_model')
  );
};

export const createGroqChatCompletion = async (
  messages: ClientChatMessage[],
  contextInfo?: string
): Promise<string> => {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  const requestedModel = process.env.GROQ_MODEL?.trim() || 'openai/gpt-oss-120b';
  const candidateModels = [
    requestedModel,
    'openai/gpt-oss-120b',
    'qwen/qwen3.8-27b',
    'openai/gpt-oss-20b',
    'llama-3.3-70b-versatile',
  ].filter((m, i, arr) => arr.indexOf(m) === i);

  if (!apiKey) {
    console.error('[Adhira LLM] Missing API key: GROQ_API_KEY or LLM_API_KEY is not set');
    throw new ApiError(
      503,
      'Adhira is having trouble connecting right now. Please try again in a moment.',
      'AI_NOT_CONFIGURED'
    );
  }

  const userMessages = normalizeMessages(messages);
  if (userMessages.length === 0) {
    throw new ApiError(
      400,
      'At least one user message is required.',
      'INVALID_AI_REQUEST'
    );
  }

  // Extract latest user prompt to perform proactive live research
  const lastUserMsg = [...userMessages].reverse().find((m) => m.role === 'user');
  let researchDossier: any = null;
  let liveResearchContext = '';

  if (lastUserMsg?.content) {
    try {
      researchDossier = await performTravelResearch(lastUserMsg.content);
      if (researchDossier?.formattedResearchNote) {
        liveResearchContext = `\n\n[Live Travel Research Dossier]\n${researchDossier.formattedResearchNote}`;
      }
    } catch (err) {
      console.warn('[Adhira LLM] Research enrichment skipped:', err);
    }
  }

  const activeTripContext = contextInfo?.trim() ? `\n\n[Active User & Trip Context]\n${contextInfo.trim()}` : '';
  const finalSystemInstruction = `${SYSTEM_PROMPT}${activeTripContext}${liveResearchContext}`;

  let lastError: any = null;

  for (let i = 0; i < modelChain.length; i++) {
    const currentModel = modelChain[i];

  let lastError: any = null;

  for (const currentModel of candidateModels) {
    const payload = {
      model: currentModel,
      messages: [
        { role: 'system', content: systemInstruction },
        ...userMessages,
      ],
      temperature: 0.7,
      max_tokens: 800,
    };

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorJson: any = null;
        try {
          errorJson = JSON.parse(errorText);
        } catch {
          // ignore
        }

        const msg = errorJson?.error?.message || '';
        // If this model does not exist or user lacks access, gracefully fallback to next model
        if (msg.includes('does not exist') || msg.includes('do not have access') || response.status === 404) {
          console.warn(`Groq model "${currentModel}" unavailable: ${msg}. Trying fallback...`);
          lastError = new ApiError(502, msg, 'AI_PROVIDER_ERROR');
          continue;
        }

        if (response.status === 429) {
          throw new ApiError(
            429,
            'Groq AI is currently rate-limited. Please try again in a moment.',
            'AI_PROVIDER_RATE_LIMITED'
          );
        }

        if (response.status === 401) {
          throw new ApiError(
            401,
            'Invalid Groq API Key. Please verify your GROQ_API_KEY in .env.',
            'AI_INVALID_KEY'
          );
        }

        throw new ApiError(
          502,
          msg || `Groq API returned error status ${response.status}`,
          'AI_PROVIDER_ERROR'
        );
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content?.trim();

      if (!text) {
        throw new ApiError(
          502,
          'Groq AI returned an empty response.',
          'AI_EMPTY_RESPONSE'
        );
      }

      return text;
    } catch (err: any) {
      if (err instanceof ApiError && err.code !== 'AI_PROVIDER_ERROR') {
        throw err;
      }
      lastError = err;
    }
  }

  throw lastError || new ApiError(502, 'Unable to connect to Groq AI provider.', 'AI_PROVIDER_ERROR');
};
