import type { LucideIcon } from 'lucide-react'
import {
  // Abstract
  Zap, Rocket, Flame, Crown, Shield, Target, Compass, Gem,
  Hexagon, Pentagon, Triangle, Diamond, Star, Heart, Sparkles, Bolt,
  // Business
  BarChart3, TrendingUp, PieChart, Activity,
  Users, Building2, Briefcase, Store, CreditCard, Landmark, Handshake, Receipt,
  // Tech
  Code, Terminal, Cpu, Database, Server,
  Layers, Box, Puzzle, Workflow, CircuitBoard, Wifi, Binary, Globe,
  // Nature
  Cloud, Sun, Moon, Leaf, Feather, TreePine, Mountain, Waves, Flower2, Snowflake,
  // Communication
  Mail, MessageCircle, Phone, Send, Bell, AtSign, Megaphone, Radio,
  // Security
  Lock, Key, Fingerprint, Eye, ShieldCheck, ScanFace, KeyRound, LockKeyhole,
  // Media
  Camera, Image, Music, Video, Headphones, Mic, Film, Palette,
  // Travel
  Plane, Car, MapPin, Navigation, Train, Ship, Bike, Luggage,
  // Food
  Coffee, Pizza, Apple, Cake, UtensilsCrossed, Wine, Cherry, IceCreamCone,
  // Home
  Home, Lamp, DoorOpen, Sofa, Bath, Armchair, Bed, Anchor,
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

export type IconCategory = 'abstract' | 'business' | 'tech' | 'nature' | 'communication' | 'security' | 'media' | 'travel' | 'food' | 'home'

export interface IconEntry {
  name: string
  icon: LucideIcon
  category: IconCategory
}

export const CURATED_ICONS: IconEntry[] = [
  // Abstract (16)
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
  // Business (12)
  { name: 'BarChart3', icon: BarChart3, category: 'business' },
  { name: 'TrendingUp', icon: TrendingUp, category: 'business' },
  { name: 'PieChart', icon: PieChart, category: 'business' },
  { name: 'Activity', icon: Activity, category: 'business' },
  { name: 'Users', icon: Users, category: 'business' },
  { name: 'Building2', icon: Building2, category: 'business' },
  { name: 'Briefcase', icon: Briefcase, category: 'business' },
  { name: 'Store', icon: Store, category: 'business' },
  { name: 'CreditCard', icon: CreditCard, category: 'business' },
  { name: 'Landmark', icon: Landmark, category: 'business' },
  { name: 'Handshake', icon: Handshake, category: 'business' },
  { name: 'Receipt', icon: Receipt, category: 'business' },
  // Tech (13)
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
  { name: 'Wifi', icon: Wifi, category: 'tech' },
  { name: 'Binary', icon: Binary, category: 'tech' },
  { name: 'Globe', icon: Globe, category: 'tech' },
  // Nature (10)
  { name: 'Cloud', icon: Cloud, category: 'nature' },
  { name: 'Sun', icon: Sun, category: 'nature' },
  { name: 'Moon', icon: Moon, category: 'nature' },
  { name: 'Leaf', icon: Leaf, category: 'nature' },
  { name: 'Feather', icon: Feather, category: 'nature' },
  { name: 'TreePine', icon: TreePine, category: 'nature' },
  { name: 'Mountain', icon: Mountain, category: 'nature' },
  { name: 'Waves', icon: Waves, category: 'nature' },
  { name: 'Flower2', icon: Flower2, category: 'nature' },
  { name: 'Snowflake', icon: Snowflake, category: 'nature' },
  // Communication (8)
  { name: 'Mail', icon: Mail, category: 'communication' },
  { name: 'MessageCircle', icon: MessageCircle, category: 'communication' },
  { name: 'Phone', icon: Phone, category: 'communication' },
  { name: 'Send', icon: Send, category: 'communication' },
  { name: 'Bell', icon: Bell, category: 'communication' },
  { name: 'AtSign', icon: AtSign, category: 'communication' },
  { name: 'Megaphone', icon: Megaphone, category: 'communication' },
  { name: 'Radio', icon: Radio, category: 'communication' },
  // Security (8)
  { name: 'Lock', icon: Lock, category: 'security' },
  { name: 'Key', icon: Key, category: 'security' },
  { name: 'Fingerprint', icon: Fingerprint, category: 'security' },
  { name: 'Eye', icon: Eye, category: 'security' },
  { name: 'ShieldCheck', icon: ShieldCheck, category: 'security' },
  { name: 'ScanFace', icon: ScanFace, category: 'security' },
  { name: 'KeyRound', icon: KeyRound, category: 'security' },
  { name: 'LockKeyhole', icon: LockKeyhole, category: 'security' },
  // Media (8)
  { name: 'Camera', icon: Camera, category: 'media' },
  { name: 'Image', icon: Image, category: 'media' },
  { name: 'Music', icon: Music, category: 'media' },
  { name: 'Video', icon: Video, category: 'media' },
  { name: 'Headphones', icon: Headphones, category: 'media' },
  { name: 'Mic', icon: Mic, category: 'media' },
  { name: 'Film', icon: Film, category: 'media' },
  { name: 'Palette', icon: Palette, category: 'media' },
  // Travel (8)
  { name: 'Plane', icon: Plane, category: 'travel' },
  { name: 'Car', icon: Car, category: 'travel' },
  { name: 'MapPin', icon: MapPin, category: 'travel' },
  { name: 'Navigation', icon: Navigation, category: 'travel' },
  { name: 'Train', icon: Train, category: 'travel' },
  { name: 'Ship', icon: Ship, category: 'travel' },
  { name: 'Bike', icon: Bike, category: 'travel' },
  { name: 'Luggage', icon: Luggage, category: 'travel' },
  // Food (8)
  { name: 'Coffee', icon: Coffee, category: 'food' },
  { name: 'Pizza', icon: Pizza, category: 'food' },
  { name: 'Apple', icon: Apple, category: 'food' },
  { name: 'Cake', icon: Cake, category: 'food' },
  { name: 'UtensilsCrossed', icon: UtensilsCrossed, category: 'food' },
  { name: 'Wine', icon: Wine, category: 'food' },
  { name: 'Cherry', icon: Cherry, category: 'food' },
  { name: 'IceCreamCone', icon: IceCreamCone, category: 'food' },
  // Home (8)
  { name: 'Home', icon: Home, category: 'home' },
  { name: 'Lamp', icon: Lamp, category: 'home' },
  { name: 'DoorOpen', icon: DoorOpen, category: 'home' },
  { name: 'Sofa', icon: Sofa, category: 'home' },
  { name: 'Bath', icon: Bath, category: 'home' },
  { name: 'Armchair', icon: Armchair, category: 'home' },
  { name: 'Bed', icon: Bed, category: 'home' },
  { name: 'Anchor', icon: Anchor, category: 'home' },
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
  { id: 'peach-coral', name: 'Peach Coral', value: 'linear-gradient(135deg, #fbbf24, #f97316)' },
  { id: 'mint-emerald', name: 'Mint Emerald', value: 'linear-gradient(135deg, #34d399, #059669)' },
  { id: 'royal-purple', name: 'Royal Purple', value: 'linear-gradient(135deg, #7c3aed, #4f46e5)' },
  { id: 'flamingo', name: 'Flamingo', value: 'linear-gradient(135deg, #fb7185, #e11d48)' },
  { id: 'electric-lime', name: 'Electric Lime', value: 'linear-gradient(135deg, #a3e635, #22d3ee)' },
  { id: 'warm-amber', name: 'Warm Amber', value: 'linear-gradient(135deg, #f59e0b, #dc2626)' },
  { id: 'twilight', name: 'Twilight', value: 'linear-gradient(135deg, #6366f1, #a855f7)' },
  { id: 'aqua-marine', name: 'Aqua Marine', value: 'linear-gradient(135deg, #06b6d4, #3b82f6)' },
  { id: 'rose-gold', name: 'Rose Gold', value: 'linear-gradient(135deg, #f43f5e, #d97706)' },
  { id: 'northern-lights', name: 'Northern Lights', value: 'linear-gradient(135deg, #2dd4bf, #a78bfa)' },
  { id: 'midnight-plum', name: 'Midnight Plum', value: 'linear-gradient(135deg, #581c87, #be185d)' },
  { id: 'jade-frost', name: 'Jade Frost', value: 'linear-gradient(135deg, #10b981, #67e8f9)' },
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

export function toKebabCase(pascal: string): string {
  return pascal
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}
