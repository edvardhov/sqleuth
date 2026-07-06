import type { SchemaTable } from "./types";

/** Plain-language guide for each investigation table. */
export const TABLE_GUIDE: Record<string, string> = {
  suspects:
    "Persons of interest in the case — names, occupations, and background notes.",
  crime_scene_reports:
    "Official police reports from the crime scene — time of death, location, findings.",
  interviews:
    "Interrogation transcripts and alibi statements from each suspect.",
  evidence:
    "Physical evidence collected — items found, where, and forensic notes.",
  witness_statements:
    "Eyewitness accounts — who saw or heard what, and when.",
  phone_records:
    "Telephone logs — who called whom around the time of the murder.",
  hotel_checkins:
    "Hotel guest registers — who checked in where, and when. Cross-check alibis.",
};

export function formatSchemaForTerminal(schema: SchemaTable[]): string[] {
  const lines = [
    "",
    "── CASE DATABASE ─────────────────────────────",
    `${schema.length} tables available. Start anywhere — follow the clues.`,
    "",
  ];

  for (const { table, columns } of schema) {
    const guide = TABLE_GUIDE[table] ?? "Investigation data.";
    const cols = columns.map((c) => c.name).join(", ");
    lines.push(`  ${table}`);
    lines.push(`    ${guide}`);
    lines.push(`    columns: ${cols}`);
    lines.push("");
  }

  lines.push("Try: SELECT * FROM crime_scene_reports;");
  lines.push("─────────────────────────────────────────────");
  return lines;
}
