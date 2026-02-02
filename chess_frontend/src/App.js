import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import ChessBoard from "./components/ChessBoard";
import MoveHistory from "./components/MoveHistory";
import {
  fetchGameState,
  fetchHealth,
  fetchMoveHistory,
  restartGame,
  submitMove,
} from "./api/chessApi";
import { buildFallbackStartPosition } from "./utils/chessboard";

/**
 * Normalize backend game state into a position map:
 * - preferred: { board: { "e2": "P", ... } }
 * - fallback: { position: { ... } }
 * - if backend returns FEN or other formats, we can't parse without adding chess libs;
 *   keep UI stable by ignoring and showing fallback.
 */
function normalizePosition(data) {
  if (!data) return null;
  if (data.board && typeof data.board === "object") return data.board;
  if (data.position && typeof data.position === "object") return data.position;
  return null;
}

function normalizeMoves(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.moves)) return data.moves;
  if (Array.isArray(data.history)) return data.history;
  return [];
}

function normalizeTurn(data) {
  if (!data) return null;
  // common shapes: { turn: "white" } or { player_to_move: "w" }
  if (typeof data.turn === "string") return data.turn;
  if (typeof data.player_to_move === "string") return data.player_to_move;
  return null;
}

// PUBLIC_INTERFACE
function App() {
  /** Main retro chess app shell. */
  const [backendStatus, setBackendStatus] = useState({
    ok: false,
    message: "Checking backend…",
  });

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [position, setPosition] = useState(() => buildFallbackStartPosition());
  const [turn, setTurn] = useState("white");
  const [moves, setMoves] = useState([]);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [lastMove, setLastMove] = useState(null);

  const apiReady = useMemo(() => backendStatus.ok, [backendStatus.ok]);

  const loadFromBackend = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // health check exists today
      const health = await fetchHealth();
      setBackendStatus({ ok: true, message: health?.message || "Healthy" });
    } catch (e) {
      setBackendStatus({
        ok: false,
        message: "Backend unreachable. Using local fallback board.",
      });
      setLoading(false);
      return;
    }

    // Planned endpoints: attempt, but keep fallback if missing.
    try {
      const [game, hist] = await Promise.allSettled([fetchGameState(), fetchMoveHistory()]);
      if (game.status === "fulfilled") {
        const pos = normalizePosition(game.value);
        const t = normalizeTurn(game.value);
        if (pos) setPosition(pos);
        if (t) setTurn(t);
      }

      if (hist.status === "fulfilled") {
        setMoves(normalizeMoves(hist.value));
      }
    } catch (e) {
      // Shouldn't reach due to allSettled, but keep safe.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFromBackend();
  }, [loadFromBackend]);

  const handleSquareClick = useCallback(
    async (square) => {
      if (busy) return;
      setError("");

      // First click selects a square; second click attempts a move.
      if (!selectedSquare) {
        setSelectedSquare(square);
        return;
      }

      if (selectedSquare === square) {
        setSelectedSquare(null);
        return;
      }

      const from = selectedSquare;
      const to = square;

      // If API is ready, prefer backend validation.
      if (apiReady) {
        setBusy(true);
        try {
          const resp = await submitMove({ from, to });
          // Backend may return updated game state; try to adopt it.
          const newPos = normalizePosition(resp);
          const newTurn = normalizeTurn(resp);
          const newHistory = normalizeMoves(resp);

          if (newPos) setPosition(newPos);
          if (newTurn) setTurn(newTurn);

          // History may be returned inline; otherwise refresh.
          if (newHistory.length > 0) {
            setMoves(newHistory);
          } else {
            try {
              const hist = await fetchMoveHistory();
              setMoves(normalizeMoves(hist));
            } catch {
              // ignore
            }
          }

          setLastMove({ from, to });
          setSelectedSquare(null);
        } catch (e) {
          setError(e.message || "Move rejected.");
          setSelectedSquare(null);
        } finally {
          setBusy(false);
        }
        return;
      }

      // Local fallback: no rules/validation (backend is the source of truth when available).
      setPosition((prev) => {
        const next = { ...(prev || {}) };
        const piece = next[from];
        if (!piece) return next;
        delete next[from];
        next[to] = piece;
        return next;
      });
      setMoves((prev) => [...(prev || []), { from, to }]);
      setLastMove({ from, to });
      setSelectedSquare(null);
      setTurn((t) => (t === "white" ? "black" : "white"));
    },
    [apiReady, busy, selectedSquare]
  );

  const onRestart = useCallback(async () => {
    setError("");
    setSelectedSquare(null);
    setLastMove(null);

    if (!apiReady) {
      setPosition(buildFallbackStartPosition());
      setMoves([]);
      setTurn("white");
      return;
    }

    setBusy(true);
    try {
      const resp = await restartGame();
      const newPos = normalizePosition(resp) || buildFallbackStartPosition();
      const newTurn = normalizeTurn(resp) || "white";
      setPosition(newPos);
      setTurn(newTurn);

      // refresh history best-effort
      try {
        const hist = await fetchMoveHistory();
        setMoves(normalizeMoves(hist));
      } catch {
        setMoves([]);
      }
    } catch (e) {
      setError(e.message || "Restart failed.");
    } finally {
      setBusy(false);
    }
  }, [apiReady]);

  return (
    <div className="AppShell">
      <header className="TopBar">
        <div className="Brand">
          <div className="BrandMark" aria-hidden="true">
            ♜
          </div>
          <div className="BrandText">
            <h1 className="Title">Retro Chess Terminal</h1>
            <p className="Subtitle">Two-player chess • backend-validated when available</p>
          </div>
        </div>

        <div className="TopBarRight">
          <div className={`StatusPill ${backendStatus.ok ? "StatusOk" : "StatusWarn"}`}>
            <span className="StatusDot" aria-hidden="true" />
            <span className="StatusText">
              {backendStatus.ok ? "Backend: OK" : "Backend: OFFLINE"}
            </span>
          </div>

          <button className="Btn" type="button" onClick={onRestart} disabled={busy}>
            Restart
          </button>
        </div>
      </header>

      <main className="Main">
        <section className="BoardSection">
          <div className="Hud">
            <div className="HudRow">
              <span className="HudLabel">Turn</span>
              <span className="HudValue">{turn || "unknown"}</span>
            </div>
            <div className="HudRow">
              <span className="HudLabel">Selected</span>
              <span className="HudValue">{selectedSquare || "—"}</span>
            </div>
            <div className="HudRow">
              <span className="HudLabel">Last Move</span>
              <span className="HudValue">
                {lastMove ? `${lastMove.from} → ${lastMove.to}` : "—"}
              </span>
            </div>
          </div>

          <div className="BoardWrap">
            <ChessBoard
              position={position}
              selectedSquare={selectedSquare}
              lastMove={lastMove}
              onSquareClick={handleSquareClick}
              disabled={loading || busy}
            />
            <div className="HelpText" role="note">
              <p className="muted">
                Click a piece square to select, then click a destination square to move.
              </p>
              {!backendStatus.ok ? (
                <p className="warn">
                  Backend endpoints are not reachable; moves are applied locally without rule
                  validation.
                </p>
              ) : null}
            </div>
          </div>

          {error ? (
            <div className="ErrorBanner" role="alert">
              {error}
            </div>
          ) : null}

          {loading ? <div className="LoadingLine">Loading game state…</div> : null}
        </section>

        <aside className="SideSection">
          <MoveHistory moves={moves} />

          <section className="panel" aria-label="Connection info">
            <header className="panelHeader">
              <h2 className="panelTitle">Connection</h2>
            </header>
            <div className="panelBody">
              <p className="muted">
                Configure backend URL with <code>REACT_APP_CHESS_API_URL</code>.
              </p>
              <p className="muted">Health message: {backendStatus.message}</p>
            </div>
          </section>
        </aside>
      </main>

      <footer className="Footer">
        <span className="muted">© Retro Chess • Built with React</span>
      </footer>
    </div>
  );
}

export default App;
