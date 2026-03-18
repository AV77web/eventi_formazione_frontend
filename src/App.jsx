// =================================================
// File: App.jsx
// Componente principale dell'applicazione
// @author: Full Stack Senior Developer
// @version: 1.0.0 2026-01-14
// =================================================

import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from '../components/Login/Login';
import Registration from '../components/Registration/Registration';
import Utenti from '../components/Utenti/Utenti';
import EmployeeDashboard from '../components/Dashboard/EmployeeDashboard';
import OrganizerDashboard from '../components/Dashboard/OrganizerDashboard';
import './App.css'

function App() {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('login');

  const handleLoginSuccess = () => {
    setCurrentPage('home');
  };

  const handleGoToLogin = () => {
    setCurrentPage('login');
  };

  const handleGoToRegister = () => {
    setCurrentPage('register');
  };

  const handleGoToUtenti = () => {
    setCurrentPage('utenti');
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentPage('login');
    } catch {
      setCurrentPage('login');
    }
  };

  const isOrganizer = user?.ruolo === 'Organizzatore';

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Eventi Formazione</h1>
        {user && (
          <div className="app-header-right">
            <span className="app-user-label">
              {user.email} ({user.ruolo})
            </span>
            <button className="btn-link" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </header>

      <nav className="app-nav">
        {!user && (
          <>
            <button
              className={`nav-button ${currentPage === 'login' ? 'active' : ''}`}
              onClick={handleGoToLogin}
            >
              Login
            </button>
            <button
              className={`nav-button ${currentPage === 'register' ? 'active' : ''}`}
              onClick={handleGoToRegister}
            >
              Registrazione
            </button>
          </>
        )}
        {user && (
          <>
            <button
              className={`nav-button ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentPage('home')}
            >
              Dashboard
            </button>
            {isOrganizer && (
              <button
                className={`nav-button ${currentPage === 'utenti' ? 'active' : ''}`}
                onClick={handleGoToUtenti}
              >
                Gestione Eventi / Utenti
              </button>
            )}
          </>
        )}
      </nav>

      <main className="app-main">
        {!user && currentPage === 'login' && (
          <Login
            onSwitchToRegister={handleGoToRegister}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
        {!user && currentPage === 'register' && (
          <Registration
            onSwitchToLogin={handleGoToLogin}
            onRegistrationSuccess={handleGoToLogin}
          />
        )}

        {user && currentPage === 'home' && (
          user.ruolo === 'Dipendente' ? (
            <EmployeeDashboard />
          ) : (
            <OrganizerDashboard />
          )
        )}

        {user && isOrganizer && currentPage === 'utenti' && (
          <div>
            <OrganizerDashboard />
            <Utenti />
          </div>
        )}
      </main>
    </div>
  );
}

export default App
