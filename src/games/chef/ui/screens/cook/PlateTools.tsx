import { Icon } from "../../../../../ui/kit/IconSet";

export interface PlateToolsProps {
  readonly name: string;
  readonly onTurn: () => void;
  readonly onSmaller: () => void;
  readonly onBigger: () => void;
  readonly onRemove: () => void;
}

export function PlateTools({ name, onTurn, onSmaller, onBigger, onRemove }: PlateToolsProps) {
  return (
    <div className="ck-plate__tools" role="group" aria-label={`Change the ${name}`}>
      <button type="button" className="ck-plate__tool" onClick={onTurn}>
        <Icon name="turn" size={22} /> Turn
      </button>
      <button
        type="button"
        className="ck-plate__tool ck-plate__tool--round"
        aria-label="Smaller"
        onClick={onSmaller}
      >
        <Icon name="minus" size={22} />
      </button>
      <button
        type="button"
        className="ck-plate__tool ck-plate__tool--round"
        aria-label="Bigger"
        onClick={onBigger}
      >
        <Icon name="plus" size={22} />
      </button>
      <button type="button" className="ck-plate__tool ck-plate__tool--remove" onClick={onRemove}>
        <Icon name="close" size={20} /> Take off
      </button>
    </div>
  );
}
