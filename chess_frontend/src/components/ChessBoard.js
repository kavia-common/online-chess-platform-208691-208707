import React from "react";
import { isDarkSquare, pieceToGlyph, toSquare } from "../utils/chessboard";

/**
 * Board is rendered from White's perspective:
 * - rank 8 at top to rank 1 at bottom
 * - file a at left to file h at right
 */
function buildBoardSquares() {
  const squares = [];
  for (let rank = 7; rank >= 0; rank -= 1) {
    for (let file = 0; file < 8; file += 1) {
      squares.push(toSquare(file, rank));
    }
  }
  return squares;
}

const BOARD_SQUARES = buildBoardSquares();

// PUBLIC_INTERFACE
export default function ChessBoard({
  position,
  selectedSquare,
  lastMove,
  onSquareClick,
  disabled,
}) {
  /** Retro-styled chessboard. position is an object mapping square -> piece code. */
  return (
    <div className="boardFrame" aria-label="Chessboard">
      <div className="boardGrid" role="grid" aria-disabled={disabled ? "true" : "false"}>
        {BOARD_SQUARES.map((sq) => {
          const piece = position?.[sq] || "";
          const glyph = pieceToGlyph(piece);

          const dark = isDarkSquare(sq);
          const isSelected = selectedSquare === sq;
          const isFrom = lastMove?.from === sq;
          const isTo = lastMove?.to === sq;

          const classes = [
            "square",
            dark ? "squareDark" : "squareLight",
            isSelected ? "squareSelected" : "",
            isFrom ? "squareLastFrom" : "",
            isTo ? "squareLastTo" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={sq}
              type="button"
              className={classes}
              onClick={() => onSquareClick(sq)}
              disabled={disabled}
              role="gridcell"
              aria-label={`${sq}${piece ? ` ${piece}` : ""}`}
            >
              <span className="piece" aria-hidden="true">
                {glyph}
              </span>
              <span className="squareLabel" aria-hidden="true">
                {sq}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
