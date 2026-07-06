"use client";

import { FaLightbulb } from "react-icons/fa6";

interface HintBillboardProps {
  hints: string[];
}

export default function HintBillboard({ hints }: HintBillboardProps) {
  if (hints.length === 0) return null;

  const tickerItems = hints.map((hint, i) => (
    <span key={i} className="hint-marquee-item">
      <span className="text-green-500/40">◆</span> {hint}
    </span>
  ));

  return (
    <div className="hint-billboard mr-3 hidden min-w-0 flex-1 md:flex">
      <FaLightbulb className="mt-px shrink-0 text-green-500/50" />
      <div className="hint-billboard-viewport ml-2 min-w-0 flex-1">
        <div className="hint-marquee-track">
          <div className="hint-marquee-group">{tickerItems}</div>
          <div className="hint-marquee-group" aria-hidden>
            {tickerItems}
          </div>
        </div>
      </div>
    </div>
  );
}
