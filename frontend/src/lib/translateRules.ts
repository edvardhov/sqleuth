/** Rule-based NL → SQL translation. Used by mock mode and as Ollama fallback. */

const RULES: { pattern: RegExp; sql: string }[] = [
  {
    pattern:
      /\b(victim|who (was|is) (the )?(dead|killed|murdered)|who died|who got killed|who was shot|violet marlowe|marlowe)\b/,
    sql: "SELECT report_date, location, description FROM crime_scene_reports WHERE description LIKE '%Victim%';",
  },
  {
    pattern:
      /\b(crime scene|scene report|time of death|cause of death|how (did|was) (she|violet) (die|killed)|dressing room|murder scene)\b/,
    sql: "SELECT * FROM crime_scene_reports;",
  },
  {
    pattern:
      /\b(suspects?|persons of interest|who (are|is) (the )?suspects?|list (all )?suspects?|everyone involved|cast of character)\b/,
    sql: "SELECT id, name, occupation, description FROM suspects;",
  },
  {
    pattern: /\b(phone|call record|who called|phone record|telephone|on the line)\b/,
    sql: "SELECT * FROM phone_records ORDER BY call_time;",
  },
  {
    pattern: /\b(evidence|clue|weapon|cufflink|what was found|forensic)\b/,
    sql: "SELECT * FROM evidence;",
  },
  {
    pattern: /\b(interview|alibi|statement|what did .+ say|transcript)\b/,
    sql: "SELECT s.name, i.transcript FROM interviews i JOIN suspects s ON s.id = i.suspect_id;",
  },
  {
    pattern: /\b(witness|who saw|eyewitness)\b/,
    sql: "SELECT * FROM witness_statements;",
  },
  {
    pattern: /\b(hotel|check.?in|check.?out|where did .+ stay|lodging)\b/,
    sql: "SELECT * FROM hotel_checkins;",
  },
  {
    pattern: /\b(schema|tables|what tables|database structure|case notes)\b/,
    sql: "SELECT name FROM sqlite_master WHERE type='table';",
  },
];

export function translateQuestionToSql(question: string): string | null {
  const lower = question.toLowerCase().trim();
  for (const { pattern, sql } of RULES) {
    if (pattern.test(lower)) return sql;
  }
  return null;
}

export const TRANSLATE_FALLBACK_SQL =
  "SELECT report_date, location, description FROM crime_scene_reports LIMIT 3;";
