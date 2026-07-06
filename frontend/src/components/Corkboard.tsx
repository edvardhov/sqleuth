"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaFingerprint, FaUser, FaSkull } from "react-icons/fa6";

import type { QueryHistoryEntry } from "@/lib/types";

interface CorkboardProps {
  entries: QueryHistoryEntry[];
  latestNarration: string | null;
}

function normalizeSql(sql: string): string {
  return sql.trim().toLowerCase().replace(/\s+/g, " ");
}

function getCell(row: (string | number | null)[], columns: string[], col: string): string | null {
  const idx = columns.findIndex((c) => c.toLowerCase() === col.toLowerCase());
  return idx >= 0 && row[idx] != null ? String(row[idx]) : null;
}

function isSuspectResult(columns: string[]): boolean {
  return columns.includes("mugshot_key") || (columns.includes("name") && columns.includes("occupation"));
}

function isVictimQuery(sql: string): boolean {
  const n = normalizeSql(sql);
  return n.includes("victim") || n.includes("crime_scene");
}

function NarratorCard({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 18);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="neon-card mb-4"
    >
      <div className="neon-card-body">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-green-500/70">
          // detective.log
        </p>
        <p className="font-mono text-xs leading-relaxed text-green-300/80">{displayed}</p>
      </div>
    </motion.div>
  );
}

function SuspectGrid({
  rows,
  columns,
}: {
  rows: (string | number | null)[][];
  columns: string[];
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {rows.slice(0, 6).map((row, i) => {
        const name = getCell(row, columns, "name") ?? "Unknown";
        const occupation = getCell(row, columns, "occupation") ?? "";
        return (
          <div key={i} className="neon-tile">
            <div className="flex h-10 items-center justify-center bg-black/50">
              <FaUser className="text-sm text-green-500/20" />
            </div>
            <div className="px-2 py-1.5">
              <p className="truncate font-mono text-[10px] font-bold text-green-300/90">{name}</p>
              {occupation && (
                <p className="truncate font-mono text-[9px] text-green-700/60">{occupation}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EvidenceCard({ entry }: { entry: QueryHistoryEntry }) {
  const { result, sql } = entry;
  const victimQuery = isVictimQuery(sql);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className={`neon-card w-full max-w-md ${victimQuery ? "neon-card-red" : ""}`}
    >
      <div className="neon-card-body">
        {/* Header */}
        <div className="mb-3 flex items-start gap-2.5 border-b border-green-900/30 pb-3">
          <div
            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded border ${
              victimQuery
                ? "border-red-500/30 bg-red-950/30 text-red-400/80"
                : "border-green-500/25 bg-green-950/30 text-green-400/70"
            }`}
          >
            {victimQuery ? <FaSkull className="text-xs" /> : <FaFingerprint className="text-xs" />}
          </div>
          <div className="min-w-0 flex-1">
            <span className={`neon-badge mb-1.5 ${victimQuery ? "neon-badge-red" : "neon-badge-green"}`}>
              {victimQuery ? "Victim File" : "Evidence Pin"}
            </span>
            <p className="truncate font-mono text-[10px] leading-relaxed text-green-600/60">{sql}</p>
          </div>
        </div>

        {/* Body */}
        {result.error ? (
          <p className="font-mono text-xs text-red-400/90">{result.error}</p>
        ) : isSuspectResult(result.columns) ? (
          <SuspectGrid rows={result.rows} columns={result.columns} />
        ) : (
          <div className="space-y-1.5">
            {result.rows.slice(0, 4).map((row, ri) => (
              <div key={ri} className="neon-row">
                {result.columns.map((col, ci) => (
                  <div key={col} className="mb-1 last:mb-0">
                    <div className="neon-row-label">{col}</div>
                    <div className="neon-row-value">{String(row[ci] ?? "—")}</div>
                  </div>
                ))}
              </div>
            ))}
            {result.row_count > 4 && (
              <p className="pt-1 text-center font-mono text-[10px] text-green-800/50">
                +{result.row_count - 4} more rows
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Corkboard({ entries, latestNarration }: CorkboardProps) {
  const latest = entries[0] ?? null;
  const priorCount = entries.length - 1;

  return (
    <div className="evidence-board relative flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-green-900/20 px-5 py-3">
        <h2 className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-green-400 terminal-glow-subtle">
          Evidence Board
        </h2>
        <p className="mt-0.5 font-mono text-[10px] text-green-800/50">
          latest query · {priorCount > 0 ? `${priorCount} in log` : "awaiting input"}
        </p>
      </div>

      <div className="relative flex-1 overflow-y-auto px-5 py-4">
        <AnimatePresence mode="wait">
          {latestNarration && <NarratorCard key={latestNarration} text={latestNarration} />}
        </AnimatePresence>

        {!latest ? (
          <div className="flex h-40 items-center justify-center">
            <p className="font-mono text-xs text-green-800/35">_ awaiting query results...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <EvidenceCard key={latest.id} entry={latest} />
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
