// Aethera AI Service
// Provider credentials are kept safely by the server-side API proxy.

const FRIENDLY_AI_ERROR = 'Adhira is having trouble connecting right now. Please try again in a moment.';

export class AIServiceError extends Error {
  public isRetryable: boolean;

  constructor(message: string, isRetryable = true) {
    super(message);
    this.name = 'AIServiceError';
    this.isRetryable = isRetryable;
  }
}

interface AIChatResponse {
  text?: unknown;
  modelUsed?: unknown;
  error?: unknown;
}

export const callAetheraAI = async (
  messages: { sender: 'user' | 'ai'; text: string }[],
  contextInfo?: string
): Promise<string> => {
  const formattedMessages = messages
    .filter((m) => m.text && m.text.trim().length > 0)
    .map((m) => ({ ...m, text: m.text.trim() }));

  if (formattedMessages.length === 0) {
    throw new AIServiceError('Please enter a message before asking Adhira.', false);
  }

  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: formattedMessages, contextInfo }),
    });

    const data = (await response.json().catch(() => null)) as AIChatResponse | null;

    if (!response.ok) {
      console.warn('[Adhira Client] AI Request failed with status:', response.status);
      throw new AIServiceError(FRIENDLY_AI_ERROR, true);
    }

    if (typeof data?.text === 'string' && data.text.trim()) {
      return data.text.trim();
    }

    throw new AIServiceError(FRIENDLY_AI_ERROR, true);
  } catch (error) {
    if (error instanceof AIServiceError) {
      throw error;
    }
    console.error('[Adhira Client] Exception during AI call:', error);
    throw new AIServiceError(FRIENDLY_AI_ERROR, true);
  }
};
