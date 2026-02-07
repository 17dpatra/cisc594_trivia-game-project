import { useState, useEffect, useContext } from 'react';
import './styles/QuestionsLayout.css';
import { AuthContext } from '../context/AuthContext';


function QuestionsLayout() {
    const { user } = useContext(AuthContext); //user's details
    console.log('user details in questions layout', user)
    return (
        <div style={{ maxWidth: "100%", overflow: "hidden" }}>
                <h2 className="mb-4" style={{ paddingBottom: "2rem" }}>Your Questions</h2>
        </div>
    );
}

export default QuestionsLayout;