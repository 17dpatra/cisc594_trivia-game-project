import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import "./App.css";
import { useState } from 'react';
import LoginRegister from './pages/LoginRegister';
import QuestionsLayout from './pages/QuestionsLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";


function App() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LoginRegister />} />

          {/* User can only view other pages, if they login/register successfully */}
          <Route 
            path="/app" 
            element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <QuestionsLayout />
                </ProtectedRoute>
            }
          >
            {/* <Route path="userdashboard" element={<UserDashboard />} />
            <Route path="teamdashboard" element={<TeamDashboard />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="admincontrols" element={<AdminControls />} /> */}
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;