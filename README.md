# cisc594_trivia-game-project

Trivia Game Server – React (Frontend) & FastAPI (Backend)
Overview:
The project implements both frontend & backend server for client-server trivia game system using React, FastAPI, SQLite. The server manages user accounts, game statistics, and trivia questions.
Trivia questions are loaded from Json File and user data persisted using SQLite.
The server exposes a Restful API that allows clients to:
• Register and authenticate users
• Retrieve trivia questions by category
• Manage user wages (points)
• Track gameplay statistics such as games played and answer accuracy
The server acts as the authoritative source of truth for the trivia game.
Technology Stack:
React (Frontend Framework)
Python 3 FastAPI – Rest api framework
SQLite – user data

Data Storage Design
User Data (SQLite)
User information is stored in users.db with the following fields:
• username (unique)
• password
• wages (points)
• games played
• correct answers
• incorrect answers
The database table is automatically created when the server starts.

Trivia Questions (JSON)
Trivia questions are loaded from trivia_questions.json at startup.
Example format:
[
{
"category": "Science",
"question": "What is the chemical symbol for gold?",
"choices": ["Gd", "Ag", "Au", "Pt"],
"answer": "Au"
}
]

Setup Instructions:
For Frontend:
* cd /frontend
* npm install
* npm start


For Backend:
1. Install Dependencies
   * pip install python
   * pip install fastapi uvicorn
2. Run the Server
   cd /backend
   python3 -m uvicorn app:app --reload --port 8000
   Error Handling
   • Missing or invalid parameters return appropriate HTTP error codes
   • Duplicate usernames are prevented
   • Invalid categories or missing users return descriptive error messages
   • Malformed JSON input is safely handled

Design Rationale
• FastAPI ensures clear API contracts and automatic validation
• JSON-based trivia storage simplifies editing and portability
• SQLite provides lightweight persistent storage for user data
• Clear separation between trivia data and user state
• Easily extensible to authentication tokens, difficulty levels, or databases
Application Flow

1. User Authentication
   o Users can register or login.
   o Username and password are validated with the backend.
2. Select Trivia Category
   o Users choose a category.
   o Frontend sends GET /category?category=<CATEGORY> to the backend.
3. Play Trivia
   o Backend responds with a random question and answer choices.
   o Users select an answer and optionally place a wager.
   o The frontend can use endpoints like /checkWage, /wages, /correctAnswers, and /incorrectAnswers to update points and track statistics.
4. View User Statistics
   Frontend fetches statistics:
   Current points (wages)
   Total games played
   Correct / incorrect answers
