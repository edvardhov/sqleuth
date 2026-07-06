"use client";

import { useCallback, useEffect, useState } from "react";

import AccusationModal from "@/components/AccusationModal";
import CaseBriefing from "@/components/CaseBriefing";
import CaseNotes from "@/components/CaseNotes";
import Corkboard from "@/components/Corkboard";
import GameHeader, { ResultOverlay } from "@/components/GameHeader";
import Terminal from "@/components/Terminal";
import { getCase, getSchema } from "@/lib/api";
import type { QueryHistoryEntry } from "@/lib/types";
import { useGameStore } from "@/store/gameStore";

export default function Home() {
  const {
    caseData,
    schema,
    history,
    showBriefing,
    showCaseNotes,
    showAccusation,
    solveResult,
    setCaseData,
    setSchema,
    addHistoryEntry,
    setShowBriefing,
    setShowCaseNotes,
    setShowAccusation,
    setSolveResult,
    resetGame,
  } = useGameStore();

  const [latestNarration, setLatestNarration] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getCase(), getSchema()]).then(([caseResult, schemaResult]) => {
      setCaseData(caseResult);
      setSchema(schemaResult);
    });
  }, [setCaseData, setSchema]);

  const handleQueryComplete = useCallback(
    (entry: QueryHistoryEntry) => {
      addHistoryEntry(entry);
      setLatestNarration(entry.narration);
    },
    [addHistoryEntry],
  );

  return (
    <div className="flex h-screen flex-col">
      <GameHeader />

      <div className="flex flex-1 overflow-hidden">
        <div className="panel-divider w-full md:w-1/2 lg:w-[45%]">
          <Terminal onQueryComplete={handleQueryComplete} />
        </div>
        <div className="hidden flex-1 md:block">
          <Corkboard entries={history} latestNarration={latestNarration} />
        </div>
      </div>

      {showBriefing && caseData && (
        <CaseBriefing
          caseData={caseData}
          schema={schema}
          onClose={() => setShowBriefing(false)}
          onOpenNotes={() => {
            setShowBriefing(false);
            setShowCaseNotes(true);
          }}
        />
      )}

      {showCaseNotes && schema.length > 0 && (
        <CaseNotes schema={schema} onClose={() => setShowCaseNotes(false)} />
      )}

      {showAccusation && (
        <AccusationModal
          onClose={() => setShowAccusation(false)}
          onResult={(result) => {
            setShowAccusation(false);
            setSolveResult(result);
          }}
        />
      )}

      {solveResult && (
        <ResultOverlay
          correct={solveResult.correct}
          epilogue={solveResult.epilogue}
          killerName={solveResult.killer_name}
          onClose={() => setSolveResult(null)}
          onRestart={() => {
            resetGame();
            setLatestNarration(null);
          }}
        />
      )}
    </div>
  );
}
