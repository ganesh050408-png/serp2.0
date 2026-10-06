import { useState } from 'react';
import { Plus, ArrowRight, MessageSquare, ThumbsUp, Wallet, MapPin } from 'lucide-react';
import { InviteTravelerModal } from './InviteTravelerModal';

interface TravelTogetherProps {
  onOpenJourney?: (id: string) => void;
  onNavigateSection?: (sectionId: string) => void;
}

const INITIAL_TRAVELERS = [
  { name: 'Aravind S.', role: 'Trip Host', initials: 'AS', color: 'bg-neutral-900 text-white' },
  { name: 'Meera K.', role: 'Editor', initials: 'MK', color: 'bg-neutral-700 text-white' },
  { name: 'Rohan D.', role: 'Explorer', initials: 'RD', color: 'bg-neutral-500 text-white' },
  { name: 'Tara P.', role: 'Gastronomy Lead', initials: 'TP', color: 'bg-neutral-400 text-white' },
];

export const TravelTogether = ({ onOpenJourney, onNavigateSection }: TravelTogetherProps) => {
  const [travelers, setTravelers] = useState(INITIAL_TRAVELERS);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAddTraveler = (name: string, role: string) => {
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    setTravelers((prev) => [
      ...prev,
      { name, role, initials, color: 'bg-neutral-800 text-white' },
    ]);
  };

  const handleCollabAction = (title: string) => {
    if (title === 'Add a place' && onNavigateSection) {
      onNavigateSection('itinerary-board');
    } else if (title === 'Split expenses' && onNavigateSection) {
      onNavigateSection('budget');
    } else if (title === 'Vote on activities' && onNavigateSection) {
      onNavigateSection('itinerary');
    } else {
      setToastMessage(`Collab studio: "${title}" workspace synced.`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const COLLAB_ACTIONS = [
    { title: 'Add a place', desc: 'Drop saved villas, cafes & viewpoints into the shared workspace.', icon: MapPin },
    { title: 'Vote on activities', desc: 'Democratic polling on daily routes and optional excursions.', icon: ThumbsUp },
    { title: 'Split expenses', desc: 'Real-time automatic currency and group ledger settlement.', icon: Wallet },
    { title: 'Comment on plans', desc: 'Editorial annotations directly beside each hourly schedule.', icon: MessageSquare },
  ];

  return (
    <section id="travel-together" className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-20 border-t border-[#E7E5E2]">
      <div className="bg-[#FAF8F5] border border-[#E7E5E2] rounded-[32px] p-8 sm:p-14 lg:p-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Heading, Avatars, and CTA */}
          <div className="lg:col-span-6">
            <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F] block mb-3">
              SHARED TRAVEL STUDIO
            </span>
            <h2 className="font-instrument text-4xl sm:text-6xl md:text-7xl text-[#000000] tracking-headline leading-none">
              Journeys are better together.
            </h2>
            <p className="font-inter text-sm sm:text-base text-[#6F6F6F] mt-4 leading-relaxed max-w-lg">
              Invite the people you're traveling with and build the journey together in real-time.
            </p>

            {/* Travelers Row */}
            <div className="mt-8 pt-8 border-t border-[#E7E5E2]">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3 overflow-hidden">
                  {travelers.map((t, idx) => (
                    <div
                      key={idx}
                      className={`inline-flex items-center justify-center w-11 h-11 rounded-full ring-2 ring-[#FAF8F5] text-xs font-serif ${t.color}`}
                      title={`${t.name} (${t.role})`}
                    >
                      {t.initials}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIsInviteOpen(true)}
                    className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white text-black border border-[#E7E5E2] hover:bg-neutral-100 ring-2 ring-[#FAF8F5] text-xs transition-colors cursor-pointer"
                    title="Invite companion"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <span className="font-mono text-xs font-semibold text-[#000000] block uppercase tracking-wider">
                    {travelers.length} TRAVELERS INVITED
                  </span>
                  <span className="text-xs text-[#6F6F6F] font-inter">Live synchronization active</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={() => onOpenJourney && onOpenJourney('1')}
                className="flex items-center gap-2 rounded-full px-8 py-4 bg-[#000000] text-white text-sm font-medium hover:bg-neutral-800 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm cursor-pointer"
              >
                <span>Open Journey Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Clean Collaboration Grid */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COLLAB_ACTIONS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleCollabAction(item.title)}
                  className="bg-white border border-[#E7E5E2] rounded-2xl p-6 hover:border-black transition-colors text-left cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-neutral-100 group-hover:bg-black group-hover:text-white transition-colors flex items-center justify-center text-black mb-4">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="font-instrument text-2xl text-[#000000] mb-1.5">{item.title}</h4>
                  <p className="text-xs text-[#6F6F6F] font-inter leading-relaxed">{item.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {toastMessage && (
          <div className="mt-6 p-3 bg-white border border-black rounded-xl text-xs font-mono text-black text-center animate-fade-rise">
            {toastMessage}
          </div>
        )}
      </div>

      <InviteTravelerModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onAddTraveler={handleAddTraveler}
      />
    </section>
  );
};
