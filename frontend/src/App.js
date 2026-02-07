import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginRegister from './pages/LoginRegister';
import QuestionsLayout from './pages/QuestionsLayout';
import UserStatistics from './pages/UserStatistics';
import ProtectedRoute from './components/ProtectedRoute';
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import "./App.css";

function App() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginRegister />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <QuestionsLayout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/userstatistics"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <UserStatistics />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;