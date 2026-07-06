"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FaTerminal, FaUserSecret } from "react-icons/fa6";

import { executeQuery, narrateQuery, translateQuestion } from "@/lib/api";
import { formatSchemaForTerminal } from "@/lib/schemaGuide";
import type { QueryHistoryEntry } from "@/lib/types";
import { useGameStore } from "@/store/gameStore";

interface TerminalProps {
  onQueryComplete: (entry: QueryHistoryEntry) => void;
}

export default function Terminal({ onQueryComplete }: TerminalProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string[]>([
    "SQLeuth Terminal v1.0 — Los Angeles Police Database",
    "Type SELECT queries only. Cmd+Enter to execute.",
    "─────────────────────────────────────────────",
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [translateMode, setTranslateMode] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const schemaPrinted = useRef(false);
  const schema = useGameStore((s) => s.schema);
  const setIsLoading = useGameStore((s) => s.setIsLoading);

  useEffect(() => {
    if (schema.length > 0 && !schemaPrinted.current) {
      schemaPrinted.current = true;
      setOutput((prev) => [...prev, ...formatSchemaForTerminal(schema)]);
    }
  }, [schema]);

  const appendOutput = useCallback((lines: string[]) => {
    setOutput((prev) => [...prev, ...lines]);
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const runQuery = useCallback(
    async (sql: string) => {
      if (isRunning || !sql.trim()) return;
      setIsRunning(true);
      setIsLoading(true);

      appendOutput([`> ${sql}`, "Executing..."]);

      try {
        let queryToRun = sql;
        if (translateMode) {
          appendOutput([`[Chief] Translating: "${sql}"`]);
          queryToRun = await translateQuestion(sql);
          appendOutput([`[Chief] Suggested SQL: ${queryToRun}`]);
          setInput(queryToRun);
          setTranslateMode(false);
        }

        const result = await executeQuery(queryToRun);

        if (result.error) {
          appendOutput([`ERROR: ${result.error}`]);
        } else {
          const header = result.columns.join(" | ");
          appendOutput([
            header,
            "─".repeat(Math.min(header.length, 60)),
            ...result.rows.slice(0, 10).map((row) => row.map(String).join(" | ")),
            result.truncated ? `... truncated (${result.row_count} rows total)` : `${result.row_count} row(s)`,
          ]);

          const narration = await narrateQuery(queryToRun, result.columns, result.rows);
          const entry: QueryHistoryEntry = {
            id: crypto.randomUUID(),
            sql: queryToRun,
            result,
            narration,
            timestamp: Date.now(),
          };
          onQueryComplete(entry);
        }

        setHistory((prev) => {
          if (prev[0] === queryToRun) return prev;
          return [queryToRun, ...prev].slice(0, 50);
        });
        setHistoryIndex(-1);
      } catch {
        appendOutput(["ERROR: Failed to reach the database. Is the backend running?"]);
      } finally {
        setIsRunning(false);
        setIsLoading(false);
      }
    },
    [appendOutput, isRunning, onQueryComplete, setIsLoading, translateMode],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      runQuery(input);
      return;
    }

    if (e.key === "ArrowUp" && !e.shiftKey) {
      e.preventDefault();
      const nextIndex = Math.min(historyIndex + 1, history.length - 1);
      if (nextIndex >= 0) {
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      }
    }

    if (e.key === "ArrowDown" && !e.shiftKey) {
      e.preventDefault();
      const nextIndex = historyIndex - 1;
      if (nextIndex >= 0) {
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      } else {
        setHistoryIndex(-1);
        setInput("");
      }
    }
  };

  const handleToggleTranslate = () => {
    setTranslateMode((m) => !m);
    setInput("");
    setHistoryIndex(-1);
  };

  const isEmpty = input.trim().length === 0;
  const placeholder = translateMode
    ? "Who is the victim?"
    : "SELECT * FROM suspects;";

  return (
    <div className="crt-screen flex h-full flex-col font-mono text-sm">
      <div className="flex items-center justify-between border-b border-green-900/50 px-4 py-2">
        <div className="flex items-center gap-2 terminal-glow text-green-400">
          <FaTerminal />
          <span className="text-xs tracking-widest uppercase">Case Terminal</span>
        </div>
        <button
          type="button"
          onClick={handleToggleTranslate}
          className={`flex items-center gap-1.5 rounded px-2 py-1 font-mono text-[11px] transition-all ${
            translateMode
              ? "neon-badge-cyan border border-[rgba(0,255,200,0.35)] bg-[rgba(0,255,200,0.06)] text-[#00ffc8]"
              : "text-green-700/60 hover:text-green-400"
          }`}
        >
          <FaUserSecret />
          {translateMode ? "Chief Mode ON" : "Ask the Chief"}
        </button>
      </div>

      <div ref={outputRef} className="flex-1 overflow-y-auto p-4 text-green-400/90 terminal-glow">
        {output.map((line, i) => (
          <div key={`${i}-${line.slice(0, 20)}`} className="whitespace-pre-wrap leading-relaxed">
            {line}
          </div>
        ))}
        {isRunning && <span className="cursor-blink text-green-400">▊</span>}
      </div>

      <div className="terminal-input-area border-t border-green-900/40 p-3">
        {/* Mode label */}
        <div className="mb-2 flex items-center gap-2">
          <span className={`neon-badge ${translateMode ? "neon-badge-cyan" : "neon-badge-green"}`}>
            {translateMode ? "Ask" : "SQL"}
          </span>
          <span className="font-mono text-[10px] text-green-700/55">
            {translateMode ? "plain english → sql" : "select queries only"}
          </span>
        </div>

        <div className="relative">
          {isEmpty && (
            <div
              className="pointer-events-none absolute inset-0 px-3 py-2 font-mono text-sm leading-relaxed"
              aria-hidden
            >
              <span
                className={
                  translateMode ? "text-[#00ffc8]/40 italic" : "text-green-600/40"
                }
              >
                {placeholder}
              </span>
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            spellCheck={false}
            className={`terminal-textarea w-full resize-none rounded border bg-black/40 px-3 py-2 font-mono text-sm leading-relaxed outline-none ${
              translateMode
                ? "border-[rgba(0,255,200,0.2)] text-[#a0fff0] focus:border-[rgba(0,255,200,0.45)]"
                : "border-green-900/35 text-green-300 focus:border-green-600/45"
            }`}
          />
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="font-mono text-[10px] text-green-800/45">
            Cmd+Enter to run · ↑↓ history
          </span>
          <button
            type="button"
            onClick={() => runQuery(input)}
            disabled={isRunning || isEmpty}
            className={`neon-btn px-3 py-1 disabled:opacity-30 ${
              translateMode ? "neon-btn-cyan" : "neon-btn-green"
            }`}
          >
            {translateMode ? "Translate" : "Execute"}
          </button>
        </div>
      </div>
    </div>
  );
}
