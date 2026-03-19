// =================================================
// File: App.jsx
// Componente principale dell'applicazione
// @author: Full Stack Senior Developer
// @version: 1.0.0 2026-01-14
// =================================================

import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Login from '../components/Login/Login';
import Registration from '../components/Registration/Registration';
import Utenti from '../components/Utenti/Utenti';
import StatisticheEventi from '../components/Statistiche/StatisticheEventi';
import GestioneCheckin from '../components/Checkin/GestioneCheckin';
import EmployeeDashboard from '../components/Dashboard/EmployeeDashboard';
import OrganizerDashboard from '../components/Dashboard/OrganizerDashboard';
import './App.css'

function App() {
  const { user, logout, loading } = useAuth();
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

  const handleGoToStatistiche = () => {
    setCurrentPage('statistiche');
  };

  const handleGoToCheckin = () => {
    setCurrentPage('checkin');
  };

  /**
   * Sessione ripristinata da cookie: currentPage parte come "login" ma user è valorizzato.
   * Usiamo una pagina "effettiva" per evitare main vuoto finché l'useEffect non gira.
   */
  const effectivePage =
    user && (currentPage === 'login' || currentPage === 'register')
      ? 'home'
      : currentPage;

  useEffect(() => {
    if (user && (currentPage === 'login' || currentPage === 'register')) {
      setCurrentPage('home');
    }
  }, [user, currentPage]);

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentPage('login');
    } catch {
      setCurrentPage('login');
    }
  };

  const isOrganizer = user?.ruolo === 'Organizzatore';

  if (loading) {
    return (
      <div className="app-root app-auth-loading">
        <p className="app-auth-loading-text">Caricamento sessione…</p>
      </div>
    );
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Eventi Formazione</h1>
        {user && (
          <div className="app-header-right">
            <span className="app-user-label">
              {[user.nome, user.cognome].filter(Boolean).join(' ') || user.email} ({user.ruolo})
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
              className={`nav-button ${effectivePage === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentPage('home')}
            >
              Dashboard
            </button>
            {isOrganizer && (
              <>
                <button
                  className={`nav-button ${effectivePage === 'checkin' ? 'active' : ''}`}
                  onClick={handleGoToCheckin}
                >
                  Gestione check-in
                </button>
                <button
                  className={`nav-button ${effectivePage === 'statistiche' ? 'active' : ''}`}
                  onClick={handleGoToStatistiche}
                >
                  Statistiche
                </button>
                <button
                  className={`nav-button ${effectivePage === 'utenti' ? 'active' : ''}`}
                  onClick={handleGoToUtenti}
                >
                  Gestione utenti
                </button>
              </>
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

        {user && effectivePage === 'home' && (
          user.ruolo === 'Dipendente' ? (
            <EmployeeDashboard />
          ) : (
            <OrganizerDashboard onOpenGestioneCheckin={handleGoToCheckin} />
          )
        )}

        {user && isOrganizer && effectivePage === 'checkin' && (
          <GestioneCheckin />
        )}

        {user && isOrganizer && effectivePage === 'statistiche' && (
          <StatisticheEventi />
        )}

        {user && isOrganizer && effectivePage === 'utenti' && (
          <Utenti />
        )}
      </main>
    </div>
  );
}

export default App
