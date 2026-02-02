import React from "react";

// PUBLIC_INTERFACE
export default function MoveHistory({ moves }) {
  /** Render move list in a retro terminal panel. */
  const safeMoves = Array.isArray(moves) ? moves : [];

  return (
    <section className="panel" aria-label="Move history">
      <header className="panelHeader">
        <h2 className="panelTitle">Move History</h2>
      </header>
      <div className="panelBody panelScroll">
        {safeMoves.length === 0 ? (
          <p className="muted">No moves yet.</p>
        ) : (
          <ol className="movesList">
            {safeMoves.map((m, idx) => (
              <li key={`${m?.from || "?"}-${m?.to || "?"}-${idx}`} className="moveRow">
                <span className="moveIndex">{idx + 1}.</span>
                <span className="moveText">
                  {(m?.from || "?").toString()} → {(m?.to || "?").toString()}
                  {m?.promotion ? `=${m.promotion}` : ""}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
