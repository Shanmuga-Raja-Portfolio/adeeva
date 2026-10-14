import { Card } from "../../../../../ui/kit/Card";
import { boardSizeById, woodById, type GameState } from "../../../core";
import { BoardThumb } from "../../art/BoardThumb";

export function BoardRack({ state }: { readonly state: GameState }) {
  return (
    <Card title="Board rack" eyebrow={`${state.boards.length} on the rack`} className="ww-hub-card">
      {state.boards.length === 0 ? (
        <p className="ww-muted">Boards you buy at Pell's Timber Yard wait here until you saw them.</p>
      ) : (
        <ul className="ww-rack">
          {state.boards.map((board) => (
            <li key={board.id} className="ww-rack__board">
              <BoardThumb board={board} className={`ww-rack__art ww-rack__art--${board.size}`} />
              <span>
                {woodById(board.woodId).name} · {boardSizeById(board.size).name}
                {board.spare ? " · spare piece" : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
