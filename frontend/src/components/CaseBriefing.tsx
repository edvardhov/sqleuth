"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FaXmark } from "react-icons/fa6";

import { TABLE_GUIDE } from "@/lib/schemaGuide";
import type { CaseData, SchemaTable } from "@/lib/types";

interface CaseBriefingProps {
  caseData: CaseData;
  schema: SchemaTable[];
  onClose: () => void;
  onOpenNotes: () => void;
}

export default function CaseBriefing({ caseData, schema, onClose, onOpenNotes }: CaseBriefingProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="neon-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 16 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 16 }}
          className="neon-card relative w-full max-w-lg overflow-hidden"
        >
          <div className="neon-card-body max-h-[85vh] overflow-y-auto">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 font-mono text-green-700/50 transition-colors hover:text-green-400"
            >
              <FaXmark />
            </button>

            <span className="neon-badge neon-badge-red mb-3">{caseData.subtitle}</span>
            <h1 className="mb-4 font-mono text-2xl font-bold tracking-wide text-green-300 terminal-glow-subtle">
              {caseData.title}
            </h1>

            <div className="mb-4 space-y-2 border-b border-green-900/25 pb-4">
              {[
                ["Victim", caseData.victim],
                ["Location", caseData.location],
                ["Date", caseData.date],
              ].map(([label, value]) => (
                <div key={label} className="neon-row">
                  <div className="neon-row-label">{label}</div>
                  <div className="neon-row-value">{value}</div>
                </div>
              ))}
            </div>

            <div className="mb-4 whitespace-pre-line font-mono text-xs leading-relaxed text-green-400/75">
              {caseData.briefing}
            </div>

            {schema.length > 0 && (
              <div className="mb-5 border-t border-green-900/25 pt-4">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-green-500/60">
                  Your database — {schema.length} tables
                </p>
                <div className="space-y-1.5">
                  {schema.map(({ table }) => (
                    <div key={table} className="flex gap-2 font-mono text-[10px]">
                      <code className="shrink-0 text-green-400/80">{table}</code>
                      <span className="text-green-700/50">— {TABLE_GUIDE[table] ?? ""}</span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={onOpenNotes}
                  className="mt-3 font-mono text-[10px] text-green-500/70 underline hover:text-green-400"
                >
                  view columns &amp; starter queries →
                </button>
              </div>
            )}

            <button type="button" onClick={onClose} className="neon-btn neon-btn-green w-full">
              Open Case File
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
