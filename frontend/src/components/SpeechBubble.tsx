import type { ReactNode } from 'react';

interface SpeechBubbleProps {
  children: ReactNode;
  className?: string;
}

export function SpeechBubble({ children, className = '' }: SpeechBubbleProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="rounded-2xl border-[2.5px] border-ink bg-white px-5 py-4 font-heading text-[17px] font-semibold leading-snug text-ink">
        {children}
      </div>
      {/* tail pointing down toward Pip */}
      <span
        className="absolute -bottom-[11px] left-10 h-5 w-5 rotate-45 border-b-[2.5px] border-r-[2.5px] border-ink bg-white"
        aria-hidden="true"
      />
    </div>
  );
}
