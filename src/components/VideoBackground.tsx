import { useEffect, useRef, useState } from 'react';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4';

export const VideoBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [opacity, setOpacity] = useState<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const checkFade = () => {
      if (video && video.duration && !video.paused) {
        const currentTime = video.currentTime;
        const duration = video.duration;
        const fadeDuration = 0.5;

        // Fade in over 0.5s at the start (opacity 0 to 1)
        if (currentTime < fadeDuration) {
          const fadeInOpacity = Math.min(1, Math.max(0, currentTime / fadeDuration));
          setOpacity(fadeInOpacity);
        }
        // Fade out over 0.5s before the end (opacity 1 to 0)
        else if (currentTime >= duration - fadeDuration) {
          const fadeOutOpacity = Math.max(0, (duration - currentTime) / fadeDuration);
          setOpacity(fadeOutOpacity);
        }
        // Full opacity in between
        else {
          setOpacity(1);
        }
      }

      rafRef.current = requestAnimationFrame(checkFade);
    };

    rafRef.current = requestAnimationFrame(checkFade);

    const handleEnded = () => {
      setOpacity(0);
      setTimeout(() => {
        if (video) {
          video.currentTime = 0;
          video.play().catch(() => {
            // Autoplay handling
          });
        }
      }, 100);
    };

    video.addEventListener('ended', handleEnded);

    // Initial play
    video.play().catch(() => {
      // Browser autoplay policy might need muted (muted is set on video)
    });

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <div
      className="absolute overflow-hidden pointer-events-none z-0"
      style={{
        top: '300px',
        inset: 'auto 0 0 0',
        height: 'calc(100vh - 300px)',
        minHeight: '500px',
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={VIDEO_URL}
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover transition-opacity duration-75 ease-linear"
        style={{ opacity }}
      />

      {/* Gradient Overlays: absolute inset-0 bg-gradient-to-b from-background via-transparent to-background positioned over the video */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white pointer-events-none" />
    </div>
  );
};
