"use client";

import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated";
  padding?: "none" | "default" | "large";
}

function Card({
  className = "",
  variant = "default",
  padding = "default",
  children,
  ...props
}: CardProps) {
  const baseStyles = "rounded-2xl";

  const variants = {
    default: "bg-bg-secondary",
    elevated: "bg-white shadow-sm border border-border",
  };

  const paddings = {
    none: "",
    default: "p-6",
    large: "p-8",
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card };
