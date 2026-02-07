import sys
from pathlib import Path

# Add /.../cisc594_trivia-game-project/backend to Python path
ROOT = Path(__file__).resolve().parents[1]
BACKEND_DIR = ROOT / "backend"
sys.path.insert(0, str(BACKEND_DIR))

import sqlite3
import pytest
from fastapi.testclient import TestClient

import app as app_module


@pytest.fixture()
def client(tmp_path, monkeypatch):
    """
    Creates a temp users DB and injects it into app_module.DB_NAME.
    Also ensures the users table exists.
    Returns a FastAPI TestClient.
    """
    # 1) Point the app to a temporary database
    test_db = tmp_path / "test_users.db"
    monkeypatch.setattr(app_module, "DB_NAME", str(test_db))

    # 2) Initialize schema in the temp DB
    with sqlite3.connect(str(test_db)) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                                                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                 username TEXT NOT NULL UNIQUE,
                                                 password TEXT NOT NULL,
                                                 wages INTEGER NOT NULL DEFAULT 1000,
                                                 games_played INTEGER NOT NULL DEFAULT 0,
                                                 correct_answers INTEGER NOT NULL DEFAULT 0,
                                                 incorrect_answers INTEGER NOT NULL DEFAULT 0
            )
            """
        )
        # Insert a test user with known wages
        conn.execute(
            "INSERT INTO users (username, password, wages) VALUES (?, ?, ?)",
            ("pooja", "pw", 1000),
        )
        conn.commit()

    return TestClient(app_module.app)


def test_questions_returns_random_question_from_category(client, monkeypatch):
    """
    Unit #1:
    /questions should return a question belonging to the requested category.
    """
    # Inject test questions (avoid relying on trivia_questions.json on disk)
    monkeypatch.setattr(
        app_module,
        "QUESTIONS",
        [
            {"category": "Science", "question": "Q1", "choices": ["A", "B"], "answer": "A"},
            {"category": "Science", "question": "Q2", "choices": ["C", "D"], "answer": "D"},
            {"category": "History", "question": "H1", "choices": ["X", "Y"], "answer": "X"},
        ],
    )

    r = client.get("/questions", params={"category": "Science"})
    assert r.status_code == 200

    body = r.json()
    assert body["category"] == "Science"
    assert body["question"] in {"Q1", "Q2"}
    assert isinstance(body["choices"], list)


@pytest.mark.parametrize(
    "amount, expected_status",
    [
        (500, 200),   # ok when amount <= wages
        (1500, 400),  # error when amount > wages
    ],
)
def test_check_wage_compares_against_db_wages(client, amount, expected_status):
    """
    Unit #2:
    /checkWage should compare passed amount with wages stored in DB for the user.
    Rule tested here (recommended/typical):
      - if amount > wages => error
      - else => ok
    """
    r = client.post(
        "/checkWage",
        params={"username": "pooja"},
        json={"amount": amount},
    )
    assert r.status_code == expected_status