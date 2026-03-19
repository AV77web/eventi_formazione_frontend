import { useState, useEffect, useMemo } from 'react';
import {
  getEventi,
  getIscrittiPerCheckin,
  registraCheckin,
} from '../../src/services/api';

/** Formatta data evento (ISO o YYYY-MM-DD) per intestazioni */
function formatDataEvento(value) {
  if (value == null || value === '') return '—';
  const s = String(value);
  const day = s.slice(0, 10);
  try {
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('it-IT', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  } catch {
    /* ignore */
  }
  return day;
}

function formatOraCheckin(ora) {
  if (ora == null || ora === '') return '—';
  const s = String(ora);
  return s.length >= 5 ? s.slice(0, 5) : s;
}

const GestioneCheckin = () => {
  const [eventi, setEventi] = useState([]);
  const [eventiLoading, setEventiLoading] = useState(true);
  const [eventiError, setEventiError] = useState('');

  const [selectedEventoId, setSelectedEventoId] = useState('');
  const [iscritti, setIscritti] = useState([]);
  const [listaLoading, setListaLoading] = useState(false);
  const [listaError, setListaError] = useState('');
  const [actionId, setActionId] = useState(null);

  const loadEventi = async () => {
    try {
      setEventiLoading(true);
      setEventiError('');
      const ev = await getEventi({});
      setEventi(Array.isArray(ev) ? ev : []);
    } catch (err) {
      setEventiError(err.message || 'Errore nel caricamento eventi');
      setEventi([]);
    } finally {
      setEventiLoading(false);
    }
  };

  useEffect(() => {
    loadEventi();
  }, []);

  const loadIscritti = async (eventoid) => {
    if (!eventoid) {
      setIscritti([]);
      return;
    }
    try {
      setListaLoading(true);
      setListaError('');
      const rows = await getIscrittiPerCheckin(eventoid);
      setIscritti(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setListaError(err.message || 'Errore nel caricamento iscritti');
      setIscritti([]);
    } finally {
      setListaLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEventoId) {
      loadIscritti(selectedEventoId);
    } else {
      setIscritti([]);
    }
  }, [selectedEventoId]);

  const eventoSelezionato = useMemo(
    () => eventi.find((e) => String(e.EventoID) === String(selectedEventoId)),
    [eventi, selectedEventoId]
  );

  const statistiche = useMemo(() => {
    const tot = iscritti.length;
    const done = iscritti.filter((r) => r.CheckinEffettuato).length;
    return { tot, done, pending: tot - done };
  }, [iscritti]);

  const handleCheckin = async (row) => {
    if (row.CheckinEffettuato) return;
    const nome =
      [row.Nome, row.Cognome].filter(Boolean).join(' ') || row.Email || 'questo partecipante';
    if (!window.confirm(`Registrare il check-in per ${nome}?`)) return;

    try {
      setActionId(row.IscrizioneID);
      setListaError('');
      await registraCheckin(row.IscrizioneID);
      await loadIscritti(selectedEventoId);
    } catch (err) {
      setListaError(err.message || 'Check-in non riuscito');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="dashboard-organizer gestione-checkin-page">
      <h2>Gestione check-in</h2>
      <p className="page-lead">
        Seleziona un evento e registra la presenza degli iscritti. Ogni partecipante può essere
        confermato una sola volta.
      </p>

      {eventiError && <p className="error-message">{eventiError}</p>}

      <section className="checkin-event-select">
        <h3>Evento</h3>
        {eventiLoading ? (
          <p>Caricamento eventi…</p>
        ) : (
          <div className="checkin-select-row">
            <label htmlFor="checkin-evento">Scegli l&apos;evento</label>
            <select
              id="checkin-evento"
              value={selectedEventoId}
              onChange={(e) => setSelectedEventoId(e.target.value)}
            >
              <option value="">— Seleziona —</option>
              {eventi.map((e) => (
                <option key={e.EventoID} value={e.EventoID}>
                  {e.Titolo} ({e.Data})
                </option>
              ))}
            </select>
          </div>
        )}
      </section>

      {selectedEventoId && eventoSelezionato && (
        <div className="checkin-event-banner">
          <strong>{eventoSelezionato.Titolo}</strong>
          <span className="checkin-event-meta">
            {formatDataEvento(eventoSelezionato.Data)}
          </span>
          {!listaLoading && (
            <span className="checkin-stats-pill">
              Check-in: {statistiche.done}/{statistiche.tot}
              {statistiche.tot > 0 && statistiche.pending > 0 && (
                <span className="checkin-pending"> · {statistiche.pending} in attesa</span>
              )}
            </span>
          )}
        </div>
      )}

      {listaError && <p className="error-message">{listaError}</p>}

      {selectedEventoId && (
        <section className="checkin-lista-section">
          <h3>Iscritti</h3>
          {listaLoading ? (
            <p>Caricamento iscritti…</p>
          ) : iscritti.length === 0 ? (
            <p className="checkin-empty">Nessuna iscrizione per questo evento.</p>
          ) : (
            <div className="stats-table-wrap checkin-table-wrap">
              <table className="stats-table checkin-table">
                <thead>
                  <tr>
                    <th>Partecipante</th>
                    <th>Email</th>
                    <th>Stato</th>
                    <th>Ora</th>
                    <th>Azione</th>
                  </tr>
                </thead>
                <tbody>
                  {iscritti.map((row) => {
                    const ok = !!row.CheckinEffettuato;
                    const busy = actionId === row.IscrizioneID;
                    return (
                      <tr key={row.IscrizioneID} className={ok ? 'checkin-row-done' : ''}>
                        <td>
                          <strong>
                            {[row.Nome, row.Cognome].filter(Boolean).join(' ') || '—'}
                          </strong>
                        </td>
                        <td>{row.Email}</td>
                        <td>
                          {ok ? (
                            <span className="checkin-badge checkin-badge-ok">Presente</span>
                          ) : (
                            <span className="checkin-badge checkin-badge-wait">Da registrare</span>
                          )}
                        </td>
                        <td>{ok ? formatOraCheckin(row.OraCheckin) : '—'}</td>
                        <td>
                          {ok ? (
                            <span className="checkin-done-label">—</span>
                          ) : (
                            <button
                              type="button"
                              className="btn-primary checkin-btn"
                              disabled={busy}
                              onClick={() => handleCheckin(row)}
                            >
                              {busy ? 'Registrazione…' : 'Registra check-in'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default GestioneCheckin;
