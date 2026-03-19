// =================================================
// File: api.js
// Wrapper centralizzato per le chiamate HTTP al backend
// Usa fetch con credenziali (cookie HttpOnly) per gestire l'autenticazione
// =================================================

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === "production"
    ? "https://eventi-formazione-backend.vercel.app"
    : "http://localhost:3000");

async function handleResponse(response) {
  let data = null;
  const contentType = response.headers.get("Content-Type") || "";

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      data && typeof data === "object" && data.error
        ? data.error
        : typeof data === "string" && data
        ? data
        : "Errore nella chiamata al server";
    throw new Error(message);
  }

  return data;
}

/**
 * Login utente
 * Chiama il backend per autenticare l'utente e impostare il cookie HttpOnly
 */
export async function loginUser(email, password) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  return handleResponse(response);
}

/**
 * Registrazione utente
 */
export async function registerUser(userData) {
  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(userData),
  });

  return handleResponse(response);
}

/**
 * Verifica autenticazione corrente
 * Usa l'endpoint /auth/me che legge il cookie HttpOnly
 */
export async function verifyAuth() {
  const response = await fetch(`${BASE_URL}/auth/me`, {
    method: "GET",
    credentials: "include",
  });

  // Se il token è mancante o non valido, l'API risponde con 401/403
  if (!response.ok) {
    return { authenticated: false, user: null };
  }

  return handleResponse(response);
}

/**
 * Logout utente
 */
export async function logoutUser() {
  const response = await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  return handleResponse(response);
}

/**
 * API amministrazione utenti (solo Amministratore)
 */
export async function getUtenti() {
  const response = await fetch(`${BASE_URL}/utenti`, {
    method: "GET",
    credentials: "include",
  });
  return handleResponse(response);
}

export async function createUtente(data) {
  const response = await fetch(`${BASE_URL}/utenti`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateUtente(id, data) {
  const response = await fetch(`${BASE_URL}/utenti/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteUtente(id) {
  const response = await fetch(`${BASE_URL}/utenti/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse(response);
}

// =================================================
// Eventi
// =================================================

export async function getEventi(options = {}) {
  const params = new URLSearchParams();
  if (options.soloFuturi) {
    params.set("soloFuturi", "true");
  }
  const qs = params.toString();
  const url = qs ? `${BASE_URL}/eventi?${qs}` : `${BASE_URL}/eventi`;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });
  return handleResponse(response);
}

export async function createEvento(data) {
  const response = await fetch(`${BASE_URL}/eventi`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateEvento(id, data) {
  const response = await fetch(`${BASE_URL}/eventi/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteEvento(id) {
  const response = await fetch(`${BASE_URL}/eventi/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse(response);
}

// =================================================
// Iscrizioni
// =================================================

export async function getMieIscrizioni() {
  const response = await fetch(`${BASE_URL}/iscrizioni/mie`, {
    method: "GET",
    credentials: "include",
  });
  return handleResponse(response);
}

export async function iscrivitiEvento(eventoid) {
  const response = await fetch(`${BASE_URL}/iscrizioni`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ eventoid }),
  });
  return handleResponse(response);
}

export async function disdiciIscrizione(iscrizioneId) {
  const response = await fetch(`${BASE_URL}/iscrizioni/${iscrizioneId}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse(response);
}

// =================================================
// Check-in (solo organizzatori)
// =================================================

export async function registraCheckin(iscrizioneId) {
  const response = await fetch(`${BASE_URL}/checkin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ iscrizioneid: iscrizioneId }),
  });
  return handleResponse(response);
}

// =================================================
// Statistiche eventi passati (solo organizzatori)
// =================================================

export async function getStatisticheEventiPassati({ dal, al } = {}) {
  const params = new URLSearchParams();
  if (dal) params.set("dal", dal);
  if (al) params.set("al", al);
  const qs = params.toString();
  const url = qs
    ? `${BASE_URL}/statistiche/eventi-passati?${qs}`
    : `${BASE_URL}/statistiche/eventi-passati`;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });
  return handleResponse(response);
}


