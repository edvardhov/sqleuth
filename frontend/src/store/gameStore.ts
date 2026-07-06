import { create } from "zustand";

import type { CaseData, QueryHistoryEntry, SchemaTable, SolveResult } from "@/lib/types";

interface GameState {
  caseData: CaseData | null;
  schema: SchemaTable[];
  history: QueryHistoryEntry[];
  currentHintIndex: number;
  showBriefing: boolean;
  showCaseNotes: boolean;
  showAccusation: boolean;
  solveResult: SolveResult | null;
  isLoading: boolean;
  setCaseData: (data: CaseData) => void;
  setSchema: (schema: SchemaTable[]) => void;
  addHistoryEntry: (entry: QueryHistoryEntry) => void;
  nextHint: () => void;
  setShowBriefing: (show: boolean) => void;
  setShowCaseNotes: (show: boolean) => void;
  setShowAccusation: (show: boolean) => void;
  setSolveResult: (result: SolveResult | null) => void;
  setIsLoading: (loading: boolean) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  caseData: null,
  schema: [],
  history: [],
  currentHintIndex: 0,
  showBriefing: true,
  showCaseNotes: false,
  showAccusation: false,
  solveResult: null,
  isLoading: false,
  setCaseData: (data) => set({ caseData: data }),
  setSchema: (schema) => set({ schema }),
  addHistoryEntry: (entry) =>
    set((state) => {
      const normalized = entry.sql.trim().toLowerCase().replace(/\s+/g, " ");
      const filtered = state.history.filter(
        (h) => h.sql.trim().toLowerCase().replace(/\s+/g, " ") !== normalized,
      );
      return { history: [entry, ...filtered].slice(0, 12) };
    }),
  nextHint: () =>
    set((state) => {
      const max = state.caseData?.hints.length ?? 1;
      return { currentHintIndex: Math.min(state.currentHintIndex + 1, max - 1) };
    }),
  setShowBriefing: (show) => set({ showBriefing: show }),
  setShowCaseNotes: (show) => set({ showCaseNotes: show }),
  setShowAccusation: (show) => set({ showAccusation: show }),
  setSolveResult: (result) => set({ solveResult: result }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  resetGame: () =>
    set({
      history: [],
      currentHintIndex: 0,
      showBriefing: true,
      showCaseNotes: false,
      showAccusation: false,
      solveResult: null,
    }),
}));
