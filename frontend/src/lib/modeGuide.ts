export interface ModeGuide {
  label: string;
  badgeClass: "neon-badge-cyan" | "neon-badge-green";
  summary: string;
  canDo: string[];
  notes?: string[];
}

export function getModeGuide(isMock: boolean): ModeGuide {
  if (isMock) {
    return {
      label: "Demo mode",
      badgeClass: "neon-badge-cyan",
      summary:
        "You're playing the browser demo — no backend or install required. The full murder mystery is here; responses are simulated in the page.",
      canDo: [
        "Run SELECT queries in the terminal (Cmd+Enter). Only reads — no INSERT, UPDATE, or DELETE.",
        "Toggle Ask mode to turn plain-English questions into SQL for common investigation prompts.",
        "Pin query results and detective narration on the corkboard as you follow the clues.",
        "Open Case Notes for table columns and starter queries; use the hint ticker when you're stuck.",
        "Accuse a suspect when you're ready — win or lose epilogues included.",
      ],
      notes: [
        "Queries hit built-in mock data, not a live SQLite file.",
        "Ask mode uses keyword rules — try “list suspects”, “phone records”, or “crime scene”.",
        "Narration is canned noir prose keyed to what you queried.",
      ],
    };
  }

  return {
    label: "Full mode",
    badgeClass: "neon-badge-green",
    summary:
      "You're connected to the local FastAPI backend and real SQLite database seeded with the case file.",
    canDo: [
      "Run SELECT queries against the live murder-mystery database (Cmd+Enter).",
      "Toggle Ask mode — common questions map to SQL via rules; open-ended ones can use Ollama when it's running.",
      "Get AI noir narration on the corkboard when Ollama is available; canned fallbacks otherwise.",
      "Browse schema and starter queries in Case Notes; follow the scrolling hints.",
      "Accuse the killer when the evidence lines up.",
    ],
    notes: [
      "Start the stack with docker compose up or run backend + frontend locally.",
      "Optional: ollama pull llama3 && ollama serve for dynamic narration and translation.",
      "Without Ollama, the game still runs — rules and fallback text cover the basics.",
    ],
  };
}
