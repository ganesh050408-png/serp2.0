// Aethera AI Service
// Provider credentials are kept by the server-side API proxy.

const GENERIC_AI_ERROR = 'Aethera AI is temporarily unavailable. Please try again later.';

class AIServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AIServiceError';
  }
}

interface AIChatResponse {
  text?: unknown;
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
    throw new AIServiceError('Please enter a message before asking Aethera AI.');
  }

  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: formattedMessages, contextInfo }),
    });

    const data = (await response.json().catch(() => null)) as AIChatResponse | null;

    if (!response.ok) {
      throw new AIServiceError(typeof data?.error === 'string' ? data.error : GENERIC_AI_ERROR);
    }

    if (typeof data?.text === 'string' && data.text.trim()) {
      return data.text.trim();
    }

    throw new AIServiceError(GENERIC_AI_ERROR);
  } catch (error) {
    if (error instanceof AIServiceError) {
      throw error;
    }
    throw new AIServiceError(GENERIC_AI_ERROR);
  }
};
