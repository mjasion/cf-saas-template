import { createFileRoute, Link } from '@tanstack/react-router'
import { Sun, Moon, Check, ArrowLeft, Palette, Sparkles } from 'lucide-react'
import { themes, type ThemeDefinition } from '@/lib/themes'
import { useTheme, type ThemeMode } from '@/lib/use-theme'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LandingHeader } from '@/components/landing-header'
import { LogoBuilder } from '@/components/logo-builder'

export const Route = createFileRoute('/themes')({
  component: ThemesPage,
  head: () => ({
    meta: [
      { title: 'Themes - SaaS Template' },
      { name: 'description', content: 'Choose from 40 color themes with dark and light modes, and customize your app logo.' },
    ],
  }),
})

function ThemePreviewCard({ theme, currentThemeId, currentMode, onSelect }: {
  theme: ThemeDefinition
  currentThemeId: string
  currentMode: ThemeMode
  onSelect: (id: string) => void
}) {
  const isActive = theme.id === currentThemeId
  const colors = currentMode === 'light' ? theme.light : theme.dark

  return (
    <button
      onClick={() => onSelect(theme.id)}
      className={cn(
        'group relative rounded-2xl border p-5 text-left transition-all duration-200',
        'hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
        isActive
          ? 'ring-2 ring-primary border-primary'
          : 'border-border hover:border-primary/50',
      )}
    >
      {/* Color preview strip */}
      <div className="mb-4 flex gap-1.5 h-8 rounded-lg overflow-hidden">
        <div className="flex-1 rounded-l-md" style={{ background: colors.primary }} />
        <div className="flex-1" style={{ background: colors.accent }} />
        <div className="flex-1" style={{ background: colors.muted }} />
        <div className="flex-1 rounded-r-md" style={{ background: colors.background }} />
      </div>

      {/* Bento mini preview */}
      <div className="mb-4 grid grid-cols-3 gap-1 rounded-lg p-2" style={{ background: colors.background }}>
        <div className="col-span-2 h-6 rounded" style={{ background: colors.card, border: `1px solid ${colors.border}` }} />
        <div className="h-6 rounded" style={{ background: colors.card, border: `1px solid ${colors.border}` }} />
        <div className="h-6 rounded" style={{ background: colors.card, border: `1px solid ${colors.border}` }} />
        <div className="col-span-2 h-6 rounded" style={{ background: colors.primary, opacity: 0.8 }} />
      </div>

      {/* Text colors preview */}
      <div className="mb-3 space-y-1 rounded-lg p-2" style={{ background: colors.background }}>
        <div className="h-2 w-3/4 rounded-full" style={{ background: colors.foreground }} />
        <div className="h-2 w-1/2 rounded-full" style={{ background: colors.mutedForeground }} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">{theme.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{theme.description}</p>
        </div>
        {isActive && (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
            <Check className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
        )}
      </div>
    </button>
  )
}

function ThemesPage() {
  const { themeId, setThemeId, mode, toggleMode } = useTheme()

  return (
    <div className="min-h-svh">
      <LandingHeader />

      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-4">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Themes</h1>
              </div>
              <p className="text-muted-foreground">
                Choose from 40 handcrafted color palettes. Each theme supports dark and light modes.
              </p>
            </div>

            {/* Mode toggle */}
            <Button
              variant="outline"
              size="lg"
              onClick={toggleMode}
              className="shrink-0 gap-2"
            >
              {mode === 'dark' ? (
                <>
                  <Sun className="h-4 w-4" />
                  Switch to light
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  Switch to dark
                </>
              )}
            </Button>
          </div>

          {/* Theme grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {themes.map((theme) => (
              <ThemePreviewCard
                key={theme.id}
                theme={theme}
                currentThemeId={themeId}
                currentMode={mode}
                onSelect={setThemeId}
              />
            ))}
          </div>

          {/* Logo Builder */}
          <div className="mt-16 mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Logo Builder</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Customize your app logo. Pick an icon, background, and shape. Changes apply site-wide and persist in your browser.
            </p>
            <LogoBuilder />
          </div>

          {/* Accessibility note */}
          <div className="mt-12 rounded-2xl border border-border bg-card p-6">
            <h2 className="font-semibold mb-2">Accessibility</h2>
            <p className="text-sm text-muted-foreground">
              All themes are designed with WCAG contrast guidelines in mind.
              Text colors maintain at least 4.5:1 contrast ratio against their backgrounds.
              The selected theme and mode are saved to your browser and persist across sessions.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Built with Cloudflare Workers, TanStack Start, and Hono.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/themes" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Themes
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
