import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  X,
  Send,
  Check,
  ArrowRight,
  Loader2,
  RotateCcw,
  Compass,
  Calendar,
  IndianRupee,
  ExternalLink,
} from 'lucide-react';
import { callAetheraAI } from '../../services/aiService';
import { StoredJourney, travelStorage } from '../../services/travelStorage';
import { getOrCreateDestination } from '../../services/destinations';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  journey?: StoredJourney | null;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  isError?: boolean;
  retryText?: string;
  actionButton?: {
    label: string;
    action: string;
    proposedJourney?: {
      destination: string;
      durationDays: number;
      budget: number;
      style: string;
    };
  };
}

const QUICK_QUESTIONS = [
  'Plan a family trip for me',
  'I want a beach-type destination',
  'Suggest a budget mountain trip',
  'Plan a 4-day trip to Goa',
  'Suggest romantic destinations',
  'Find spiritual destinations',
];

// Helper to render markdown links into clickable elements
const renderFormattedMessage = (content: string) => {
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index));
    }
    const [fullMatch, text, url] = match;
    parts.push(
      <a
        key={match.index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-800 underline font-medium text-[11px]"
        onClick={(e) => e.stopPropagation()}
      >
        <span>{text}</span>
        <ExternalLink className="w-2.5 h-2.5 inline shrink-0" />
      </a>
    );
    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return parts;
};

// Helper to extract a destination name from text
const detectProposedDestination = (text: string): { destination: string; durationDays: number; budget: number; style: string } => {
  const lower = text.toLowerCase();
  let dest = 'Goa';
  if (lower.includes('ooty') || lower.includes('coimbatore') || lower.includes('nilgiri')) dest = 'Ooty';
  else if (lower.includes('munnar') || lower.includes('kerala')) dest = 'Munnar';
  else if (lower.includes('jaipur') || lower.includes('rajasthan')) dest = 'Jaipur';
  else if (lower.includes('udaipur')) dest = 'Udaipur';
  else if (lower.includes('varkala')) dest = 'Varkala';
  else if (lower.includes('gokarna')) dest = 'Gokarna';
  else if (lower.includes('andaman') || lower.includes('havelock')) dest = 'Andaman';
  else if (lower.includes('manali') || lower.includes('himachal')) dest = 'Manali';
  else if (lower.includes('yercaud')) dest = 'Yercaud';
  else if (lower.includes('rishikesh')) dest = 'Rishikesh';
  else if (lower.includes('goa')) dest = 'Goa';

  let days = 4;
  const dayMatch = text.match(/(\d+)[- ]*(?:day|night)/i);
  if (dayMatch) days = Math.min(14, Math.max(2, parseInt(dayMatch[1], 10)));

  let budget = 45000;
  const budgetMatch = text.match(/₹\s*([\d,]+)/);
  if (budgetMatch) {
    const rawNum = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(rawNum) && rawNum > 5000) budget = rawNum;
  }

  let style = 'Curated Leisure & Heritage';
  if (lower.includes('family') || lower.includes('children')) style = 'Family & Cultural Exploration';
  else if (lower.includes('beach') || lower.includes('coast')) style = 'Coastal & Relaxed';
  else if (lower.includes('mountain') || lower.includes('hill')) style = 'Mountain & Scenic Nature';
  else if (lower.includes('budget')) style = 'Budget & Authentic Local Life';

  return { destination: dest, durationDays: days, budget, style };
};

