# Trivia Game
This web-application was an in-class assignment (completed in less than 5 hours) for CISC594 - Software Testing Principles and Techniques - at The Harrisburg University of Science and Technology. It uses ReactJS in the frontend and Python, FastAPI, SQLite in the backend.

## Overview
The project implements both the frontend & backend for client-server trivia game system using ReactJS, Python, FastAPI, SQLite. The server manages user accounts, user statistics, and trivia questions.

Trivia questions are loaded from a JSON file - trivia_questions.json - and user data is persisted using SQLite.

The server exposes a Restful API that allows clients to:
* Register/login and authenticate users
* Retrieve trivia questions by category
* Manage user wages (points)
* Track gameplay statistics such as games played and answer accuracy

The server acts as the authoritative source of truth for the trivia game.

## Technology Stack
* React - Frontend Framework
* Python 3 FastAPI – Rest API framework
* SQLite – Manage user data

## Data Storage Design
User information is stored in users.db with the following fields:
* Username (unique)
* Password
* Wages (points) - every user begins with 1000 by default
* Games played - records number of games played
* Correct answers - records number of correct answers by the user
* Incorrect answers - records number of incorrect answers by the user

The database table is automatically created when the server starts.

## Trivia Questions (JSON)
Trivia questions are loaded from trivia_questions.json at startup.
Example format:
```json
[
  {
    "category": "Science",
    "question": "What is the chemical symbol for gold?",
    "choices": ["Gd", "Ag", "Au", "Pt"],
    "answer": "Au"
  }
]
```

# Setup Instructions
For Frontend:
1. Open terminal
2. Navigate to frontend folder: `cd /frontend`
3. Run `npm install`
4. Run `npm start`

For Backend:
1. Open terminal
2. Navigate to backend folder: `cd /backend`
3. Install Dependencies
   * `pip install python`
   * `pip install fastapi uvicorn`
5. Run the server: `python3 -m uvicorn app:app --reload --port 8000`

# Error Handling
Error handling is incorporated on the server-side in the following ways:
* Missing or invalid parameters return appropriate HTTP error codes
* Duplicate usernames are prevented
* Invalid categories or missing users, return descriptive error messages

Error handling is incorporated into the client-side in the following ways:
* The questions page and user statistics pages are only accessible after the API returns a successful response when register/logging in
* If invalid responses are returned from any API calls, the user is notified
* If improper data is entered in the UI, the user is notified before the API call is made. Some examples of improper data include:
  * Entering null value or a negative value as the wager
  * Not selecting a trivia category

# Design Rationale
We chose to use FastAPI to ensure clear API contracts and automatic validation was being done. Furthermore, we used JSON-based trivia storage because the set of trivia questions was decided to be static. This simplified editing and portability. For the backend, we used SQLite because it provides lightweight persistent storage for user data.

For the frontend, we chose ReactJS because it was familiar to the developer and easy to incorporate with a SQLite database.

# Sucessful User Flow
Below is a successful flow of how a user can login/register and successfully play a game.
1. User Authentication
   * Users can register or login.
   * Username and password are validated with the backend, and a success or fail response is returned.
2. Select Trivia Category
   * Once a user selects a trivia category, frontend requests the user to enter a wager.
   * User’s wager is verified with backend to see if it is a valid wager with **POST** `/checkWage?username=<username>`.
   * Once wager is verified successfully, frontend sends **GET** `/category?category=<category selected by user>` to the backend.
3. Play Trivia
   * Backend returns a random question from the category the user selected. This is done by looking through the trivia_questions.json file. The question, multiple choice answer options, and correct answer are also returned.
   * Frontend displays the trivia question and displays multiple choice options to the user. User selects an answer from multiple choice options.
4. Verify Correct or Incorrect Answer
   * Frontend verifies if the user’s answer is correct using the response it had gotten from the trivia_questions.json file.
   * It notifies the user that the user’s answer was correct/incorrect.
   * Regardless of if the user’s response was correct/incorrect, the games played is incremented by 1 with **PUT** `/gamesPlayed?username=<username>`
   * If the user’s response was correct:
       * Total wager amount is incremented by the wager amount the user initially set. The frontend calls **PUT** `/wages?username=<username>` with the `+<wager_amount>` as the body
       * Number of correct answers is incremented by 1 by calling **PUT** `/correctAnswers?username=<username>`
   * If the user’s response was incorrect
       * Total wager amount is decremented by the wager amount the user initially set. The frontend calls **PUT** `/wages?username=<username>` with the `-<wager_amount>` as the body
       * Number of incorrect answers is incremented by 1 by calling **PUT** `/incorrectAnswers?username=<username>`
5. View User Statistics
   * Frontend fetches the following statistics through **GET** endpoints:
       * Current points (wages): `/wages?username=<username>`
       * Total games played: `/gamesPlayed?username=<username>`
       * Correct answers: `/correctAnswers?username=<username>`
       * Incorrect answers: `/incorrectAnswers?username=<username>`

# Areas for Improvements
The web-app was created during class with limited time. Hence, below are a few areas and acknowledgments for improvement:
* Use multiple tables to store user's data - Users table for login/registration and UserStatistics table to keep track of user's stats
* Incorporate SQLAlchemy in the backend to make SQL queries more user-friendly
* Securely store passwords by hashing them with the bcrypt Python library
* Display the user's total points/wages on the Questions page and refresh every time a game has been played
