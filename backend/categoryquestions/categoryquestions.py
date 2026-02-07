from flask import Flask, request, jsonify
import sqlite3
import json

app = Flask(__name__)
DB_NAME = "trivia.db"

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

#  GET /category?category=Science

@app.route("/category", methods=["GET"])
def get_questions_by_category():
    category = request.args.get("category")

    if not category:
        return jsonify({"error": "category parameter is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT category, question, choices, answer FROM trivia WHERE category = ?",
        (category,)
    )

    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return jsonify([]), 200

    response = []
    for row in rows:
        response.append({
            "category": row["category"],
            "question": row["question"],
            "choices": json.loads(row["choices"]),
            "answer": row["answer"]
        })

    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True)
