import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';


function UserStatistics(){
    const { user } = useContext(AuthContext);
    const [totalWages, setTotalWages] = useState(0);
    const [gamesPlayed, setGamesPlayed] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [incorrectAnswers, setIncorrectAnswers] = useState(0);
    const [loading, setLoading] = useState(true);

    const getTotalWages = async () => {
        try {
            const response = await fetch(`/wages?username=${user}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();
            //console.log(data)
            if (data.wages) {
                setTotalWages(data.wages);
            }
        } catch (err) {
            console.error(err);
            alert("Error getting total wager");
        }
    }

    const getTotalGamesPlayed = async () => {
        try {
            const response = await fetch(`/gamesPlayed?username=${user}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();
            if (data.gamesPlayed) {
                setGamesPlayed(data.gamesPlayed);
            }
        } catch (err) {
            console.error(err);
            alert("Error getting total games played");
        }
    }

    const getTotalCorrectAnswers = async () => {
        try {
            const response = await fetch(`/correctAnswers?username=${user}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();
            //console.log(data)
            if (data.correctAnswers) {
                setCorrectAnswers(data.correctAnswers);
            }
        } catch (err) {
            console.error(err);
            alert("Error getting total correct answers");
        }
    }

    const getTotalIncorrectAnswers = async () => {
        try {
            const response = await fetch(`/incorrectAnswers?username=${user}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();
            if (data.incorrectAnswers) {
                setIncorrectAnswers(data.incorrectAnswers);
            }
        } catch (err) {
            console.error(err);
            alert("Error getting total incorrect answers");
        }
    }

    useEffect(() => {
        getTotalWages();
        getTotalGamesPlayed();
        getTotalCorrectAnswers();
        getTotalIncorrectAnswers();
    })

    return(
        <div style={{ padding: '1rem' }}>
        <h2>User Statistics</h2>
        <ul>
            <li><strong>Total Wages:</strong> {totalWages}</li>
            <li><strong>Games Played:</strong> {gamesPlayed}</li>
            <li><strong>Correct Answers:</strong> {correctAnswers}</li>
            <li><strong>Incorrect Answers:</strong> {incorrectAnswers}</li>
        </ul>
        </div>
    );
}

export default UserStatistics;