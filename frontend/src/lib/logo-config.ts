import type { LucideIcon } from 'lucide-react'
import {
  Zap, Rocket, Flame, Crown, Shield, Target, Compass, Gem,
  Hexagon, Pentagon, Triangle, Diamond, Star, Heart, Sparkles,
  Globe, Cloud, Sun, Moon, Bolt,
  BarChart3, TrendingUp, PieChart, Activity,
  Code, Terminal, Cpu, Database, Server,
  Users, Building2, Briefcase, Store, CreditCard,
  Layers, Box, Puzzle, Workflow, CircuitBoard,
  Palette, Feather, Leaf, Anchor,
} from 'lucide-react'

export type LogoShape = 'rounded-lg' | 'rounded-full' | 'rounded-2xl'
export type LogoBgType = 'gradient' | 'solid' | 'theme'

export interface LogoConfig {
  icon: string
  bgType: LogoBgType
  bgValue: string
  shape: LogoShape
  iconColor: string
  text: string
}

export const DEFAULT_LOGO_CONFIG: LogoConfig = {
  icon: 'Zap',
  bgType: 'gradient',
  bgValue: 'linear-gradient(135deg, #6363f1, #23f0c3)',
  shape: 'rounded-lg',
  iconColor: '#ffffff',
  text: 'SaaS',
}

export interface IconEntry {
  name: string
  icon: LucideIcon
  category: 'abstract' | 'business' | 'tech' | 'nature'
}

export const CURATED_ICONS: IconEntry[] = [
  { name: 'Zap', icon: Zap, category: 'abstract' },
  { name: 'Rocket', icon: Rocket, category: 'abstract' },
  { name: 'Flame', icon: Flame, category: 'abstract' },
  { name: 'Crown', icon: Crown, category: 'abstract' },
  { name: 'Shield', icon: Shield, category: 'abstract' },
  { name: 'Target', icon: Target, category: 'abstract' },
  { name: 'Compass', icon: Compass, category: 'abstract' },
  { name: 'Gem', icon: Gem, category: 'abstract' },
  { name: 'Hexagon', icon: Hexagon, category: 'abstract' },
  { name: 'Pentagon', icon: Pentagon, category: 'abstract' },
  { name: 'Triangle', icon: Triangle, category: 'abstract' },
  { name: 'Diamond', icon: Diamond, category: 'abstract' },
  { name: 'Star', icon: Star, category: 'abstract' },
  { name: 'Heart', icon: Heart, category: 'abstract' },
  { name: 'Sparkles', icon: Sparkles, category: 'abstract' },
  { name: 'Bolt', icon: Bolt, category: 'abstract' },
  { name: 'BarChart3', icon: BarChart3, category: 'business' },
  { name: 'TrendingUp', icon: TrendingUp, category: 'business' },
  { name: 'PieChart', icon: PieChart, category: 'business' },
  { name: 'Activity', icon: Activity, category: 'business' },
  { name: 'Users', icon: Users, category: 'business' },
  { name: 'Building2', icon: Building2, category: 'business' },
  { name: 'Briefcase', icon: Briefcase, category: 'business' },
  { name: 'Store', icon: Store, category: 'business' },
  { name: 'CreditCard', icon: CreditCard, category: 'business' },
  { name: 'Code', icon: Code, category: 'tech' },
  { name: 'Terminal', icon: Terminal, category: 'tech' },
  { name: 'Cpu', icon: Cpu, category: 'tech' },
  { name: 'Database', icon: Database, category: 'tech' },
  { name: 'Server', icon: Server, category: 'tech' },
  { name: 'Layers', icon: Layers, category: 'tech' },
  { name: 'Box', icon: Box, category: 'tech' },
  { name: 'Puzzle', icon: Puzzle, category: 'tech' },
  { name: 'Workflow', icon: Workflow, category: 'tech' },
  { name: 'CircuitBoard', icon: CircuitBoard, category: 'tech' },
  { name: 'Globe', icon: Globe, category: 'nature' },
  { name: 'Cloud', icon: Cloud, category: 'nature' },
  { name: 'Sun', icon: Sun, category: 'nature' },
  { name: 'Moon', icon: Moon, category: 'nature' },
  { name: 'Palette', icon: Palette, category: 'nature' },
  { name: 'Feather', icon: Feather, category: 'nature' },
  { name: 'Leaf', icon: Leaf, category: 'nature' },
  { name: 'Anchor', icon: Anchor, category: 'nature' },
]

export interface GradientPreset {
  id: string
  name: string
  value: string
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  { id: 'indigo-teal', name: 'Indigo Teal', value: 'linear-gradient(135deg, #6363f1, #23f0c3)' },
  { id: 'violet-pink', name: 'Violet Pink', value: 'linear-gradient(135deg, #a78bfa, #f472b6)' },
  { id: 'ocean-blue', name: 'Ocean Blue', value: 'linear-gradient(135deg, #38bdf8, #818cf8)' },
  { id: 'sunset-amber', name: 'Sunset Amber', value: 'linear-gradient(135deg, #fb923c, #f87171)' },
  { id: 'forest-green', name: 'Forest Green', value: 'linear-gradient(135deg, #22c55e, #a3e635)' },
  { id: 'cherry-rose', name: 'Cherry Rose', value: 'linear-gradient(135deg, #ec4899, #f472b6)' },
  { id: 'cyber-neon', name: 'Cyber Neon', value: 'linear-gradient(135deg, #00ff88, #00ccff)' },
  { id: 'sapphire-gold', name: 'Sapphire Gold', value: 'linear-gradient(135deg, #6366f1, #eab308)' },
  { id: 'lavender', name: 'Lavender', value: 'linear-gradient(135deg, #e879f9, #818cf8)' },
  { id: 'mars-red', name: 'Mars Red', value: 'linear-gradient(135deg, #dc5a32, #ef4444)' },
  { id: 'arctic-ice', name: 'Arctic Ice', value: 'linear-gradient(135deg, #7dd3fc, #0ea5e9)' },
  { id: 'carbon-steel', name: 'Carbon Steel', value: 'linear-gradient(135deg, #71717a, #18181b)' },
]

const LOGO_STORAGE_KEY = 'app-logo-config'

export function getLogoConfig(): LogoConfig {
  try {
    const raw = localStorage.getItem(LOGO_STORAGE_KEY)
    if (raw) {
      return { ...DEFAULT_LOGO_CONFIG, ...JSON.parse(raw) }
    }
  } catch {}
  return DEFAULT_LOGO_CONFIG
}

export function setLogoConfig(config: LogoConfig): void {
  try {
    localStorage.setItem(LOGO_STORAGE_KEY, JSON.stringify(config))
  } catch {}
}

export function clearLogoConfig(): void {
  try {
    localStorage.removeItem(LOGO_STORAGE_KEY)
  } catch {}
}

export function getIconByName(name: string): LucideIcon | undefined {
  return CURATED_ICONS.find((e) => e.name === name)?.icon
}
