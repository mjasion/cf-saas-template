import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const sizeConfig = {
  sm: {
    box: "h-8 w-8",
    icon: "h-4 w-4",
    text: "text-lg",
  },
  md: {
    box: "h-10 w-10",
    icon: "h-6 w-6",
    text: "text-2xl",
  },
  lg: {
    box: "h-16 w-16",
    icon: "h-8 w-8",
    text: "text-4xl",
  },
} as const;

interface LogoMarkProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function LogoMark({ size = "md", showText = true, className }: LogoMarkProps) {
  const config = sizeConfig[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#6363f1] to-[#23f0c3]",
          config.box
        )}
      >
        <Zap className={cn("text-white", config.icon)} />
      </div>
      {showText && (
        <span
          className={cn(
            "font-bold bg-gradient-to-r from-[#6363f1] to-[#23f0c3] bg-clip-text text-transparent",
            config.text
          )}
        >
          SaaS
        </span>
      )}
    </div>
  );
}

interface LogoProps extends LogoMarkProps {
  linkTo?: string;
}

export function Logo({ linkTo = "/", ...props }: LogoProps) {
  return (
    <Link to={linkTo}>
      <LogoMark {...props} />
    </Link>
  );
}
