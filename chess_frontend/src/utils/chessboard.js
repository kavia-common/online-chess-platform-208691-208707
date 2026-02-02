/**
 * Convert file/rank to algebraic coordinate (e.g. file=0, rank=0 -> a1).
 */
export function toSquare(fileIndex, rankIndex) {
  const fileChar = String.fromCharCode("a".charCodeAt(0) + fileIndex);
  const rankChar = String(rankIndex + 1);
  return `${fileChar}${rankChar}`;
}

/**
 * Convert algebraic (e.g. "e4") to indices: { fileIndex: 4, rankIndex: 3 }.
 */
export function fromSquare(square) {
  if (!square || typeof square !== "string" || square.length < 2) return null;
  const fileChar = square[0].toLowerCase();
  const rankChar = square[1];
  const fileIndex = fileChar.charCodeAt(0) - "a".charCodeAt(0);
  const rankIndex = Number(rankChar) - 1;
  if (Number.isNaN(rankIndex) || fileIndex < 0 || fileIndex > 7 || rankIndex < 0 || rankIndex > 7) {
    return null;
  }
  return { fileIndex, rankIndex };
}

/**
 * Chess unicode pieces.
 * Accepts common encodings:
 * - "P","N","B","R","Q","K" for white
 * - "p","n","b","r","q","k" for black
 */
export function pieceToGlyph(piece) {
  const map = {
    // White
    P: "♙",
    N: "♘",
    B: "♗",
    R: "♖",
    Q: "♕",
    K: "♔",
    // Black
    p: "♟",
    n: "♞",
    b: "♝",
    r: "♜",
    q: "♛",
    k: "♚",
  };
  return map[piece] || "";
}

/**
 * Build a fallback starting position mapping square -> piece code.
 * This is used when backend endpoints are not yet implemented.
 */
export function buildFallbackStartPosition() {
  const pieces = {};

  // Pawns
  for (let f = 0; f < 8; f += 1) {
    pieces[toSquare(f, 1)] = "P";
    pieces[toSquare(f, 6)] = "p";
  }

  // Rooks
  pieces["a1"] = "R";
  pieces["h1"] = "R";
  pieces["a8"] = "r";
  pieces["h8"] = "r";

  // Knights
  pieces["b1"] = "N";
  pieces["g1"] = "N";
  pieces["b8"] = "n";
  pieces["g8"] = "n";

  // Bishops
  pieces["c1"] = "B";
  pieces["f1"] = "B";
  pieces["c8"] = "b";
  pieces["f8"] = "b";

  // Queens
  pieces["d1"] = "Q";
  pieces["d8"] = "q";

  // Kings
  pieces["e1"] = "K";
  pieces["e8"] = "k";

  return pieces;
}

/**
 * Determines whether a square is light or dark.
 * Convention: a1 is dark in most UIs; we follow that.
 */
export function isDarkSquare(square) {
  const idx = fromSquare(square);
  if (!idx) return false;
  return (idx.fileIndex + idx.rankIndex) % 2 === 0;
}
