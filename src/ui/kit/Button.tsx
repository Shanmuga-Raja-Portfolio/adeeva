import { type ButtonHTMLAttributes, type ReactNode, useId } from "react";
import { Icon, type IconName } from "./IconSet";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: ButtonVariant | undefined;
  size?: ButtonSize | undefined;
  icon?: IconName | undefined;
  block?: boolean | undefined;
  disabledReason?: string | undefined;
  showReason?: boolean | undefined;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  block = false,
  disabledReason,
  showReason = false,
  disabled,
  className,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  const reasonId = useId();
  const blocked = disabled === true || (disabledReason !== undefined && disabledReason.length > 0);
  const reasonVisible = blocked && showReason && disabledReason !== undefined && disabledReason.length > 0;
  const classes = [
    "ad-button",
    `ad-button--${variant}`,
    size === "md" ? "" : `ad-button--${size}`,
    block ? "ad-button--block" : "",
    className ?? "",
  ]
    .filter((name) => name.length > 0)
    .join(" ");
  const iconSize = size === "lg" ? 22 : size === "sm" ? 16 : 18;
  const button = (
    <button
      {...rest}
      type={type}
      className={classes}
      disabled={blocked}
      title={blocked && disabledReason ? disabledReason : rest.title}
      aria-describedby={reasonVisible ? reasonId : rest["aria-describedby"]}
    >
      {icon ? <Icon name={icon} size={iconSize} /> : null}
      {children}
    </button>
  );
  if (!reasonVisible) return button;
  return (
    <span className={block ? "ad-button-wrap ad-button--block" : "ad-button-wrap"}>
      {button}
      <small id={reasonId} className="ad-button-reason">
        <Icon name="lock" size={14} />
        {disabledReason}
      </small>
    </span>
  );
}
