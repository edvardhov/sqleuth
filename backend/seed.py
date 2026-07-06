"""Generate the SQLeuth murder mystery SQLite database."""

from __future__ import annotations

import json
import sqlite3
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent / "data"
DB_PATH = DATA_DIR / "sqleuth.db"


def create_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        DROP TABLE IF EXISTS hotel_checkins;
        DROP TABLE IF EXISTS phone_records;
        DROP TABLE IF EXISTS witness_statements;
        DROP TABLE IF EXISTS evidence;
        DROP TABLE IF EXISTS interviews;
        DROP TABLE IF EXISTS crime_scene_reports;
        DROP TABLE IF EXISTS suspects;

        CREATE TABLE suspects (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            occupation TEXT NOT NULL,
            description TEXT NOT NULL,
            mugshot_key TEXT NOT NULL
        );

        CREATE TABLE crime_scene_reports (
            id INTEGER PRIMARY KEY,
            report_date TEXT NOT NULL,
            location TEXT NOT NULL,
            description TEXT NOT NULL
        );

        CREATE TABLE interviews (
            id INTEGER PRIMARY KEY,
            suspect_id INTEGER NOT NULL,
            interview_date TEXT NOT NULL,
            transcript TEXT NOT NULL,
            FOREIGN KEY (suspect_id) REFERENCES suspects(id)
        );

        CREATE TABLE evidence (
            id INTEGER PRIMARY KEY,
            item TEXT NOT NULL,
            location_found TEXT NOT NULL,
            notes TEXT NOT NULL,
            suspect_id INTEGER,
            FOREIGN KEY (suspect_id) REFERENCES suspects(id)
        );

        CREATE TABLE witness_statements (
            id INTEGER PRIMARY KEY,
            witness_name TEXT NOT NULL,
            statement TEXT NOT NULL,
            incident_time TEXT NOT NULL
        );

        CREATE TABLE phone_records (
            id INTEGER PRIMARY KEY,
            caller_name TEXT NOT NULL,
            recipient_name TEXT NOT NULL,
            call_time TEXT NOT NULL,
            duration_seconds INTEGER NOT NULL
        );

        CREATE TABLE hotel_checkins (
            id INTEGER PRIMARY KEY,
            guest_name TEXT NOT NULL,
            hotel TEXT NOT NULL,
            checkin_time TEXT NOT NULL,
            checkout_time TEXT
        );
        """
    )


def seed_data(conn: sqlite3.Connection) -> None:
    suspects = [
        (
            1,
            "Eleanor Whitmore",
            "Pianist",
            "Played the Blue Dahlia house piano for three years. Quiet, precise, keeps to herself.",
            "whitmore",
        ),
        (
            2,
            "Danny Reyes",
            "Bartender",
            "Knows everyone's drink and everyone's secrets. Quick wit, quicker hands.",
            "reyes",
        ),
        (
            3,
            "Frank Malone",
            "Club Owner",
            "Built The Blue Dahlia from nothing. Violet was his star — and his problem.",
            "malone",
        ),
        (
            4,
            "Lorraine Pierce",
            "Chorus Girl",
            "Ambitious understudy who wanted Violet's spotlight. Jealousy wears perfume.",
            "pierce",
        ),
        (
            5,
            "Dr. Arthur Vance",
            "Patron / Physician",
            "Wealthy regular with a standing table. Violet confided in him about threats.",
            "vance",
        ),
        (
            6,
            "Tommy Shaw",
            "Stagehand",
            "Runs the rigging and the back corridors. Saw things he shouldn't have.",
            "shaw",
        ),
    ]
    conn.executemany(
        "INSERT INTO suspects (id, name, occupation, description, mugshot_key) VALUES (?, ?, ?, ?, ?)",
        suspects,
    )

    crime_scenes = [
        (
            1,
            "1947-01-14",
            "The Blue Dahlia — Dressing Room B",
            "Victim: Violet Marlowe. Cause: blunt force trauma to the back of the skull. "
            "Time of death estimated between 11:40 PM and 11:50 PM. Door locked from inside; "
            "possible exit via service corridor window (12-inch opening). "
            "Monogrammed cufflink found near body — initials 'F.M.'",
        ),
        (
            2,
            "1947-01-14",
            "The Blue Dahlia — Main Stage",
            "Stage lights still warm. Violet's final set ended at 11:15 PM. "
            "Applause recorded until 11:18. No signs of struggle on stage.",
        ),
        (
            3,
            "1947-01-15",
            "The Blue Dahlia — Service Corridor",
            "Fresh scuff marks on the corridor floor leading to the alley exit. "
            "Muddy shoe print, men's size 11, consistent with club owner's office footwear.",
        ),
    ]
    conn.executemany(
        "INSERT INTO crime_scene_reports (id, report_date, location, description) VALUES (?, ?, ?, ?)",
        crime_scenes,
    )

    interviews = [
        (
            1,
            1,
            "1947-01-15",
            "I was at the piano until midnight. The whole band can confirm. "
            "I never left the stage area. Violet and I were civil — professional.",
        ),
        (
            2,
            2,
            "1947-01-15",
            "I was behind the bar all night. Poured Frank Malone a bourbon at 11:30 — "
            "he was in his office, not the dressing room. I don't serve liars, but he pays well.",
        ),
        (
            3,
            3,
            "1947-01-15",
            "I was on a business call from 11:00 to midnight in my office. "
            "My secretary can verify. Violet was family to this club. I'd never hurt her.",
        ),
        (
            4,
            4,
            "1947-01-15",
            "I was in the chorus room rehearsing until 11:45. "
            "Ask Eleanor — she heard me singing scales. I wanted her job, not her death.",
        ),
        (
            5,
            5,
            "1947-01-15",
            "I left at 10:30 PM — early surgery at St. Vincent's. "
            "Violet told me Frank had been threatening her about her contract. "
            "She was planning to leave the club.",
        ),
        (
            6,
            6,
            "1947-01-15",
            "I was fixing a light rig in the alley at 11:35. "
            "Saw a man in a dark suit leave the service corridor — looked like the boss. "
            "Couldn't swear to it in court, but I know what I saw.",
        ),
    ]
    conn.executemany(
        "INSERT INTO interviews (id, suspect_id, interview_date, transcript) VALUES (?, ?, ?, ?)",
        interviews,
    )

    evidence = [
        (
            1,
            "Monogrammed cufflink (F.M.)",
            "Dressing Room B",
            "Gold cufflink with initials F.M. Found inches from the victim's hand.",
            3,
        ),
        (
            2,
            "Broken perfume bottle",
            "Dressing Room B",
            "Shattered glass with traces of Lorraine's signature scent — 'Midnight Jasmine'.",
            4,
        ),
        (
            3,
            "Torn contract page",
            "Club Office wastebasket",
            "Partial page of Violet's exit contract. Frank's signature visible. Dated Jan 13.",
            3,
        ),
        (
            4,
            "Stagehand wrench",
            "Service Corridor",
            "Heavy wrench with blood trace. Belongs to club maintenance kit.",
            None,
        ),
        (
            5,
            "Handwritten note",
            "Victim's purse",
            "'If anything happens to me, check who called at 11:42. — V.M.'",
            None,
        ),
    ]
    conn.executemany(
        "INSERT INTO evidence (id, item, location_found, notes, suspect_id) VALUES (?, ?, ?, ?, ?)",
        evidence,
    )

    witnesses = [
        (
            1,
            "Ida Sullivan",
            "I clean the dressing rooms. At 11:43 I heard a man's voice arguing with Violet. "
            "Deep voice. Couldn't make out words through the door.",
            "1947-01-14 23:43",
        ),
        (
            2,
            "Officer Pete Kowalski",
            "Responded at 11:52 PM. Door was locked. Window in dressing room was ajar. "
            "Fresh scratches on the sill suggest someone climbed out.",
            "1947-01-14 23:52",
        ),
        (
            3,
            "Jimmy the Doorman",
            "Frank Malone asked me not to mention he used the service exit around 11:45. "
            "Said he 'didn't want to worry anyone.' I should've talked sooner.",
            "1947-01-15 08:00",
        ),
    ]
    conn.executemany(
        "INSERT INTO witness_statements (id, witness_name, statement, incident_time) VALUES (?, ?, ?, ?)",
        witnesses,
    )

    phone_records = [
        (1, "Frank Malone", "Violet Marlowe", "1947-01-14 23:42", 187),
        (2, "Dr. Arthur Vance", "St. Vincent Hospital", "1947-01-14 22:15", 420),
        (3, "Lorraine Pierce", "Eleanor Whitmore", "1947-01-14 23:30", 95),
        (4, "Danny Reyes", "Off-duty contact", "1947-01-14 23:50", 60),
        (5, "Frank Malone", "Unknown number", "1947-01-14 23:55", 45),
    ]
    conn.executemany(
        "INSERT INTO phone_records (id, caller_name, recipient_name, call_time, duration_seconds) VALUES (?, ?, ?, ?, ?)",
        phone_records,
    )

    hotel_checkins = [
        (1, "Dr. Arthur Vance", "St. Vincent Staff Quarters", "1947-01-14 22:30", "1947-01-15 06:00"),
        (2, "Frank Malone", "The Ambassador Hotel", "1947-01-13 23:00", "1947-01-14 07:00"),
        (3, "Eleanor Whitmore", "The Figueroa Rooming House", "1947-01-14 00:00", None),
        (4, "Lorraine Pierce", "The Figueroa Rooming House", "1947-01-14 00:00", None),
    ]
    conn.executemany(
        "INSERT INTO hotel_checkins (id, guest_name, hotel, checkin_time, checkout_time) VALUES (?, ?, ?, ?, ?)",
        hotel_checkins,
    )


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if DB_PATH.exists():
        DB_PATH.unlink()

    conn = sqlite3.connect(DB_PATH)
    try:
        create_schema(conn)
        seed_data(conn)
        conn.commit()
        print(f"Seeded database at {DB_PATH}")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
