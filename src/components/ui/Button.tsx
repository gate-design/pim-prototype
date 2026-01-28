/**
 * Button — PIM Design System (Nest UI Kit)
 * Use intent, variant, and size for consistent styling across all pages.
 * @see docs/design-system.md
 */

import "./Button.css";

export type ButtonIntent = "brand" | "negative" | "positive";
export type ButtonVariant = "primary" | "secondary" | "alt" | "ghost";
export type ButtonSize = "large" | "medium" | "small" | "xsmall";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  intent?: ButtonIntent;
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
  /** Optional: pass a React node (e.g. icon) before children */
  leftIcon?: React.ReactNode;
  /** Optional: pass a React node (e.g. icon) after children */
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const intentClass: Record<ButtonIntent, string> = {
  brand: "btn--brand",
  negative: "btn--negative",
  positive: "btn--positive",
};

const variantClass: Record<ButtonVariant, string> = {
  primary: "btn--primary",
  secondary: "btn--secondary",
  alt: "btn--alt",
  ghost: "btn--ghost",
};

const sizeClass: Record<ButtonSize, string> = {
  large: "btn--large",
  medium: "btn--medium",
  small: "btn--small",
  xsmall: "btn--xsmall",
};

export function Button({
  intent = "brand",
  variant = "primary",
  size = "medium",
  iconOnly = false,
  leftIcon,
  rightIcon,
  children,
  className = "",
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  const classes = [
    "btn",
    intentClass[intent],
    variantClass[variant],
    sizeClass[size],
    iconOnly ? "btn--icon-only" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      aria-disabled={disabled}
      {...rest}
    >
      {leftIcon && <span className="btn__icon btn__icon--left" aria-hidden>{leftIcon}</span>}
      {children && <span className="btn__label">{children}</span>}
      {rightIcon && <span className="btn__icon btn__icon--right" aria-hidden>{rightIcon}</span>}
    </button>
  );
}
