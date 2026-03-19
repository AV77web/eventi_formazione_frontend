import { useEffect, useState } from 'react';
import { getEventi, getMieIscrizioni, iscrivitiEvento, disdiciIscrizione } from '../../src/services/api';

const EmployeeDashboard = () => {
  const [eventi, setEventi] = useState([]);
  const [iscrizioni, setIscrizioni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [ev, iscr] = await Promise.all([
        getEventi({ soloFuturi: true }),
        getMieIscrizioni()
      ]);
      setEventi(ev);
      setIscrizioni(iscr);
    } catch (err) {
      setError(err.message || 'Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isIscritto = (eventoId) =>
    iscrizioni.some((i) => i.EventoID === eventoId);

  const handleIscrizione = async (eventoId) => {
    try {
      await iscrivitiEvento(eventoId);
      await loadData();
    } catch (err) {
      alert(err.message || 'Errore durante l’iscrizione');
    }
  };

  const handleDisiscrizione = async (iscrizioneId) => {
    if (!window.confirm('Vuoi annullare l’iscrizione a questo evento?')) return;
    try {
      await disdiciIscrizione(iscrizioneId);
      await loadData();
    } catch (err) {
      alert(err.message || 'Errore durante la disiscrizione');
    }
  };

  if (loading) {
    return <p>Caricamento dashboard dipendente...</p>;
  }

  return (
    <div className="dashboard-employee">
      <h2>Dashboard Dipendente</h2>
      {error && <p className="error-message">{error}</p>}

      <section>
        <h3>Eventi disponibili</h3>
        {eventi.length === 0 ? (
          <p>Nessun evento disponibile.</p>
        ) : (
          <ul>
            {eventi.map((e) => (
              <li key={e.EventoID}>
                <strong>{e.Titolo}</strong> - {e.Data}
                <button
                  onClick={() => handleIscrizione(e.EventoID)}
                  disabled={isIscritto(e.EventoID)}
                >
                  {isIscritto(e.EventoID) ? 'Già iscritto' : 'Iscriviti'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3>Le mie iscrizioni</h3>
        <p className="page-lead" style={{ textAlign: 'left', marginBottom: '12px' }}>
          Il <strong>check-in</strong> in presenza viene registrato dall&apos;organizzatore il giorno
          dell&apos;evento; qui sotto vedi se la tua presenza risulta già confermata.
        </p>
        {iscrizioni.length === 0 ? (
          <p>Nessuna iscrizione trovata.</p>
        ) : (
          <ul>
            {iscrizioni.map((i) => (
              <li key={i.IscrizioneID}>
                <strong>{i.Titolo}</strong> - {i.Data}{' '}
                {i.CheckinEffettuato ? '(Check-in effettuato)' : ''}
                {!i.CheckinEffettuato && (
                  <button onClick={() => handleDisiscrizione(i.IscrizioneID)}>
                    Annulla iscrizione
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default EmployeeDashboard;

