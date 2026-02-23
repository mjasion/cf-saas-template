import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLogo } from "@/lib/use-logo";
import { getIconByName, toKebabCase } from "@/lib/logo-config";

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

function resolveLogoBg(bgType: string, bgValue: string): React.CSSProperties {
  if (bgType === "theme") return { background: "var(--gradient-primary)" };
  return { background: bgValue };
}

function resolveTextBg(bgType: string, bgValue: string): React.CSSProperties {
  if (bgType === "theme") return { backgroundImage: "var(--gradient-primary)" };
  if (bgType === "solid") return { backgroundImage: `linear-gradient(${bgValue}, ${bgValue})` };
  return { backgroundImage: bgValue };
}

export function LogoMark({ size = "md", showText = true, className }: LogoMarkProps) {
  const sizeConf = sizeConfig[size];
  const { config: logoConfig } = useLogo();
  const CuratedIcon = getIconByName(logoConfig.icon);
  const [LazyIcon, setLazyIcon] = useState<LucideIcon | null>(null);

  useEffect(() => {
    if (!CuratedIcon && logoConfig.icon) {
      const cleanName = logoConfig.icon.replace(/^Lucide/, '');
      const kebab = toKebabCase(cleanName);
      import(`../../../node_modules/lucide-react/dist/esm/icons/${kebab}.js`)
        .then((mod) => setLazyIcon(() => mod.default))
        .catch(() => setLazyIcon(null));
    } else {
      setLazyIcon(null);
    }
  }, [logoConfig.icon, CuratedIcon]);

  const IconComponent = CuratedIcon || LazyIcon || Zap;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center",
          logoConfig.shape,
          sizeConf.box,
        )}
        style={resolveLogoBg(logoConfig.bgType, logoConfig.bgValue)}
      >
        <IconComponent
          className={sizeConf.icon}
          style={{ color: logoConfig.iconColor }}
        />
      </div>
      {showText && (
        <span
          className={cn(
            "font-bold bg-clip-text text-transparent",
            sizeConf.text,
          )}
          style={resolveTextBg(logoConfig.bgType, logoConfig.bgValue)}
        >
          {logoConfig.text || "SaaS"}
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
