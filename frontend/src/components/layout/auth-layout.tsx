import { Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

function AuthPanelSvg() {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-40"
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <line x1="300" y1="80" x2="300" y2="520" stroke="url(#lv)" strokeWidth="1" />
      <line x1="80" y1="300" x2="520" y2="300" stroke="url(#lh)" strokeWidth="1" />
      <line x1="145" y1="145" x2="455" y2="455" stroke="url(#ld1)" strokeWidth="1" />
      <line x1="455" y1="145" x2="145" y2="455" stroke="url(#ld2)" strokeWidth="1" />
      <circle cx="300" cy="300" r="140" fill="none" stroke="white" strokeWidth="1.5" />
      <defs>
        <linearGradient id="lv" x1="300" y1="80" x2="300" y2="520" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.2" stopColor="white" />
          <stop offset="0.8" stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lh" x1="80" y1="300" x2="520" y2="300" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.2" stopColor="white" />
          <stop offset="0.8" stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ld1" x1="145" y1="145" x2="455" y2="455" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.2" stopColor="white" />
          <stop offset="0.8" stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ld2" x1="455" y1="145" x2="145" y2="455" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.2" stopColor="white" />
          <stop offset="0.8" stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center relative bg-background px-4 py-12">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-primary/15 blur-[100px] pointer-events-none" />
      <div className="relative w-full max-w-sm md:max-w-4xl">
        <div className="mb-6 flex justify-center md:hidden">
          <Logo size="md" />
        </div>

        <Card className="overflow-hidden rounded-2xl border border-border shadow-xl">
          <div className="grid md:grid-cols-2">
            <div className="px-8 py-10">
              <div className="mb-8 hidden justify-center md:flex">
                <Logo size="md" />
              </div>

              <h1 className="mb-2 text-center text-3xl font-bold tracking-tight">
                {title}
              </h1>
              <p className="mb-8 text-center text-sm text-muted-foreground">
                {description}
              </p>

              {children}
            </div>

            <div className="relative hidden overflow-hidden rounded-r-2xl md:block" style={{ background: 'var(--gradient-primary)' }}>
              <AuthPanelSvg />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Shield className="h-10 w-10 text-white" />
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 p-8 pb-12">
                <h2 className="text-lg font-semibold text-white">
                  Secure Authentication
                </h2>
                <p className="max-w-xs text-center text-sm text-white/80">
                  Your account is protected with industry-standard encryption
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
