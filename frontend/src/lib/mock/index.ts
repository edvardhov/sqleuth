import type { CaseData, QueryResult, SchemaTable, SolveResult } from "@/lib/types";
import { translateQuestionToSql, TRANSLATE_FALLBACK_SQL } from "@/lib/translateRules";

export const MOCK_CASE: CaseData = {
  title: "The Marlowe File",
  subtitle: "Case #47-118",
  briefing:
    "January 14th, 1947. Violet Marlowe — headliner at The Blue Dahlia — was found dead in her dressing room at 11:47 PM. The door was locked from the inside. Someone in this city knows how she died.\n\nYou've got a badge, a badge attitude, and a SQLite database full of liars. Run SELECT queries. Follow the threads. When you're sure, make your accusation.",
  victim: "Violet Marlowe",
  location: "The Blue Dahlia Nightclub, Los Angeles",
  date: "1947-01-14",
  hints: [
    "Start with the crime scene. What does the report say about the time of death?",
    "Every suspect has an alibi. Read the interviews — liars contradict themselves.",
    "Phone records don't lie. Who was on the line when Violet took her last breath?",
    "Cross-reference hotel check-ins with alibis. Someone wasn't where they said they were.",
    "Join suspects to evidence. The murder weapon tells a story.",
    "When the threads converge on one name, you've got your killer.",
  ],
};

export const MOCK_SCHEMA: SchemaTable[] = [
  {
    table: "suspects",
    columns: [
      { name: "id", type: "INTEGER" },
      { name: "name", type: "TEXT" },
      { name: "occupation", type: "TEXT" },
      { name: "description", type: "TEXT" },
      { name: "mugshot_key", type: "TEXT" },
    ],
  },
  {
    table: "crime_scene_reports",
    columns: [
      { name: "id", type: "INTEGER" },
      { name: "report_date", type: "TEXT" },
      { name: "location", type: "TEXT" },
      { name: "description", type: "TEXT" },
    ],
  },
  {
    table: "interviews",
    columns: [
      { name: "id", type: "INTEGER" },
      { name: "suspect_id", type: "INTEGER" },
      { name: "interview_date", type: "TEXT" },
      { name: "transcript", type: "TEXT" },
    ],
  },
  {
    table: "evidence",
    columns: [
      { name: "id", type: "INTEGER" },
      { name: "item", type: "TEXT" },
      { name: "location_found", type: "TEXT" },
      { name: "notes", type: "TEXT" },
      { name: "suspect_id", type: "INTEGER" },
    ],
  },
  {
    table: "witness_statements",
    columns: [
      { name: "id", type: "INTEGER" },
      { name: "witness_name", type: "TEXT" },
      { name: "statement", type: "TEXT" },
      { name: "incident_time", type: "TEXT" },
    ],
  },
  {
    table: "phone_records",
    columns: [
      { name: "id", type: "INTEGER" },
      { name: "caller_name", type: "TEXT" },
      { name: "recipient_name", type: "TEXT" },
      { name: "call_time", type: "TEXT" },
      { name: "duration_seconds", type: "INTEGER" },
    ],
  },
  {
    table: "hotel_checkins",
    columns: [
      { name: "id", type: "INTEGER" },
      { name: "guest_name", type: "TEXT" },
      { name: "hotel", type: "TEXT" },
      { name: "checkin_time", type: "TEXT" },
      { name: "checkout_time", type: "TEXT" },
    ],
  },
];

const MOCK_SUSPECTS: QueryResult = {
  columns: ["id", "name", "occupation", "description", "mugshot_key"],
  rows: [
    [1, "Eleanor Whitmore", "Pianist", "Played the Blue Dahlia house piano for three years.", "whitmore"],
    [2, "Danny Reyes", "Bartender", "Knows everyone's drink and everyone's secrets.", "reyes"],
    [3, "Frank Malone", "Club Owner", "Built The Blue Dahlia from nothing.", "malone"],
    [4, "Lorraine Pierce", "Chorus Girl", "Ambitious understudy who wanted Violet's spotlight.", "pierce"],
    [5, "Dr. Arthur Vance", "Patron / Physician", "Wealthy regular with a standing table.", "vance"],
    [6, "Tommy Shaw", "Stagehand", "Runs the rigging and the back corridors.", "shaw"],
  ],
  row_count: 6,
};

