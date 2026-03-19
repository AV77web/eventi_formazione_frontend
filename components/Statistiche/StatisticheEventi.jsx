import { useState, useEffect } from 'react';
import { getStatisticheEventiPassati } from '../../src/services/api';

/**
 * Statistiche eventi passati (solo organizzatori — rotta backend protetta)
 */
const StatisticheEventi = () => {
  const [stats, setStats] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');
  const [dal, setDal] = useState('');
  const [al, setAl] = useState('');

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
    <div className="dashboard-organizer statistiche-page">
      <h2>Statistiche</h2>
      <p className="page-lead">
        Eventi con data anteriore a oggi: iscritti, check-in effettuati e percentuale di partecipazione.
      </p>

      <section className="stats-section">
        <h3>Eventi passati</h3>

        <form className="stats-filters" onSubmit={handleStatsSubmit}>
          <div className="stats-filter">
            <label htmlFor="stat-dal">Dal</label>
            <input
              id="stat-dal"
              type="date"
              value={dal}
              onChange={(e) => setDal(e.target.value)}
            />
          </div>
          <div className="stats-filter">
            <label htmlFor="stat-al">Al</label>
            <input
              id="stat-al"
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
                          <div
                            className="stats-bar"
                            aria-label={`Partecipazione ${pct}%`}
                          >
                            <div
                              className="stats-bar-fill"
                              style={{ width: `${safePct}%` }}
                            />
                          </div>
                          <span className="stats-percent">{pct}%</span>
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

export default StatisticheEventi;