export const AIAssistantDrawer = ({ isOpen, onClose, onOpen, journey }: AIAssistantDrawerProps) => {
  const journeyTitle = journey?.destination || journey?.destinations?.[0]?.name || 'Current Journey';
  const totalDays = journey?.itinerary?.length || 7;
  const travelers = journey?.travelers || 2;
  const budget = journey?.budgetValue?.label || (journey?.budget ? `₹${journey.budget.toLocaleString()}` : '₹50,000');

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: `Good day. I am Adhira, your proactive AI travel researcher. Whether you're seeking a family vacation, a serene beach retreat, or an adventurous mountain corridor, I will research, compare, and draft a complete day-by-day journey for you.\n\nWhat kind of journey are you imagining?`,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Review & Confirmation Modal state for "Create This Journey"
  const [pendingCreation, setPendingCreation] = useState<{
    destination: string;
    durationDays: number;
    budget: number;
    style: string;
  } | null>(null);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (journey) {
      setMessages([
        {
          sender: 'ai',
          text: `Good day. I am Adhira, your proactive travel researcher tracking your ${journeyTitle} journey (${totalDays} Days, ${travelers} Travelers). How may I research, optimize, or expand your travel plans today?`,
        },
      ]);
    }
  }, [journey?.id, journeyTitle, totalDays, travelers]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text };
    const newMsgs: Message[] = [...messages.filter((m) => !m.isError), userMessage];
    setMessages(newMsgs);
    setInputText('');
    setIsLoading(true);

    try {
      const aiReplyText = await callAetheraAI(
        newMsgs,
        `Active User Context: Aravind S., base Chennai. Active Journey: ${journeyTitle} (${totalDays} Days), ${travelers} Travelers, Budget ${budget}`
      );

      const proposed = detectProposedDestination(aiReplyText);
      const actionButton = {
        label: `✦ Create ${proposed.destination} Journey (${proposed.durationDays} Days)`,
        action: 'create_journey',
        proposedJourney: proposed,
      };

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiReplyText,
          actionButton,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Adhira is having trouble connecting right now. Please try again in a moment.',
          isError: true,
          retryText: text,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreationModal = (proposed: {
    destination: string;
    durationDays: number;
    budget: number;
    style: string;
  }) => {
    setPendingCreation(proposed);
  };

  const handleConfirmSaveJourney = () => {
    if (!pendingCreation) return;

    const destObj = getOrCreateDestination(pendingCreation.destination);
    const newId = crypto.randomUUID ? crypto.randomUUID() : `journey_${Date.now()}`;

    const newJourney: StoredJourney = {
      id: newId,
      destination: pendingCreation.destination.toUpperCase(),
      budget: pendingCreation.budget,
      travelers: 2,
      style: pendingCreation.style,
      createdAt: new Date().toISOString(),
      status: 'Upcoming',
      destinations: [destObj],
      startDate: '2026-07-10',
      endDate: '2026-07-15',
      datesDecided: false,
      travellersBreakdown: { adults: 2, children: 0 },
      budgetValue: {
        amount: pendingCreation.budget,
        label: `₹${pendingCreation.budget.toLocaleString()}`,
      },
      interests: [pendingCreation.style],
      pace: 'balanced',
      travelType: 'friends',
      members: [{ id: 'user_you', name: 'You', role: 'owner' }],
      expenses: [],
      coverImage: destObj.image,
      itinerary: Array.from({ length: pendingCreation.durationDays }).map((_, idx) => ({
        dayNumber: idx + 1,
        date: `Day ${idx + 1}`,
        city: destObj.city,
        activities: [
          `Morning guided exploration of ${destObj.attractions?.[idx % (destObj.attractions?.length || 1)] || 'heritage sights'}`,
          `Afternoon local culinary tasting and artisan haven visit`,
          `Evening scenic sunset promenade and dinner`,
        ],
      })),
    };

    travelStorage.saveJourney(newJourney);
    setPendingCreation(null);
    setSavedSuccessMessage(`✓ ${pendingCreation.destination} journey added to your dashboard!`);
    setTimeout(() => setSavedSuccessMessage(null), 4000);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* Floating Trigger Button (when closed) */}
      {!isOpen && (
        <button
          type="button"
          onClick={onOpen}
          className="fixed bottom-7 right-7 z-50 flex items-center gap-2.5 rounded-full px-5 py-3.5 bg-[#000000] text-white shadow-2xl hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 ai-pulse-button cursor-pointer"
          aria-label="Open Adhira Assistant"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span className="font-medium text-xs sm:text-sm font-sans tracking-wide">✦ Adhira Planner</span>
        </button>
      )}

      {/* Floating Conversational Drawer / Panel */}
      {isOpen && (
        <div className="fixed bottom-7 right-4 sm:right-7 z-50 w-[calc(100vw-32px)] sm:w-[460px] max-h-[640px] h-[88vh] bg-white border border-[#E7E5E2] rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-fade-rise">
          {/* Header */}
          <div className="p-5 border-b border-[#E7E5E2] bg-[#FAF8F5] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#000000] text-white flex items-center justify-center text-xs">
                ✦
              </div>
              <div>
                <h3 className="font-instrument text-2xl text-[#000000] leading-none">Adhira</h3>
                <p className="text-[11px] text-[#6F6F6F] font-inter mt-0.5">
                  Proactive AI Travel Researcher & Itinerary Curator
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#6F6F6F] hover:text-[#000000] hover:bg-neutral-200/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Success Notification Banner */}
          {savedSuccessMessage && (
            <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center gap-2 text-xs font-mono text-emerald-800 animate-fade-in">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{savedSuccessMessage}</span>
            </div>
          )}

          {/* Quick Prompts Bar */}
          <div className="px-4 py-2.5 bg-white border-b border-neutral-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-[11px] text-[#6F6F6F] hover:text-[#000000] bg-neutral-100 hover:bg-neutral-200 px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Message History */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 font-inter text-xs sm:text-sm">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl p-4 leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#000000] text-white rounded-br-none'
                      : m.isError
                      ? 'bg-red-50/90 border border-red-200 text-red-950 rounded-bl-none'
                      : 'bg-[#FAF8F5] border border-[#E7E5E2] text-[#000000] rounded-bl-none whitespace-pre-line text-xs sm:text-[13px]'
                  }`}
                >
                  {typeof m.text === 'string' ? renderFormattedMessage(m.text) : m.text}
                </div>

                {/* Retry Button if error */}
                {m.isError && m.retryText && (
                  <button
                    type="button"
                    onClick={() => handleSend(m.retryText)}
                    disabled={isLoading}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-300 hover:border-black text-[11px] font-mono text-neutral-800 hover:text-black transition-colors cursor-pointer bg-white"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Retry</span>
                  </button>
                )}

                {/* Proposed "Create This Journey" Action Button */}
                {m.actionButton?.proposedJourney && !m.isError && (
                  <button
                    type="button"
                    onClick={() => handleOpenCreationModal(m.actionButton!.proposedJourney!)}
                    className="mt-2.5 inline-flex items-center gap-2 rounded-full px-4 py-2 bg-black text-white text-xs font-mono hover:bg-neutral-800 transition-all hover:scale-[1.02] shadow-xs cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{m.actionButton.label}</span>
                    <ArrowRight className="w-3 h-3 text-neutral-400" />
                  </button>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2.5 text-xs font-mono text-[#6F6F6F] p-3 bg-[#FAF8F5] rounded-2xl border border-neutral-200">
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Adhira is researching live destinations & logistics…</span>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#FAF8F5] border-t border-[#E7E5E2] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything (e.g. Plan a family trip for me)..."
              disabled={isLoading}
              className="flex-1 bg-white border border-[#E7E5E2] rounded-full px-4 py-2.5 text-xs sm:text-sm text-[#000000] placeholder:text-neutral-400 focus:outline-none focus:border-black disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="w-9 h-9 rounded-full bg-[#000000] text-white flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer shrink-0 disabled:opacity-40"
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </form>
        </div>
      )}

      {/* Confirmation & Review Modal for "Create This Journey" */}
      {pendingCreation && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="fixed inset-0 -z-10" onClick={() => setPendingCreation(null)} />
          <div className="bg-white border border-[#E7E5E2] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-5 animate-fade-rise">
            <button
              onClick={() => setPendingCreation(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-neutral-500 hover:text-black"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">
                CONFIRM & SAVE JOURNEY
              </span>
              <h3 className="font-instrument text-3xl text-black mt-1">
                {pendingCreation.destination} Voyage
              </h3>
              <p className="text-xs text-neutral-600 font-inter mt-1">
                Review proposed details before adding to your Aethera workspace.
              </p>
            </div>

            <div className="space-y-3 bg-[#FAF8F5] border border-[#E7E5E2] p-4 rounded-2xl text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" /> Destination:
                </span>
                <span className="font-bold text-black">{pendingCreation.destination}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Duration:
                </span>
                <span className="font-bold text-black">{pendingCreation.durationDays} Days Itinerary</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5" /> Estimated Budget:
                </span>
                <span className="font-bold text-black">₹{pendingCreation.budget.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Travel Style:</span>
                <span className="font-semibold text-black">{pendingCreation.style}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPendingCreation(null)}
                className="flex-1 py-2.5 rounded-full border border-neutral-200 text-xs font-mono text-neutral-700 hover:text-black hover:border-black transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSaveJourney}
                className="flex-1 py-2.5 rounded-full bg-black text-white text-xs font-mono hover:bg-neutral-800 transition-all shadow-xs cursor-pointer"
              >
                Save Journey →
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
};
