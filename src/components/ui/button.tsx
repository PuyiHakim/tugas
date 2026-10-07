import { cloneElement, forwardRef, isValidElement, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "quiet" | "danger"; size?: "default" | "small"; icon?: ReactNode; asChild?: boolean };
export function Button({ variant = "primary", size = "default", icon, className = "", children, asChild = false, ...props }: ButtonProps) {
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string; children?: ReactNode }>;
    return cloneElement(child, { className: `button button--${variant} button--${size} ${className} ${child.props.className ?? ""}`, children: <>{icon}{child.props.children}</> });
  }
  return <button className={`button button--${variant} button--${size} ${className}`} {...props}>{icon}{children}</button>;
}

export const IconButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function IconButton({ className = "", children, ...props }, ref) {
  return <button ref={ref} className={`icon-button ${className}`} {...props}>{children}</button>;
});
