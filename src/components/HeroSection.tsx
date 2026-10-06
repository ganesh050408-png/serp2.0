interface HeroSectionProps {
  onBeginJourney?: () => void;
}

export const HeroSection = ({ onBeginJourney }: HeroSectionProps) => {
  return (
    <section className="relative z-10 w-full flex-1 flex flex-col items-center justify-center text-center px-6 py-8">
      {/* Headline */}
      <h1
        className="font-instrument font-normal text-5xl sm:text-7xl md:text-8xl max-w-7xl text-[#000000] animate-fade-rise select-none"
        style={{
          lineHeight: '0.95',
          letterSpacing: '-2.46px',
        }}
      >
        Beyond <span className="italic text-[#6F6F6F]">silence,</span> we build{' '}
        <span className="italic text-[#6F6F6F]">the eternal.</span>
      </h1>

      {/* Description */}
      <p className="font-inter text-base sm:text-lg max-w-2xl mt-8 leading-relaxed text-[#6F6F6F] animate-fade-rise-delay">
        Building platforms for brilliant minds, fearless makers, and thoughtful souls.
        Through the noise, we craft digital havens for deep work and pure flows.
      </p>

      {/* Hero CTA Button */}
      <div className="mt-12 animate-fade-rise-delay-2">
        <button
          type="button"
          onClick={onBeginJourney}
          className="rounded-full px-14 py-5 text-base font-medium bg-[#000000] text-[#FFFFFF] shadow-lg shadow-black/5 hover:shadow-black/15 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
        >
          Begin Journey
        </button>
      </div>
    </section>
  );
};
