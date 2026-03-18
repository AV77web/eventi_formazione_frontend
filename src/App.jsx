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

  const isAdmin = user?.ruolo === 'Amministratore';

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
            {isAdmin && (
              <button
                className={`nav-button ${currentPage === 'utenti' ? 'active' : ''}`}
                onClick={handleGoToUtenti}
              >
                Gestione Utenti
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
          <div className="dashboard-placeholder">
            <h2>Dashboard</h2>
            <p>
              Qui andranno la lista eventi, le iscrizioni personali e la dashboard
              organizzatore/dipendente in base al ruolo.
            </p>
          </div>
        )}

        {user && isAdmin && currentPage === 'utenti' && (
          // Lazy import semplice per ora: richiede il componente direttamente
          // senza React.lazy per non complicare la struttura.
          // eslint-disable-next-line react/jsx-no-undef
          <Utenti />
        )}
      </main>
    </div>
  );
}

export default App
