// =================================================
// File: Utenti.jsx
// Gestione utenti di sistema (solo Amministratore)
// =================================================

import { useEffect, useState } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import { getUtenti, createUtente, updateUtente, deleteUtente } from '../../src/services/api';

const Utenti = () => {
    const { user } = useAuth();
    const [utenti, setUtenti] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState(null);
    const [modalError, setModalError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentUtente, setCurrentUtente] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        ruolo: 'Operatore' // Operatore | Amministratore
    });

    const isAdmin = user?.ruolo === 'Amministratore';

    const loadUtenti = async () => {
        try {
            setLoading(true);
            setPageError(null);
            const response = await getUtenti();
            setUtenti(response.data || response || []);
        } catch (err) {
            setPageError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            loadUtenti();
        } else {
            setLoading(false);
        }
    }, [isAdmin]);

    const handleOpenCreate = () => {
        setEditMode(false);
        setCurrentUtente(null);
        setFormData({
            email: '',
            password: '',
            ruolo: 'Operatore'
        });
        setModalError(null);
        setShowModal(true);
    };

    const handleOpenEdit = (utente) => {
        setEditMode(true);
        setCurrentUtente(utente);
        setFormData({
            email: utente.Email,
            password: '',
            ruolo: (utente.Admin === true || utente.Admin === 'true' || utente.Admin === '1') ? 'Amministratore' : 'Operatore'
        });
        setModalError(null);
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentUtente(null);
        setModalError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email) {
            setModalError('Email obbligatoria');
            return;
        }
        if (!editMode && !formData.password) {
            setModalError('Password obbligatoria per un nuovo utente');
            return;
        }

        const adminFlag = formData.ruolo === 'Amministratore';

        try {
            setModalError(null);
            if (editMode && currentUtente) {
                await updateUtente(currentUtente.UtenteID, {
                    email: formData.email,
                    admin: adminFlag,
                    password: formData.password || undefined
                });
            } else {
                await createUtente({
                    email: formData.email,
                    password: formData.password,
                    admin: adminFlag
                });
            }
            handleClose();
            loadUtenti();
        } catch (err) {
            setModalError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Eliminare questo utente?')) return;
        try {
            setPageError(null);
            await deleteUtente(id);
            loadUtenti();
        } catch (err) {
            setPageError(err.message);
        }
    };

    if (!isAdmin) {
        return (
            <div className="categorie-container">
                <div className="access-denied">
                    <div className="access-denied-icon">🔒</div>
                    <h2>Accesso Negato</h2>
                    <p>Solo gli amministratori possono gestire gli utenti.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="categorie-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Caricamento utenti...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="categorie-container">
            <div className="categorie-header">
                <div className="header-content">
                    <div className="header-title">
                        <span className="icon-title">👤</span>
                        <h1>Gestione Utenti</h1>
                    </div>
                    <p className="header-subtitle">
                        Crea, modifica ed elimina gli utenti del sistema.
                    </p>
                </div>
                <button className="btn-primary" onClick={handleOpenCreate}>
                    + Nuovo Utente
                </button>
            </div>

            {pageError && <div className="error-message">{pageError}</div>}

            <div className="categorie-table-section">
                <div className="table-header">
                    <span className="table-icon">📄</span>
                    <h3>Elenco Utenti</h3>
                </div>
                {utenti.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">👤</div>
                        <h3>Nessun utente trovato</h3>
                    </div>
                ) : (
                    <table className="categorie-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Email</th>
                                <th>Ruolo</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {utenti.map((u) => (
                                <tr key={u.UtenteID}>
                                    <td>
                                        <span className="categoria-id">{u.UtenteID}</span>
                                    </td>
                                    <td className="descrizione-cell">{u.Email}</td>
                                    <td>{u.Admin === true || u.Admin === 'true' || u.Admin === '1' ? 'Amministratore' : 'Operatore'}</td>
                                    <td>
                                        <div className="actions-cell">
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleOpenEdit(u)}
                                            >
                                                ✏️ Modifica
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDelete(u.UtenteID)}
                                            >
                                                🗑️ Elimina
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={handleClose}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <span className="modal-icon">👤</span>
                                {editMode ? 'Modifica Utente' : 'Nuovo Utente'}
                            </h2>
                            <button className="modal-close" onClick={handleClose}>
                                ×
                            </button>
                        </div>
                        {modalError && <div className="error-message">{modalError}</div>}
                        <form onSubmit={handleSubmit} className="categoria-form">
                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>{editMode ? 'Nuova Password (opzionale)' : 'Password *'}</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder={editMode ? 'Lascia vuoto per non modificare' : ''}
                                />
                            </div>
                            <div className="form-group">
                                <label>Ruolo</label>
                                <select
                                    value={formData.ruolo}
                                    onChange={(e) => setFormData({ ...formData, ruolo: e.target.value })}
                                >
                                    <option value="Operatore">Operatore</option>
                                    <option value="Amministratore">Amministratore</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={handleClose}>
                                    Annulla
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editMode ? 'Salva Modifiche' : 'Crea Utente'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Utenti;

