import sqlite3
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

DB_NAME = "users.db"
app = FastAPI()


# 1) Request body schema (what JSON you expect)
class UserIn(BaseModel):
    username: str
    password: str


# 2) Open DB connection
def get_conn():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


# 3) Create table if it doesn't exist
def init_db():
    with get_conn() as conn:
        conn.execute("""
                     CREATE TABLE IF NOT EXISTS users (
                                                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                          username TEXT NOT NULL UNIQUE,
                                                          password TEXT NOT NULL
                     )
                     """)
        conn.commit()


# Run init once at startup
init_db()


# 4) POST /register
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
        return {"message": "registered"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="username already exists")


# 5) POST /login
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