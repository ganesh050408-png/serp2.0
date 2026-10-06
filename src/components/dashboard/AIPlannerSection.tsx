import { useState } from 'react';
import { Sparkles, ArrowRight, Check, SlidersHorizontal } from 'lucide-react';
import { callAetheraAI } from '../../services/aiService';

interface AIPlannerSectionProps {
  onOpenPlan?: (id?: string) => void;
}

const SUGGESTED_PROMPTS = [
  'Plan a 10-day trip through Goa and Mumbai for four people under ₹60,000.',
  '7 days in Rajasthan focusing on heritage palaces and photography spots.',
  'Slow 5-day mountain retreat in Ladakh with low-altitude acclimation.',
  'Weekend gastronomy tour across Mumbai and coastal Alibaug villas.',
];

export const AIPlannerSection = ({ onOpenPlan }: AIPlannerSectionProps) => {
  const [prompt, setPrompt] = useState(
    'Plan a 10-day trip through Goa and Mumbai for four people under ₹60,000.'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<null | {
    summary: string;
    highlights: string[];
    budgetEstimate: string;
  }>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const aiResponse = await callAetheraAI(
        [
          {
            sender: 'user',
            text: `Please generate an editorial travel plan based on this request: "${prompt}". Format with a 2-sentence summary and 3 distinct segment highlights.`,
          },
        ],
        'Editorial travel synthesis mode for Aethera luxury travel assistant.'
      );

      // Parse lines or highlights
      const lines = aiResponse.split('\n').filter((l) => l.trim().length > 0);
      const summary = lines.slice(0, 2).join(' ') || aiResponse.slice(0, 180) + '...';
      const rawHighlights = lines.filter((l) => l.startsWith('•') || l.startsWith('-') || l.startsWith('*') || l.match(/^\d\./));
      const highlights = rawHighlights.length >= 2
        ? rawHighlights.slice(0, 3).map((h) => h.replace(/^[-•*\d.]\s*/, ''))
        : [
            'Bespoke arrival & heritage quarter exploration walk',
            'Curated mid-trip signature activity & gastronomy reservations',
            'Scenic transition & coastal/mountain viewpoint wrap-up',
          ];

      setGeneratedPlan({
        summary,
        highlights,
        budgetEstimate: prompt.includes('₹')
          ? prompt.match(/₹[\d,]+/)?.[0] + ' optimized target'
          : '₹54,800 total estimated allocation',
      });
    } catch {
      setGeneratedPlan({
        summary:
          '10-day architectural and coastal expedition curated for 4 travelers balancing heritage villas in Old Goa with seaside stays in Anjuna and South Mumbai colonial galleries.',
        highlights: [
          '3 Days in Fontainhas (Latin Quarter Heritage & Bakery walks)',
          '4 Days in North Goa (Private catamaran & coastal sunset cafes)',
          '3 Days in South Mumbai & Bandra (Art Deco walk & Marine Drive dusk)',
        ],
        budgetEstimate: '₹54,800 total estimated (saving ₹5,200 under ₹60,000 cap)',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section id="ai-planner" className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-20 border-t border-[#E7E5E2]">
      <div className="bg-[#FAF8F5] border border-[#E7E5E2] rounded-[32px] p-8 sm:p-14 lg:p-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-xs font-mono uppercase tracking-wider text-[#6F6F6F] border border-[#E7E5E2] mb-4">
              <Sparkles className="w-3.5 h-3.5 text-neutral-800" />
              INTELLIGENT CURATION
            </span>
            <h2 className="font-instrument text-4xl sm:text-6xl md:text-7xl text-[#000000] tracking-headline leading-none">
              Let AI plan the details.
            </h2>
            <p className="font-inter text-sm sm:text-base text-[#6F6F6F] mt-4 max-w-2xl mx-auto leading-relaxed">
              Give us your destination, dates, budget, and travel style. Aethera creates a
              personalized itinerary that you can change at any time.
            </p>
          </div>

          {/* AI Input Form */}
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="relative bg-white border border-[#E7E5E2] rounded-3xl p-4 sm:p-6 shadow-sm focus-within:border-black transition-all">
              <div className="flex items-start gap-3">
                <span className="text-xl text-neutral-800 mt-1 select-none">✦</span>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  className="w-full bg-transparent text-[#000000] text-base sm:text-lg font-inter placeholder:text-neutral-400 focus:outline-none resize-none leading-relaxed"
                  placeholder="Describe your ideal journey in natural language..."
                />
              </div>

              {/* Bottom toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-neutral-100 mt-3 gap-4">
                <div className="flex items-center gap-2 text-xs text-[#6F6F6F]">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Real-time flight, weather & hotel rate alignment</span>
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex items-center justify-center gap-2 rounded-full px-8 py-3 bg-[#000000] text-white text-sm font-medium hover:bg-neutral-800 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <span>Create with AI</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Inspiration Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="text-xs text-[#6F6F6F] font-mono mr-1">Inspirations:</span>
              {SUGGESTED_PROMPTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(sample)}
                  className="text-xs bg-white hover:bg-neutral-100 text-[#6F6F6F] hover:text-[#000000] px-3.5 py-1.5 rounded-full border border-[#E7E5E2] transition-colors text-left truncate max-w-xs sm:max-w-none cursor-pointer"
                >
                  "{sample.slice(0, 42)}..."
                </button>
              ))}
            </div>
          </form>

          {/* Generated Result Card */}
          {generatedPlan && (
            <div className="mt-8 bg-white border border-[#E7E5E2] rounded-2xl p-6 sm:p-8 animate-fade-rise shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-emerald-700">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Custom Itinerary Generated</span>
                </div>
                <span className="text-xs font-mono text-[#6F6F6F]">{generatedPlan.budgetEstimate}</span>
              </div>

              <p className="text-sm sm:text-base text-[#000000] font-inter leading-relaxed mb-6">
                {generatedPlan.summary}
              </p>

              <div className="space-y-2 mb-6">
                <span className="text-xs font-mono uppercase text-[#6F6F6F]">Segment Itinerary:</span>
                {generatedPlan.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-[#000000] font-inter">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenPlan && onOpenPlan('1')}
                  className="flex items-center gap-2 rounded-full px-6 py-2.5 bg-[#000000] text-white text-xs font-medium hover:bg-neutral-800 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span>Open in Workspace</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
