"""Rule-based NL → SQL translation. Used before/after Ollama."""

from __future__ import annotations

import re

RULES: list[tuple[re.Pattern[str], str]] = [
    (
        re.compile(
            r"\b(victim|who (was|is) (the )?(dead|killed|murdered)|who died|who got killed|"
            r"who was shot|violet marlowe|marlowe)\b",
            re.I,
        ),
        "SELECT report_date, location, description FROM crime_scene_reports "
        "WHERE description LIKE '%Victim%';",
    ),
    (
        re.compile(
            r"\b(crime scene|scene report|time of death|cause of death|"
            r"how (did|was) (she|violet) (die|killed)|dressing room|murder scene)\b",
            re.I,
        ),
        "SELECT * FROM crime_scene_reports;",
    ),
    (
        re.compile(
            r"\b(suspects?|persons of interest|who (are|is) (the )?suspects?|"
            r"list (all )?suspects?|everyone involved|cast of character)\b",
            re.I,
        ),
        "SELECT id, name, occupation, description FROM suspects;",
    ),
    (
        re.compile(r"\b(phone|call record|who called|phone record|telephone|on the line)\b", re.I),
        "SELECT * FROM phone_records ORDER BY call_time;",
    ),
    (
        re.compile(r"\b(evidence|clue|weapon|cufflink|what was found|forensic)\b", re.I),
        "SELECT * FROM evidence;",
    ),
    (
        re.compile(r"\b(interview|alibi|statement|what did .+ say|transcript)\b", re.I),
        "SELECT s.name, i.transcript FROM interviews i JOIN suspects s ON s.id = i.suspect_id;",
    ),
    (
        re.compile(r"\b(witness|who saw|eyewitness)\b", re.I),
        "SELECT * FROM witness_statements;",
    ),
    (
        re.compile(r"\b(hotel|check.?in|check.?out|where did .+ stay|lodging)\b", re.I),
        "SELECT * FROM hotel_checkins;",
    ),
]

TRANSLATE_FALLBACK_SQL = (
    "SELECT report_date, location, description FROM crime_scene_reports LIMIT 3;"
)


def translate_question_to_sql(question: str) -> str | None:
    for pattern, sql in RULES:
        if pattern.search(question):
            return sql
    return None
