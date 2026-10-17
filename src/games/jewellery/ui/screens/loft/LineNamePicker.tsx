import { LINE_NAMES, type LineNameId } from "../../../content/lineName";
import { ChoiceGrid } from "../bench/ChoiceGrid";
import "./loft.css";

export interface LineNamePickerProps {
  readonly value: LineNameId | null;
  readonly onChange: (lineNameId: LineNameId) => void;
}

export function LineNamePicker({ value, onChange }: LineNamePickerProps) {
  return (
    <div className="jb-line-picker">
      <p className="jb-line-picker__lead">Pick a name for your line. It goes on every tag and lantern.</p>
      <ChoiceGrid<LineNameId>
        label="Line name"
        className="jb-line-names"
        value={value}
        onChange={onChange}
        choices={LINE_NAMES.map((line) => ({
          value: line.id,
          label: line.name,
          content: (
            <span className="jb-name-plate" data-testid={`line-name-${line.id}`}>
              <span className="jb-name-plate__pin" aria-hidden="true" />
              {line.name}
            </span>
          ),
        }))}
      />
    </div>
  );
}
