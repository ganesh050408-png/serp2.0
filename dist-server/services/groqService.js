import { ApiError } from '../errors.js';
const SYSTEM_PROMPT = `You are Adhira, the intelligent travel companion and bespoke itinerary curator for Adhira.
Tone: Calm, refined, editorial, knowledgeable, concise, and helpful.
Expertise: Global and Indian travel, architectural journeys, dining reservations, local insider routes, weather advisories, budget optimization, and in-transit companion assistance.
When responding:
- Keep answers succinct, elegant, and actionable (2-4 sentences or clean bullet points).
- If asked about itineraries or destinations, give specific recommendations (e.g. Goa, Mumbai, Rajasthan, Kerala, Ladakh, Kyoto, Amalfi).
- Offer practical suggestions for rides, cafes, heritage spots, or pacing when appropriate.`;
const normalizeMessages = (messages) => {
    const normalized = [];
    for (const message of messages) {
        const role = message.sender === 'user' ? 'user' : 'assistant';
        const content = message.text.trim();
        if (normalized.length === 0 && role === 'assistant') {
            continue;
        }
        const previous = normalized[normalized.length - 1];
        if (previous && previous.role === role) {
            previous.content = `${previous.content}\n${content}`;
        }
        else {
            normalized.push({ role, content });
        }
    }
    return normalized;
};
export const createGroqChatCompletion = async (messages, contextInfo) => {
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
        throw new ApiError(503, 'Groq AI is not configured on the server. Please add GROQ_API_KEY in backend .env', 'AI_NOT_CONFIGURED');
    }
    const userMessages = normalizeMessages(messages);
    if (userMessages.length === 0) {
        throw new ApiError(400, 'At least one user message is required.', 'INVALID_AI_REQUEST');
    }
    const systemInstruction = contextInfo?.trim()
        ? `${SYSTEM_PROMPT}\n\n[Active Trip Context]\n${contextInfo.trim()}`
        : SYSTEM_PROMPT;
    let lastError = null;
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
                let errorJson = null;
                try {
                    errorJson = JSON.parse(errorText);
                }
                catch {
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
                    throw new ApiError(429, 'Groq AI is currently rate-limited. Please try again in a moment.', 'AI_PROVIDER_RATE_LIMITED');
                }
                if (response.status === 401) {
                    throw new ApiError(401, 'Invalid Groq API Key. Please verify your GROQ_API_KEY in .env.', 'AI_INVALID_KEY');
                }
                throw new ApiError(502, msg || `Groq API returned error status ${response.status}`, 'AI_PROVIDER_ERROR');
            }
            const data = await response.json();
            const text = data?.choices?.[0]?.message?.content?.trim();
            if (!text) {
                throw new ApiError(502, 'Groq AI returned an empty response.', 'AI_EMPTY_RESPONSE');
            }
            return text;
        }
        catch (err) {
            if (err instanceof ApiError && err.code !== 'AI_PROVIDER_ERROR') {
                throw err;
            }
            lastError = err;
        }
    }
    throw lastError || new ApiError(502, 'Unable to connect to Groq AI provider.', 'AI_PROVIDER_ERROR');
};
//# sourceMappingURL=groqService.js.map