import { useState, useEffect, useContext } from 'react';
import './styles/QuestionsLayout.css';
import { AuthContext } from '../context/AuthContext';

const categories = [
    "science", 
    "history", 
    "geography", 
    "pop culture",
    "sports"
];

const categoryColors = {
    science: "#ea6671",
    history: "#f6ad55",
    geography: "#686ad3",
    "pop culture": "#45cf4e",
    sports: "#c6d221"
};

function QuestionsLayout() {
    const { user } = useContext(AuthContext); //user's details
    //console.log('user details in questions layout', user)

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [wager, setWager] = useState("");
    const [questions, setQuestions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const openCategory = (category) => {
        setSelectedCategory(category);
        setWager("");
        setQuestions([]);
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
            const response = await fetch(`/validate_wage/${user}/${numericWager}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();

            if (!response.ok || !data.valid) {
                alert(data.message || "Invalid wager");
                return;
            }

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
            const response = await fetch(`/questions/${selectedCategory}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch questions");
            }

            const data = await response.json();
            setQuestions(data);
        } catch (err) {
            console.error(err);
            alert("Error fetching questions");
        } finally {
            setLoading(false);
        }
    };

    return (
    <div>
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
                    {!questions.length && (
                    <>
                        <label>Enter wager amount:</label>
                        <input
                            type="number"
                            value={wager}
                            onChange={(e) => setWager(e.target.value)}
                        />
                        <button onClick={fetchQuestions} disabled={loading}>
                            {loading ? "Loading..." : "Submit"}
                        </button>
                    </>
                    )}

                    {/* Questions */}
                    {questions.length > 0 && (
                    <ul>
                        {questions.map((q, index) => (
                        <li key={index}>{q.question}</li>
                        ))}
                    </ul>
                    )}

                    <button onClick={() => {
                        setShowModal(false);
                        setQuestions([]);
                    }}>Close</button>
                </div>
            </div>
        )}
    </div>
  );
}

export default QuestionsLayout;