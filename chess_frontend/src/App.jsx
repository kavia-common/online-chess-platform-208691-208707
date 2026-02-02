import React from "react";

/**
 * Intentional crash-on-load bug:
 * This top-level throw happens as soon as this module is imported (i.e., on initial app load),
 * causing the React app to crash immediately.
 */
throw new Error("Intentional crash-on-load bug: chess_frontend crashes immediately on app load.");

// PUBLIC_INTERFACE
export default function App() {
  /** Root application component (unreachable due to intentional crash). */
  return (
    <main>
      <h1>Online Chess</h1>
      <p>If you see this, the intentional crash did not trigger.</p>
    </main>
  );
}
