import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Logo } from "@/components/ui/logo";

export function LandingHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          <Logo size="md" />

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-[var(--color-text-secondary)] hover:text-foreground font-medium transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-[var(--color-text-secondary)] hover:text-foreground font-medium transition-colors"
            >
              How It Works
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" className="text-[var(--color-text-secondary)] hover:text-foreground">
                Log in
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-[#23f0c3] text-[#030520] hover:bg-[#1dd4ad]">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
