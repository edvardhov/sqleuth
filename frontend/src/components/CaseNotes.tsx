"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FaXmark, FaTable } from "react-icons/fa6";

import { TABLE_GUIDE } from "@/lib/schemaGuide";
import type { SchemaTable } from "@/lib/types";

interface CaseNotesProps {
  schema: SchemaTable[];
  onClose: () => void;
}

export default function CaseNotes({ schema, onClose }: CaseNotesProps) {
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
          className="neon-card relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden"
        >
          <div className="neon-card-body flex min-h-0 flex-1 flex-col overflow-hidden">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 font-mono text-green-700/50 transition-colors hover:text-green-400"
            >
              <FaXmark />
            </button>

            <div className="mb-4 flex items-center gap-2">
              <FaTable className="text-green-500/60" />
              <div>
                <span className="neon-badge neon-badge-green mb-1">Case Notes</span>
                <h2 className="font-mono text-lg font-bold text-green-300">Database Schema</h2>
              </div>
            </div>

            <p className="mb-4 font-mono text-[11px] leading-relaxed text-green-600/60">
              Everything you know about this case lives in these tables. Write SELECT
              queries to read them — you cannot modify the data.
            </p>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {schema.map(({ table, columns }) => (
                <div key={table} className="neon-row">
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <code className="font-mono text-xs font-bold text-green-400">{table}</code>
                    <span className="font-mono text-[9px] text-green-800/50">
                      {columns.length} columns
                    </span>
                  </div>
                  <p className="mb-2 font-mono text-[10px] leading-relaxed text-green-600/55">
                    {TABLE_GUIDE[table] ?? "Investigation data."}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {columns.map((col) => (
                      <span
                        key={col.name}
                        className="rounded border border-green-900/30 bg-black/30 px-1.5 py-0.5 font-mono text-[9px] text-green-500/70"
                        title={col.type}
                      >
                        {col.name}
                        <span className="ml-1 text-green-800/45">{col.type}</span>
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`SELECT * FROM ${table} LIMIT 10;`);
                    }}
                    className="mt-2 font-mono text-[9px] text-green-700/45 underline hover:text-green-500/70"
                  >
                    copy starter query
                  </button>
                </div>
              ))}
            </div>

            <button type="button" onClick={onClose} className="neon-btn neon-btn-green mt-4 w-full">
              Back to Investigation
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
