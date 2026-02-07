import { useState, useEffect, useContext } from 'react';
import './styles/QuestionsLayout.css';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const categories = [
    "Science",
    "History",
    "Geography",
    "Pop culture",
    "Sports"
];

const categoryColors = {
    Science: "#ea6671",
    History: "#f6ad55",
    Geography: "#686ad3",
    "Pop culture": "#45cf4e",
    Sports: "#c6d221"
};

function QuestionsLayout() {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext); //user's details
    //console.log('user details in questions layout', user)

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [wager, setWager] = useState("");
    const [question, setQuestion] = useState(null);
    const [selectedChoice, setSelectedChoice] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const openCategory = (category) => {
        setSelectedCategory(category);
        setWager("");
        setQuestion(null);
        setShowModal(true);
    };

    //validate if wage amount is valid
    const validateWageAmount = async () => {
        const numericWager = Number(wager);
        if (!numericWager || numericWager <= 0) {
            alert("Please enter a valid wager.");
            return;
        }

        if (!selectedCategory) return;

        try {
            const response = await fetch(`/checkWage?username=${user}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: wager })
            });

            const data = await response.json();
            console.log(data)

            if (data.status != "ok") {
                alert(data.message || "Invalid wager");
                return;
            }

            //fetch a random question from the category
            fetchQuestions();
        } catch (err) {
            console.error(err);
            alert("Error validating wager");
        }
    }


    //fetch questions from backend on component mount
    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/questions?category=${selectedCategory}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch question");
            }

            const data = await response.json();
            setQuestion(data);
            setSelectedChoice("");
        } catch (err) {
            console.error(err);
            alert("Error fetching question");
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setQuestion(null);
        setSelectedChoice("");
        setWager("");
        setSelectedCategory(null);
    };

    const validateAnswer = async () => {
        console.log("User selected choice", selectedChoice)
        console.log("Actual answer", question.answer)
        
        if  (selectedChoice == question.answer) {
            alert('Correct answer!')
            //update total wage
            try {
                const response = await fetch(`/wages?username=${user}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ delta: "+" + wager })
                });

                const data = await response.json();
                console.log(data)
            } catch (err) {
                console.error(err);
                alert("Error adding wager");
            }

            //call correct_answers
            try {
                const response = await fetch(`/correctAnswers?username=${user}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ delta: "+" + wager })
                });

                const data = await response.json();
                console.log(data)
            } catch (err) {
                console.error(err);
                alert("Error adding correct answers");
            }
        }
        else {
            alert("Incorrect answer!")
            //update total wage
            try {
                const response = await fetch(`/wages?username=${user}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ delta: "-" + wager })
                });

                const data = await response.json();
                console.log(data)
            } catch (err) {
                console.error(err);
                alert("Error removing wager");
            }

            //call incorrect_answers
            try {
                const response = await fetch(`/incorrectAnswers?username=${user}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ delta: "+" + wager })
                });

                const data = await response.json();
                console.log(data)
            } catch (err) {
                console.error(err);
                alert("Error adding incorrect answers");
            }
        }

        //call games_played
        try {
            const response = await fetch(`/gamesPlayed?username=${user}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();
            console.log(data)
        } catch (err) {
            console.error(err);
            alert("Error incrementing games");
        }

        closeModal();
    }

    const navigateToUserStatistics = async() => {
        navigate("/app/userstatistics");
    }

    return (
    <div>
        <button
            onClick={() => navigateToUserStatistics()}
        >
            View Your Statistics
        </button>


        <h2>Choose a topic</h2>
        {/* Category Buttons */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {categories.map((category) => (
                <button
                    key={category}
                    onClick={() => openCategory(category)}
                    style={{
                    background: categoryColors[category],
                    color: "#fff",
                    padding: "1rem 1.5rem",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "600",
                    }}
                >
                    {category.toUpperCase()}
                </button>
            ))}
            </div>
            
        {/* Modal */}
        {showModal && (
            <div className="modal-overlay">
                <div className="modal">
                    <h3>{selectedCategory.toUpperCase()}</h3>

                    {/* Wager Input */}
                    {!question && (
                    <>
                        <label>Enter wager amount:</label>
                        <input
                            type="number"
                            value={wager}
                            onChange={(e) => setWager(e.target.value)}
                        />
                        <button onClick={validateWageAmount} disabled={loading}>
                            {loading ? "Loading..." : "Submit"}
                        </button>
                    </>
                    )}

                    {/* Questions */}
                    {question && (
                    <div>
                        <h4>{question.question}</h4>

                        <form>
                        {question.choices.map((choice, index) => (
                            <label
                            key={index}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                marginBottom: "0.5rem",
                                cursor: "pointer",
                            }}
                            >
                            <input
                                type="radio"
                                name="answer"
                                value={choice}
                                checked={selectedChoice === choice}
                                onChange={() => setSelectedChoice(choice)}
                                style={{ margin: 0 }}
                            />
                            <span>{choice}</span>
                            </label>
                        ))}
                        </form>

                        <button
                        disabled={!selectedChoice}
                        onClick={() => validateAnswer(selectedChoice)}
                        >
                        Submit Answer
                        </button>
                    </div>
                    )}

                    <button onClick={() => {
                        setShowModal(false);
                        setQuestion(null);
                        setSelectedChoice("");
                    }}>Close</button>
                </div>
            </div>
        )}
    </div>
  );
}

export default QuestionsLayout;