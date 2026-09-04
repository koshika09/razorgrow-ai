import sqlite3
import json
from pathlib import Path


DB_PATH = Path("backend/data/audit.db")


def get_connection():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(DB_PATH)

    connection.row_factory = sqlite3.Row

    return connection


def initialize_database():
    connection = get_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS audit_actions (
            action_id TEXT PRIMARY KEY,
            action_data TEXT NOT NULL
        )
    """)

    connection.commit()
    connection.close()


def save_action(action):
    connection = get_connection()

    connection.execute("""
        INSERT OR REPLACE INTO audit_actions
        (action_id, action_data)
        VALUES (?, ?)
    """, (
        action["action_id"],
        json.dumps(action)
    ))

    connection.commit()
    connection.close()


def get_actions():
    connection = get_connection()

    rows = connection.execute("""
        SELECT action_data
        FROM audit_actions
    """).fetchall()

    connection.close()

    actions = [
        json.loads(row["action_data"])
        for row in rows
    ]
    return sorted(actions, key=lambda action: action.get("created_at", ""), reverse=True)
