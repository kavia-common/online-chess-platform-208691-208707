const DEFAULT_BASE_URL = process.env.REACT_APP_CHESS_API_URL || "http://localhost:3001";

/**
 * Best-effort JSON parsing helper.
 * Backend may not be fully implemented yet; we still want clean errors for the UI.
 */
async function parseJsonSafe(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function requestJson(path, options = {}) {
  const url = `${DEFAULT_BASE_URL}${path}`;
  const resp = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await parseJsonSafe(resp);

  if (!resp.ok) {
    const msg =
      (data && (data.detail || data.message)) ||
      `Request failed (${resp.status}) ${resp.statusText}`;
    const err = new Error(msg);
    err.status = resp.status;
    err.data = data;
    throw err;
  }
  return data;
}

// PUBLIC_INTERFACE
export async function fetchHealth() {
  /** Fetch backend health check. */
  return requestJson(`/`, { method: "GET" });
}

// PUBLIC_INTERFACE
export async function fetchGameState() {
  /** Fetch current game state (planned endpoint). */
  return requestJson(`/game`, { method: "GET" });
}

// PUBLIC_INTERFACE
export async function fetchMoveHistory() {
  /** Fetch move history (planned endpoint). */
  return requestJson(`/history`, { method: "GET" });
}

// PUBLIC_INTERFACE
export async function submitMove({ from, to, promotion }) {
  /** Submit a move to the backend (planned endpoint). */
  return requestJson(`/move`, {
    method: "POST",
    body: JSON.stringify({ from, to, promotion }),
  });
}

// PUBLIC_INTERFACE
export async function restartGame() {
  /** Restart the game (planned endpoint). */
  return requestJson(`/restart`, { method: "POST" });
}
