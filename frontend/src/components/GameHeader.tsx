"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FaBook, FaGavel, FaTable } from "react-icons/fa6";

import { isMockMode } from "@/lib/api";
import HintBillboard from "@/components/HintBillboard";
import { useGameStore } from "@/store/gameStore";

export default function GameHeader() {
  const caseData = useGameStore((s) => s.caseData);
  const setShowBriefing = useGameStore((s) => s.setShowBriefing);
  const setShowCaseNotes = useGameStore((s) => s.setShowCaseNotes);
  const setShowAccusation = useGameStore((s) => s.setShowAccusation);
  const isLoading = useGameStore((s) => s.isLoading);

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-green-900/25 bg-[#080c08] px-4 py-2">
      <div className="flex items-center gap-3">
        <Image
          src="/logo-mark.png"
          alt="SQLeuth"
          width={36}
          height={36}
          className="rounded-sm"
          priority
        />
        <div>
          <h1 className="font-mono text-base font-bold tracking-widest text-green-400/90 terminal-glow-subtle">
            SQLeuth
          </h1>
          <p className="font-mono text-[10px] tracking-wider text-green-700/50">
            {caseData?.subtitle ?? "Loading case..."}
            {isMockMode() && " · DEMO"}
          </p>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        {caseData?.hints && <HintBillboard hints={caseData.hints} />}

        <button
          type="button"
          onClick={() => setShowCaseNotes(true)}
          className="flex items-center gap-1.5 rounded border border-green-800/40 px-3 py-1.5 font-mono text-[11px] text-green-500/80 transition-colors hover:border-green-600/50 hover:text-green-400"
        >
          <FaTable />
          Case Notes
        </button>

        <button
          type="button"
          onClick={() => setShowBriefing(true)}
          className="flex items-center gap-1.5 rounded border border-green-800/40 px-3 py-1.5 font-mono text-[11px] text-green-500/80 transition-colors hover:border-green-600/50 hover:text-green-400"
        >
          <FaBook />
          Case File
        </button>

        <button
          type="button"
          onClick={() => setShowAccusation(true)}
          disabled={isLoading}
          className="neon-btn neon-btn-red flex items-center gap-1.5 px-3 py-1.5 disabled:opacity-40"
        >
          <FaGavel />
          Accuse
        </button>
      </div>
    </header>
  );
}

interface ResultOverlayProps {
  correct: boolean;
  epilogue: string;
  killerName?: string | null;
  onClose: () => void;
  onRestart: () => void;
}

export function ResultOverlay({
  correct,
  epilogue,
  killerName,
  onClose,
  onRestart,
}: ResultOverlayProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="neon-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.85 }}
          animate={{ scale: 1 }}
          className={`neon-card max-w-lg ${correct ? "" : "neon-card-red"}`}
        >
          <div className="neon-card-body text-center">
            <span className={`neon-badge mb-3 ${correct ? "neon-badge-green" : "neon-badge-red"}`}>
              {correct ? "Case Closed" : "Case Cold"}
            </span>
            <h2 className="mb-3 font-mono text-2xl font-bold text-green-300 terminal-glow-subtle">
              {correct ? "Guilty." : "Wrong Suspect."}
            </h2>
            {killerName && (
              <p className="mb-3 font-mono text-base font-bold text-red-400">{killerName}</p>
            )}
            <p className="mb-6 font-mono text-xs leading-relaxed text-green-400/70">
              {epilogue}
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="neon-btn neon-btn-ghost flex-1">
                Review Evidence
              </button>
              <button type="button" onClick={onRestart} className="neon-btn neon-btn-green flex-1">
                New Case
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
