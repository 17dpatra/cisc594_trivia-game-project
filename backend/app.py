import json
import random
import sqlite3
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel

DB_NAME = "users.db"
QUESTIONS_JSON_PATH = Path(__file__).resolve().parent / "trivia_questions.json"

app = FastAPI()

# -----------------------
# 1) Request body schema
# -----------------------
class UserIn(BaseModel):
    username: str
    password: str


class WagesDelta(BaseModel):
    delta: int  # can be + or -


class AmountCheck(BaseModel):
    amount: int


# -----------------------
# 2) Open DB connection
# -----------------------
def get_conn():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


# -----------------------
# 3) Create table if it doesn't exist
# -----------------------
def init_db():
    with get_conn() as conn:
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
        conn.commit()


init_db()


def require_user(username: str) -> sqlite3.Row:
    username = (username or "").strip()
    if not username:
        raise HTTPException(status_code=400, detail="username is required")

    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM users WHERE username = ?",
            (username,),
        ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="user not found (register first)")
    return row


# -----------------------
# Trivia Questions Loader (JSON)
# -----------------------
def load_questions_from_json() -> list[dict]:
    if not QUESTIONS_JSON_PATH.exists():
        raise HTTPException(
            status_code=500,
            detail=f"Questions file not found at {QUESTIONS_JSON_PATH}",
        )

    try:
        data = json.loads(QUESTIONS_JSON_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid JSON in questions file")

    if not isinstance(data, list):
        raise HTTPException(status_code=500, detail="Questions JSON must be a list")

    cleaned = []
    for q in data:
        if not isinstance(q, dict):
            continue

        category = (q.get("category") or "").strip()
        question = (q.get("question") or "").strip()
        choices = q.get("choices")
        answer = q.get("answer")

        if not category or not question:
            continue
        if not isinstance(choices, list):
            choices = []

        cleaned.append(
            {
                "category": category,
                "question": question,
                "choices": choices,
                "answer": answer,
            }
        )

    if not cleaned:
        raise HTTPException(status_code=500, detail="No valid questions found in JSON")

    return cleaned


QUESTIONS = load_questions_from_json()


def get_random_question(category: str) -> dict:
    category = (category or "").strip()
    if not category:
        raise HTTPException(status_code=400, detail="category parameter is required")

    matches = [q for q in QUESTIONS if q.get("category") == category]
    if not matches:
        raise HTTPException(status_code=404, detail="No questions found for this category")

    return random.choice(matches)


# -----------------------
# 4) POST /register
# -----------------------
@app.post("/register", status_code=201)
def register(user: UserIn):
    username = user.username.strip()
    password = user.password.strip()

    if not username or not password:
        raise HTTPException(status_code=400, detail="username and password are required")

    try:
        with get_conn() as conn:
            conn.execute(
                "INSERT INTO users (username, password) VALUES (?, ?)",
                (username, password),
            )
            conn.commit()
        return {"message": "registered", "username": username}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="username already exists")


# -----------------------
# 5) POST /login
# -----------------------
@app.post("/login")
def login(user: UserIn):
    username = user.username.strip()
    password = user.password.strip()

    if not username or not password:
        raise HTTPException(status_code=400, detail="username and password are required")

    with get_conn() as conn:
        row = conn.execute(
            "SELECT id, username FROM users WHERE username = ? AND password = ?",
            (username, password),
        ).fetchone()

    if not row:
        raise HTTPException(status_code=401, detail="invalid credentials")

    return {"message": "login ok", "user": {"id": row["id"], "username": row["username"]}}


# -----------------------
# User Stats Endpoints
# -----------------------
@app.get("/wages")
def get_wages(username: str = Query(...)):
    row = require_user(username)
    return {"username": row["username"], "wages": row["wages"]}


@app.put("/wages")
def update_wages(body: WagesDelta, username: str = Query(...)):
    require_user(username)

    with get_conn() as conn:
        conn.execute(
            "UPDATE users SET wages = wages + ? WHERE username = ?",
            (body.delta, username.strip()),
        )
        conn.commit()

        row = conn.execute(
            "SELECT wages FROM users WHERE username = ?",
            (username.strip(),),
        ).fetchone()

    return {"username": username.strip(), "wages": row["wages"], "delta_applied": body.delta}


@app.get("/gamesPlayed")
def get_games_played(username: str = Query(...)):
    row = require_user(username)
    return {"username": row["username"], "gamesPlayed": row["games_played"]}


@app.put("/gamesPlayed")
def inc_games_played(username: str = Query(...)):
    require_user(username)

    with get_conn() as conn:
        conn.execute(
            "UPDATE users SET games_played = games_played + 1 WHERE username = ?",
            (username.strip(),),
        )
        conn.commit()

        row = conn.execute(
            "SELECT games_played FROM users WHERE username = ?",
            (username.strip(),),
        ).fetchone()

    return {"username": username.strip(), "gamesPlayed": row["games_played"]}


@app.get("/correctAnswers")
def get_correct_answers(username: str = Query(...)):
    row = require_user(username)
    return {"username": row["username"], "correctAnswers": row["correct_answers"]}


@app.put("/correctAnswers")
def inc_correct_answers(username: str = Query(...)):
    require_user(username)

    with get_conn() as conn:
        conn.execute(
            "UPDATE users SET correct_answers = correct_answers + 1 WHERE username = ?",
            (username.strip(),),
        )
        conn.commit()

        row = conn.execute(
            "SELECT correct_answers FROM users WHERE username = ?",
            (username.strip(),),
        ).fetchone()

    return {"username": username.strip(), "correctAnswers": row["correct_answers"]}


@app.get("/incorrectAnswers")
def get_incorrect_answers(username: str = Query(...)):
    row = require_user(username)
    return {"username": row["username"], "incorrectAnswers": row["incorrect_answers"]}


@app.put("/incorrectAnswers")
def inc_incorrect_answers(username: str = Query(...)):
    require_user(username)

    with get_conn() as conn:
        conn.execute(
            "UPDATE users SET incorrect_answers = incorrect_answers + 1 WHERE username = ?",
            (username.strip(),),
        )
        conn.commit()

        row = conn.execute(
            "SELECT incorrect_answers FROM users WHERE username = ?",
            (username.strip(),),
        ).fetchone()

    return {"username": username.strip(), "incorrectAnswers": row["incorrect_answers"]}


# -----------------------
# Trivia Endpoints
# -----------------------
@app.get("/questions")
def get_question(category: str = Query(...)):
    return get_random_question(category)


@app.get("/category")
def get_question_by_category(category: str = Query(...)):
    return get_random_question(category)


# -----------------------
# Check Wage Endpoint
# -----------------------
@app.post("/checkWage")
def check_wage(body: AmountCheck, username: str = Query(...)):
    row = require_user(username)

    wages = row["wages"]
    amount = body.amount

    # Your rule: if amount < wages -> error, else ok
    # (If you actually meant "amount > wages -> error", flip this condition.)
    if amount > wages:
        raise HTTPException(
            status_code=400,
            detail={
                "status": "error",
                "message": "Amount is less than wages",
                "wages": wages,
                "requested": amount,
            },
        )

    return {
        "status": "ok",
        "wages": wages,
        "requested": amount,
    }