import {
  mockExecuteQuery,
  mockGetCase,
  mockGetSchema,
  mockNarrate,
  mockSolve,
  mockTranslate,
} from "./mock";
import type { CaseData, QueryResult, SchemaTable, SolveResult } from "./types";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function executeQuery(sql: string): Promise<QueryResult> {
  if (USE_MOCK) {
    await delay(300);
    return mockExecuteQuery(sql);
  }
  return fetchJson<QueryResult>("/api/query", {
    method: "POST",
    body: JSON.stringify({ sql }),
  });
}

export async function narrateQuery(
  query: string,
  columns: string[],
  rows: (string | number | null)[][],
): Promise<string> {
  if (USE_MOCK) {
    await delay(400);
    return mockNarrate(query);
  }
  const result = await fetchJson<{ narration: string }>("/api/narrate", {
    method: "POST",
    body: JSON.stringify({ query, columns, rows }),
  });
  return result.narration;
}

export async function translateQuestion(question: string): Promise<string> {
  if (USE_MOCK) {
    await delay(350);
    return mockTranslate(question);
  }
  const result = await fetchJson<{ sql: string }>("/api/translate", {
    method: "POST",
    body: JSON.stringify({ question }),
  });
  return result.sql;
}

export async function getCase(): Promise<CaseData> {
  if (USE_MOCK) return mockGetCase();
  return fetchJson<CaseData>("/api/case");
}

export async function getSchema(): Promise<SchemaTable[]> {
  if (USE_MOCK) return mockGetSchema();
  return fetchJson<SchemaTable[]>("/api/schema");
}

export async function solveCase(suspectId: number): Promise<SolveResult> {
  if (USE_MOCK) {
    await delay(200);
    return mockSolve(suspectId);
  }
  return fetchJson<SolveResult>("/api/solve", {
    method: "POST",
    body: JSON.stringify({ suspect_id: suspectId }),
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isMockMode(): boolean {
  return USE_MOCK;
}
