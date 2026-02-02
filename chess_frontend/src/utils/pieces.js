/**
 * Utilities for rendering realistic chess pieces via SVG assets from /public.
 */

/**
 * Map internal piece codes to { color, role }.
 * Supports: "P","N","B","R","Q","K" (white) and lowercase for black.
 */
function parsePieceCode(piece) {
  if (!piece || typeof piece !== "string") return null;

  const isUpper = piece === piece.toUpperCase();
  const color = isUpper ? "white" : "black";
  const role = piece.toLowerCase();

  if (!["p", "n", "b", "r", "q", "k"].includes(role)) return null;
  return { color, role };
}

function roleToName(role) {
  const map = {
    p: "pawn",
    n: "knight",
    b: "bishop",
    r: "rook",
    q: "queen",
    k: "king",
  };
  return map[role] || "";
}

// PUBLIC_INTERFACE
export function pieceToAssetSrc(piece) {
  /** Returns a public URL (under /public) for the piece SVG asset, or empty string. */
  const parsed = parsePieceCode(piece);
  if (!parsed) return "";
  const prefix = parsed.color === "white" ? "w" : "b";
  const letter = parsed.role.toUpperCase();
  return `/pieces/${prefix}${letter}.svg`;
}

// PUBLIC_INTERFACE
export function pieceToAlt(piece) {
  /** Returns a human-readable label for screen readers. */
  const parsed = parsePieceCode(piece);
  if (!parsed) return "";
  const color = parsed.color;
  const name = roleToName(parsed.role);
  return `${color} ${name}`;
}
