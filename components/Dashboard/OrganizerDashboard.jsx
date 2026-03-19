import { useState, useEffect } from 'react';
import { getEventi, createEvento, updateEvento, deleteEvento } from '../../src/services/api';

const OrganizerDashboard = () => {
  const [eventi, setEventi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingEvento, setEditingEvento] = useState(null);
  const [formEvento, setFormEvento] = useState({ titolo: '', data: '', descrizione: '' });

  const loadEventi = async () => {
    try {
      setLoading(true);
      setError('');
      const ev = await getEventi({});
      setEventi(ev);
    } catch (err) {
      setError(err.message || 'Errore nel caricamento degli eventi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventi();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormEvento((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (evento) => {
    setEditingEvento(evento);
    setFormEvento({
      titolo: evento.Titolo,
      data: evento.Data,
      descrizione: evento.Descrizione,
    });
  };

  const handleResetForm = () => {
    setEditingEvento(null);
    setFormEvento({ titolo: '', data: '', descrizione: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvento) {
        await updateEvento(editingEvento.EventoID, formEvento);
      } else {
        await createEvento(formEvento);
      }
      handleResetForm();
      await loadEventi();
    } catch (err) {
      alert(err.message || 'Errore nel salvataggio evento');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Eliminare questo evento?')) return;
    try {
      await deleteEvento(id);
      await loadEventi();
    } catch (err) {
      alert(err.message || 'Errore nell’eliminazione evento');
    }
  };

  return (
    <div className="dashboard-organizer">
      <h2>Dashboard Organizzatore</h2>
      <p className="page-lead">
        Gestisci gli eventi di formazione. Le statistiche sugli eventi passati sono nella sezione{' '}
        <strong>Statistiche</strong> del menu.
      </p>
      {error && <p className="error-message">{error}</p>}

      <section>
        <h3>{editingEvento ? 'Modifica evento' : 'Nuovo evento'}</h3>
        <form onSubmit={handleSubmit}>
          <input
            name="titolo"
            placeholder="Titolo"
            value={formEvento.titolo}
            onChange={handleChange}
          />
          <input
            name="data"
            type="date"
            value={formEvento.data}
            onChange={handleChange}
          />
          <input
            name="descrizione"
            placeholder="Descrizione"
            value={formEvento.descrizione}
            onChange={handleChange}
          />
          <button type="submit">{editingEvento ? 'Salva' : 'Crea'}</button>
          {editingEvento && <button onClick={handleResetForm}>Annulla</button>}
        </form>
      </section>

      <section>
        <h3>Eventi</h3>
        {loading ? (
          <p>Caricamento eventi...</p>
        ) : eventi.length === 0 ? (
          <p>Nessun evento presente.</p>
        ) : (
          <ul>
            {eventi.map((e) => (
              <li key={e.EventoID}>
                <strong>{e.Titolo}</strong> - {e.Data}
                <button onClick={() => handleEdit(e)}>Modifica</button>
                <button onClick={() => handleDelete(e.EventoID)}>Elimina</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default OrganizerDashboard;

