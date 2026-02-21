import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Zap, Shield, Globe, Database, Layout, Rocket, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LandingHeader } from '@/components/landing-header'
import { BentoGrid, BentoCard } from '@/components/bento'

export const Route = createFileRoute('/')({ component: LandingPage })

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built on Cloudflare Workers for sub-millisecond cold starts and global edge deployment.',
  },
  {
    icon: Shield,
    title: 'Secure by Default',
    description: 'JWT authentication, rate limiting, and secure cookie handling out of the box.',
  },
  {
    icon: Globe,
    title: 'Global Edge Network',
    description: 'Deployed to 300+ locations worldwide. Your app is always close to your users.',
  },
  {
    icon: Database,
    title: 'Built-in Data Layer',
    description: 'Cloudflare D1 for SQL with Drizzle ORM, KV for sessions. Everything you need.',
  },
  {
    icon: Layout,
    title: 'Modern UI Stack',
    description: 'TanStack Start, React 19, Tailwind CSS 4, and shadcn/ui for beautiful interfaces.',
  },
  {
    icon: Rocket,
    title: 'Ship in Minutes',
    description: 'From git clone to production in minutes. Authentication, dashboard, and CI/CD included.',
  },
]

function LandingPage() {
  return (
    <div className="min-h-svh">
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28" style={{ background: 'var(--gradient-hero)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-[var(--glass-background)] px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
              <Zap className="h-4 w-4 text-primary" />
              Open-source SaaS template
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              <span className="block">Build Your SaaS</span>
              <span className="block bg-gradient-to-r from-[#6363f1] via-[#3498ea] to-[#40dfa3] bg-clip-text text-transparent">
                On the Edge
              </span>
            </h1>
            <p className="mt-6 text-lg text-[var(--color-text-secondary)] sm:text-xl max-w-2xl mx-auto">
              A production-ready template powered by Cloudflare Workers, TanStack Start, and Hono.
              Authentication, dashboard, and deployment — all wired up.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/register">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/login">
                  Log in
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to ship</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Stop rebuilding the same infrastructure. Start with a solid foundation.
            </p>
          </motion.div>

          <BentoGrid columns={3}>
            {features.map((feature, i) => (
              <BentoCard key={feature.title} index={i} interactive>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </BentoCard>
            ))}
          </BentoGrid>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 sm:py-28 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Up and running in three steps</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Clone, configure, deploy. It really is that simple.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Clone the repo', description: 'Fork or clone the template and install dependencies with pnpm.' },
              { step: '2', title: 'Configure services', description: 'Set up your Cloudflare D1 database and environment variables.' },
              { step: '3', title: 'Deploy globally', description: 'Run a single command to deploy to Cloudflare\'s global network.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Built with Cloudflare Workers, TanStack Start, and Hono.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