const MOCK_CRIME_SCENE: QueryResult = {
  columns: ["id", "report_date", "location", "description"],
  rows: [
    [
      1,
      "1947-01-14",
      "The Blue Dahlia — Dressing Room B",
      "Victim: Violet Marlowe. Cause: blunt force trauma. Time of death 11:40-11:50 PM. Monogrammed cufflink found — initials 'F.M.'",
    ],
  ],
  row_count: 1,
};

const MOCK_PHONE: QueryResult = {
  columns: ["id", "caller_name", "recipient_name", "call_time", "duration_seconds"],
  rows: [[1, "Frank Malone", "Violet Marlowe", "1947-01-14 23:42", 187]],
  row_count: 1,
};

const MOCK_EVIDENCE: QueryResult = {
  columns: ["id", "item", "location_found", "notes", "suspect_id"],
  rows: [
    [1, "Monogrammed cufflink (F.M.)", "Dressing Room B", "Gold cufflink with initials F.M.", 3],
    [3, "Torn contract page", "Club Office wastebasket", "Frank's signature visible.", 3],
  ],
  row_count: 2,
};

const MOCK_GENERIC: QueryResult = {
  columns: ["note"],
  rows: [["Demo mode — try: SELECT * FROM suspects; or SELECT * FROM phone_records;"]],
  row_count: 1,
};

const NARRATIONS: Record<string, string> = {
  suspects:
    "Six faces stare back from the files. Club owners, chorus girls, stagehands — each with a story and a reason to lie. The city keeps its secrets close.",
  crime:
    "Violet Marlowe. Blunt force in Dressing Room B. The report doesn't lie — someone left a monogrammed cufflink at the scene. Initials: F.M.",
  victim:
    "There she is — Violet Marlowe, headliner at The Blue Dahlia. Found dead between 11:40 and 11:50 PM. The case starts with her name.",
  phone:
    "11:42 PM. Frank Malone on the line with Violet Marlowe. Three minutes and seven seconds. That's not a business call — that's a conversation with a dead woman.",
  evidence:
    "Gold cufflink. Torn contract. Frank Malone's initials are all over this case like fingerprints on a glass.",
  default:
    "The files give you something, but not everything. In this town, the truth hides between the lines. Keep digging.",
};

function normalizeSql(sql: string): string {
  return sql.trim().toLowerCase().replace(/\s+/g, " ");
}

export function mockExecuteQuery(sql: string): QueryResult {
  const normalized = normalizeSql(sql);

  if (normalized.includes("from suspects") || normalized.includes("from suspect")) {
    return MOCK_SUSPECTS;
  }
  if (normalized.includes("crime_scene") || normalized.includes("like '%victim%'")) {
    return MOCK_CRIME_SCENE;
  }
  if (normalized.includes("phone_record")) {
    return MOCK_PHONE;
  }
  if (normalized.includes("from evidence")) {
    return MOCK_EVIDENCE;
  }
  if (normalized.includes("insert") || normalized.includes("delete") || normalized.includes("drop")) {
    return { columns: [], rows: [], row_count: 0, error: "Only SELECT queries are permitted." };
  }
  if (!normalized.startsWith("select") && !normalized.startsWith("with")) {
    return { columns: [], rows: [], row_count: 0, error: "Only SELECT queries are permitted." };
  }

  return MOCK_GENERIC;
}

export function mockNarrate(query: string): string {
  const normalized = normalizeSql(query);
  if (normalized.includes("victim") || normalized.includes("like '%victim%'")) {
    return NARRATIONS.victim;
  }
  if (normalized.includes("suspect")) return NARRATIONS.suspects;
  if (normalized.includes("crime_scene")) return NARRATIONS.crime;
  if (normalized.includes("phone")) return NARRATIONS.phone;
  if (normalized.includes("evidence")) return NARRATIONS.evidence;
  return NARRATIONS.default;
}

export function mockTranslate(question: string): string {
  return translateQuestionToSql(question) ?? TRANSLATE_FALLBACK_SQL;
}

export function mockSolve(suspectId: number): SolveResult {
  const correct = suspectId === 3;
  return {
    correct,
    killer_name: correct ? "Frank Malone" : null,
    epilogue: correct
      ? "Frank Malone folds like cheap suit lining. The DA has phone records, a monogrammed cufflink, and a witness who saw him leave the service entrance at 11:45. Violet Marlowe gets justice."
      : "Wrong badge, wrong guy. Malone walks. Violet Marlowe becomes another unsolved file in a drawer that never closes.",
  };
}

export function mockGetCase(): CaseData {
  return MOCK_CASE;
}

export function mockGetSchema(): SchemaTable[] {
  return MOCK_SCHEMA;
}
