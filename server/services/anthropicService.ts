import Anthropic from '@anthropic-ai/sdk';
import { ApiError } from '../errors.js';
import type { ClientChatMessage } from '../types/ai.js';

const SYSTEM_PROMPT = `You are Adhira, the intelligent travel companion and bespoke itinerary curator for Adhira.
Tone: Calm, refined, editorial, knowledgeable, concise, and helpful.
Expertise: Global and Indian travel, architectural journeys, dining reservations, local insider routes, weather advisories, budget optimization, and in-transit companion assistance.
When responding:
- Keep answers succinct, elegant, and actionable (2-4 sentences or clean bullet points).
- If asked about itineraries or destinations, give specific recommendations (e.g. Goa, Mumbai, Rajasthan, Kerala, Ladakh, Kyoto, Amalfi).
- Offer practical suggestions for rides, cafes, heritage spots, or pacing when appropriate.`;

type AnthropicMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const normalizeMessages = (messages: ClientChatMessage[]): AnthropicMessage[] => {
  const normalized: AnthropicMessage[] = [];

  for (const message of messages) {
    const role = message.sender === 'user' ? 'user' : 'assistant';
    const content = message.text.trim();

    // Anthropic conversations must begin with a user message. The frontend's
    // initial assistant greeting is display-only, so it can be omitted here.
    if (normalized.length === 0 && role === 'assistant') {
      continue;
    }

    const previous = normalized[normalized.length - 1];
    if (previous?.role === role) {
      previous.content = `${previous.content}\n${content}`;
    } else {
      normalized.push({ role, content });
    }
  }

  return normalized;
};

export const createAnthropicChatCompletion = async (
  messages: ClientChatMessage[],
  contextInfo?: string
): Promise<string> => {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  const model = process.env.ANTHROPIC_MODEL?.trim();

  if (!apiKey || !model) {
    throw new ApiError(
      503,
      'Aethera AI is not configured on the server.',
      'AI_NOT_CONFIGURED'
    );
  }

  const anthropicMessages = normalizeMessages(messages);
  if (anthropicMessages.length === 0) {
    throw new ApiError(
      400,
      'At least one user message is required.',
      'INVALID_AI_REQUEST'
    );
  }

  const systemInstruction = contextInfo?.trim()
    ? `${SYSTEM_PROMPT}\n\n[Active Trip Context]\n${contextInfo.trim()}`
    : SYSTEM_PROMPT;

  try {
    const client = new Anthropic({
      apiKey,
      maxRetries: 0,
      timeout: 30_000,
    });

    const response = await client.messages.create({
      model,
      max_tokens: 600,
      system: systemInstruction,
      messages: anthropicMessages,
    });

    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    if (!text) {
      throw new ApiError(
        502,
        'Aethera AI returned an empty response.',
        'AI_EMPTY_RESPONSE'
      );
    }

    return text;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    const providerStatus = error instanceof Anthropic.APIError ? error.status : undefined;
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    console.error('Anthropic request failed.', {
      name: errorName,
      status: providerStatus,
    });

    if (providerStatus === 429) {
      throw new ApiError(
        502,
        'The AI provider is temporarily rate limited. Please try again later.',
        'AI_PROVIDER_RATE_LIMITED'
      );
    }

    if (errorName === 'APIConnectionTimeoutError') {
      throw new ApiError(
        504,
        'The AI provider took too long to respond. Please try again.',
        'AI_PROVIDER_TIMEOUT'
      );
    }

    throw new ApiError(
      502,
      'The AI provider is temporarily unavailable. Please try again.',
      'AI_PROVIDER_ERROR'
    );
  }
};
