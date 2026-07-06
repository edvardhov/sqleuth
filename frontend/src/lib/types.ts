export interface QueryResult {
  columns: string[];
  rows: (string | number | null)[][];
  row_count: number;
  truncated?: boolean;
  error?: string | null;
}

export interface CaseData {
  title: string;
  subtitle: string;
  briefing: string;
  victim: string;
  location: string;
  date: string;
  hints: string[];
}

export interface SchemaTable {
  table: string;
  columns: { name: string; type: string }[];
}

export interface Suspect {
  id: number;
  name: string;
  occupation: string;
  description: string;
  mugshot_key: string;
}

export interface QueryHistoryEntry {
  id: string;
  sql: string;
  result: QueryResult;
  narration: string;
  timestamp: number;
}

export interface SolveResult {
  correct: boolean;
  epilogue: string;
  killer_name?: string | null;
}
