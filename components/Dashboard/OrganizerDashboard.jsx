import { useState, useEffect } from 'react';
import { getEventi, createEvento, updateEvento, deleteEvento, getStatisticheEventiPassati } from '../../src/services/api';

const OrganizerDashboard = () => {
  const [eventi, setEventi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingEvento, setEditingEvento] = useState(null);
  const [formEvento, setFormEvento] = useState({ titolo: '', data: '', descrizione: '' });

  const [stats, setStats] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');
  const [dal, setDal] = useState('');
  const [al, setAl] = useState('');

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

  const loadStats = async (filters = {}) => {
    try {
      setStatsLoading(true);
      setStatsError('');
      const rows = await getStatisticheEventiPassati(filters);
      setStats(Array.isArray(rows) ? rows : rows?.data || []);
    } catch (err) {
      setStatsError(err.message || 'Errore nel caricamento delle statistiche');
      setStats([]);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadStats({});
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

  const handleStatsSubmit = (e) => {
    e.preventDefault();
    if (dal && al && dal > al) {
      setStatsError('Il valore "dal" non può essere maggiore di "al".');
      return;
    }

    loadStats({
      dal: dal || undefined,
      al: al || undefined,
    });
  };

  return (
    <div className="dashboard-organizer">
      <h2>Dashboard Organizzatore</h2>
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

      <section className="stats-section">
        <h3>Statistiche eventi passati</h3>

        <form className="stats-filters" onSubmit={handleStatsSubmit}>
          <div className="stats-filter">
            <label htmlFor="dal">Dal</label>
            <input
              id="dal"
              type="date"
              value={dal}
              onChange={(e) => setDal(e.target.value)}
            />
          </div>
          <div className="stats-filter">
            <label htmlFor="al">Al</label>
            <input
              id="al"
              type="date"
              value={al}
              onChange={(e) => setAl(e.target.value)}
            />
          </div>
          <div className="stats-filter-actions">
            <button type="submit" className="btn-primary">
              Applica filtro
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setDal('');
                setAl('');
                loadStats({});
              }}
            >
              Reset
            </button>
          </div>
        </form>

        {statsError && <p className="error-message">{statsError}</p>}

        {statsLoading ? (
          <p>Caricamento statistiche...</p>
        ) : stats.length === 0 ? (
          <p>Nessun dato per il filtro selezionato.</p>
        ) : (
          <div className="stats-table-wrap">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Data</th>
                  <th>Iscritti</th>
                  <th>Check-in</th>
                  <th>Partecipazione</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((row) => {
                  const pct = Number(row.PercentualePartecipazione) || 0;
                  const safePct = Math.max(0, Math.min(100, pct));
                  return (
                    <tr key={row.EventoID}>
                      <td>
                        <strong>{row.Titolo}</strong>
                      </td>
                      <td>{row.Data}</td>
                      <td>{row.TotIscritti}</td>
                      <td>{row.TotCheckin}</td>
                      <td>
                        <div className="stats-bar-cell">
                          <div className="stats-bar" aria-label={`Partecipazione ${pct}%`}>
                            <div
                              className="stats-bar-fill"
                              style={{ width: `${safePct}%` }}
                            />
                          </div>
                          <span className="stats-percent">
                            {pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default OrganizerDashboard;

