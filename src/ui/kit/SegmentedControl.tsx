import { Icon, type IconName } from "./IconSet";
import { useRovingRadio } from "./useRovingRadio";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: IconName | undefined;
  disabled?: boolean | undefined;
}

export interface SegmentedControlProps<T extends string> {
  label: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string | undefined;
}

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  const roving = useRovingRadio(options, value, onChange);

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={className ? `ad-segmented ${className}` : "ad-segmented"}
    >
      {options.map((option, index) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            ref={roving.buttonRef(index)}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={roving.tabIndex(index)}
            disabled={option.disabled === true}
            className="ad-segmented__option"
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => roving.handleKey(event, index)}
          >
            {option.icon ? <Icon name={option.icon} size={16} /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
