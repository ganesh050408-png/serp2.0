import { ArrowUpRight } from 'lucide-react';

interface DestinationDiscoveryProps {
  onSelectDestination?: (name: string, journeyId?: string) => void;
}

const DISCOVERIES = [
  {
    number: '01',
    name: 'GOA',
    journeyId: '1',
    tags: 'Beaches · Food · Nightlife',
    desc: 'Beyond the crowded shores lies a tranquil world of terracotta rooflines, Portuguese chapels, spice plantations, and unhurried coastal bistros.',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop',
  },
  {
    number: '02',
    name: 'LADAKH',
    journeyId: '4',
    tags: 'Mountains · Adventure · Nature',
    desc: 'High-altitude moonscapes, Buddhist gompas perched on granite cliffs, and turquoise glacial lakes suspended under deep cobalt skies.',
    image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=1200&auto=format&fit=crop',
  },
  {
    number: '03',
    name: 'RAJASTHAN',
    journeyId: '2',
    tags: 'Culture · History · Architecture',
    desc: 'Gilded palace courtyards, hand-painted stepwells, and desert tent retreats where royal history converges with contemporary artistic revivals.',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1200&auto=format&fit=crop',
  },
];

export const DestinationDiscovery = ({ onSelectDestination }: DestinationDiscoveryProps) => {
  return (
    <section id="discovery" className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-20 border-t border-[#E7E5E2]">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
        <div>
          <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F] block mb-2">
            EDITORIAL EDIT
          </span>
          <h2 className="font-instrument text-4xl sm:text-5xl md:text-6xl text-[#000000] tracking-headline leading-none">
            Places worth discovering.
          </h2>
          <p className="font-inter text-sm sm:text-base text-[#6F6F6F] mt-4 max-w-md">
            Curated narratives from our global network of architects, writers, and local insiders.
          </p>
        </div>

        <span className="text-xs font-mono text-[#6F6F6F]">ISSUE № 08 · SUMMER 2026</span>
      </div>

      {/* Editorial Destination Stories */}
      <div className="space-y-16">
        {DISCOVERIES.map((item) => (
          <div
            key={item.number}
            onClick={() => onSelectDestination && onSelectDestination(item.name, item.journeyId)}
            className="group grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-white border border-[#E7E5E2] hover:border-black rounded-[28px] overflow-hidden p-6 sm:p-8 card-hover-effect cursor-pointer transition-all shadow-xs hover:shadow-lg"
          >
            {/* Left/Top Image */}
            <div className="lg:col-span-7 h-[280px] sm:h-[360px] rounded-2xl overflow-hidden relative bg-neutral-900">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* Right Editorial Copy */}
            <div className="lg:col-span-5 flex flex-col justify-between py-2">
              <div>
                <span className="font-mono text-xs font-semibold text-[#6F6F6F] block mb-1">
                  {item.number}
                </span>
                <h3 className="font-instrument text-4xl sm:text-5xl text-[#000000] leading-none mb-3">
                  {item.name}
                </h3>
                <span className="text-xs font-mono text-[#6F6F6F] block mb-4">
                  {item.tags}
                </span>
                <p className="text-sm text-[#6F6F6F] font-inter leading-relaxed mb-6">
                  {item.desc}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectDestination) onSelectDestination(item.name, item.journeyId);
                  }}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-[#000000] text-white text-xs font-medium hover:bg-neutral-800 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span>Explore {item.name}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
