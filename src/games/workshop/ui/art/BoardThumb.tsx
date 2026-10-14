import { boardNumber, boardSizeById, type OwnedBoard } from "../../core";
import { BoardSurface } from "./BoardArt";

interface BoardThumbProps {
  readonly board: OwnedBoard;
  readonly className?: string | undefined;
}

export function BoardThumb({ board, className }: BoardThumbProps) {
  const size = boardSizeById(board.size);
  return (
    <svg
      className={className}
      viewBox={`-1 -1 ${size.width + 2} ${size.height + 2}`}
      aria-hidden="true"
      focusable="false"
    >
      <BoardSurface
        woodId={board.woodId}
        width={size.width}
        height={size.height}
        knots={board.knots}
        seed={boardNumber(board.id) * 97}
      />
    </svg>
  );
}
