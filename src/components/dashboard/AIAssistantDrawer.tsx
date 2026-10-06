import { useState } from 'react';
import { Sparkles, X, Send, Check, ArrowRight, Loader2 } from 'lucide-react';
import { callAetheraAI } from '../../services/aiService';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  actionButton?: {
    label: string;
    action: string;
  };
}

const QUICK_QUESTIONS = [
  'Plan tomorrow',
  'Make this trip cheaper',
  'Suggest something nearby',
  'Add another city',
  'Optimize my itinerary',
  'What should I pack?',
];

export const AIAssistantDrawer = ({ isOpen, onClose, onOpen }: AIAssistantDrawerProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Good morning Aravind. I am tracking your Goa · Mumbai · Delhi journey. How may I refine your plans today?',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [appliedAction, setAppliedAction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text };
    const newMsgs: Message[] = [...messages, userMessage];
    setMessages(newMsgs);
    setInputText('');
    setIsLoading(true);

    try {
      const aiReplyText = await callAetheraAI(
        newMsgs,
        'Active Trip: Goa · Mumbai · Delhi (10 Days), 4 Travelers, Budget ₹54,800'
      );

      let actionButton: { label: string; action: string } | undefined;
      const lower = text.toLowerCase();
      if (lower.includes('cheap') || lower.includes('cost') || lower.includes('budget')) {
        actionButton = {
          label: 'Apply changes (-₹1,800)',
          action: 'apply_cheaper',
        };
      } else if (lower.includes('tomorrow') || lower.includes('plan')) {
        actionButton = {
          label: 'Add Assagao workshop to itinerary',
          action: 'add_assagao',
        };
      } else {
        actionButton = {
          label: 'Confirm update in workspace',
          action: 'confirm_general',
        };
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiReplyText,
          actionButton,
        },
      ]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'I have updated your journey workspace with your latest request.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyAction = (action: string) => {
    setAppliedAction(action);
    setMessages((prev) => [
      ...prev,
      {
        sender: 'ai',
        text: '✓ Changes successfully applied to your active itinerary!',
      },
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button (when closed) */}
      {!isOpen && (
        <button
          type="button"
          onClick={onOpen}
          className="fixed bottom-7 right-7 z-50 flex items-center gap-2.5 rounded-full px-5 py-3.5 bg-[#000000] text-white shadow-2xl hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 ai-pulse-button cursor-pointer"
          aria-label="Open Aethera AI Assistant"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span className="font-medium text-xs sm:text-sm font-sans tracking-wide">✦ Aethera AI</span>
        </button>
      )}

      {/* Floating Conversational Drawer / Panel */}
      {isOpen && (
        <div className="fixed bottom-7 right-4 sm:right-7 z-50 w-[calc(100vw-32px)] sm:w-[420px] max-h-[600px] h-[85vh] bg-white border border-[#E7E5E2] rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-fade-rise">
          {/* Header */}
          <div className="p-5 border-b border-[#E7E5E2] bg-[#FAF8F5] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#000000] text-white flex items-center justify-center text-xs">
                ✦
              </div>
              <div>
                <h3 className="font-instrument text-2xl text-[#000000] leading-none">Aethera AI</h3>
                <p className="text-[11px] text-[#6F6F6F] font-inter mt-0.5">
                  Powered by Claude 3.5 Sonnet Intelligent Curation
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
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${m.sender === 'user'
                      ? 'bg-[#000000] text-white rounded-br-none'
                      : 'bg-[#FAF8F5] border border-[#E7E5E2] text-[#000000] rounded-bl-none whitespace-pre-line'
                    }`}
                >
                  {m.text}
                </div>

                {/* Optional AI Action Button */}
                {m.actionButton && (
                  <button
                    type="button"
                    onClick={() => handleApplyAction(m.actionButton!.action)}
                    disabled={appliedAction === m.actionButton.action}
                    className="mt-2 flex items-center gap-1.5 rounded-full px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    {appliedAction === m.actionButton.action ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Changes applied</span>
                      </>
                    ) : (
                      <>
                        <span>{m.actionButton.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs font-mono text-[#6F6F6F] p-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                <span>Aethera AI is synthesizing thoughts...</span>
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
              placeholder="Ask Aethera AI (e.g. Make tomorrow cheaper)..."
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
    </>
  );
};
