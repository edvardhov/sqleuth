"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaXmark } from "react-icons/fa6";

import { solveCase } from "@/lib/api";
import type { SolveResult } from "@/lib/types";

const SUSPECTS = [
  { id: 1, name: "Eleanor Whitmore" },
  { id: 2, name: "Danny Reyes" },
  { id: 3, name: "Frank Malone" },
  { id: 4, name: "Lorraine Pierce" },
  { id: 5, name: "Dr. Arthur Vance" },
  { id: 6, name: "Tommy Shaw" },
];

interface AccusationModalProps {
  onClose: () => void;
  onResult: (result: SolveResult) => void;
}

export default function AccusationModal({ onClose, onResult }: AccusationModalProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAccuse = async () => {
    if (selected === null) return;
    setSubmitting(true);
    try {
      const result = await solveCase(selected);
      onResult(result);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="neon-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="neon-card neon-card-red relative w-full max-w-md"
        >
          <div className="neon-card-body">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 font-mono text-green-700/50 transition-colors hover:text-green-400"
            >
              <FaXmark />
            </button>

            <span className="neon-badge neon-badge-red mb-2">Final Accusation</span>
            <h2 className="mb-1 font-mono text-xl font-bold text-green-300">Make an Accusation</h2>
            <p className="mb-4 font-mono text-[11px] text-green-700/60">
              Wrong choice closes the case forever.
            </p>

            <div className="mb-5 space-y-1.5">
              {SUSPECTS.map((s) => (
                <label
                  key={s.id}
                  className={`flex cursor-pointer items-center gap-3 rounded border px-3 py-2.5 transition-all ${
                    selected === s.id
                      ? "border-red-500/50 bg-red-950/20"
                      : "border-green-900/25 bg-black/20 hover:border-green-700/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="suspect"
                    value={s.id}
                    checked={selected === s.id}
                    onChange={() => setSelected(s.id)}
                    className="accent-[#ff4466]"
                  />
                  <span className="font-mono text-sm text-green-300/90">{s.name}</span>
                </label>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAccuse}
              disabled={selected === null || submitting}
              className="neon-btn neon-btn-red w-full"
            >
              {submitting ? "Processing..." : "Accuse Suspect"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
