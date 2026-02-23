// Full lucide-react icon registry with tag-based search
// This module imports ALL lucide icons — only import it on code-split pages (e.g. /themes)
import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface IconResult {
  name: string
  component: LucideIcon
}

// Build the full icon list once (filter out non-icon exports)
const ALL_ICONS: IconResult[] = []
const ICON_MAP = new Map<string, LucideIcon>()

for (const [name, component] of Object.entries(LucideIcons)) {
  if (
    /^[A-Z]/.test(name) &&
    !name.startsWith('Lucide') &&
    !name.endsWith('Icon') &&
    typeof component === 'object' &&
    component !== null &&
    '$$typeof' in component
  ) {
    ALL_ICONS.push({ name, component: component as unknown as LucideIcon })
    ICON_MAP.set(name, component as unknown as LucideIcon)
  }
}

// Split PascalCase into lowercase words: "ArrowUpRight" → ["arrow", "up", "right"]
function splitPascal(name: string): string[] {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .toLowerCase()
    .split(/[\s]+/)
    .filter(Boolean)
}

// Pre-compute search tokens for every icon
const ICON_TOKENS = new Map<string, string[]>()
for (const icon of ALL_ICONS) {
  ICON_TOKENS.set(icon.name, splitPascal(icon.name))
}

// Hand-curated search aliases: common words → matching icon name fragments
// Keys are search terms, values are lowercase token matches
const SEARCH_ALIASES: Record<string, string[]> = {
  // Nature & plants
  plant: ['leaf', 'sprout', 'tree', 'clover', 'flower', 'seedling', 'vegan'],
  garden: ['flower', 'sprout', 'leaf', 'tree', 'shovel'],
  nature: ['leaf', 'tree', 'sun', 'moon', 'cloud', 'mountain', 'flower', 'sprout', 'bird'],
  weather: ['sun', 'moon', 'cloud', 'rain', 'snow', 'wind', 'thermometer', 'umbrella', 'haze', 'tornado'],
  animal: ['bird', 'bug', 'cat', 'dog', 'fish', 'rabbit', 'squirrel', 'turtle', 'rat', 'snail', 'worm'],
  pet: ['cat', 'dog', 'fish', 'bird', 'rabbit', 'paw'],

  // Communication
  chat: ['message', 'messages', 'speech'],
  talk: ['message', 'phone', 'speech', 'mic'],
  email: ['mail', 'inbox', 'send', 'at'],
  call: ['phone', 'voicemail'],
  notify: ['bell', 'alarm', 'alert'],

  // Finance & commerce
  money: ['dollar', 'wallet', 'credit', 'banknote', 'coins', 'piggy', 'receipt', 'badge'],
  pay: ['credit', 'wallet', 'dollar', 'banknote', 'receipt'],
  shop: ['store', 'shopping', 'cart', 'bag', 'tag', 'receipt', 'barcode'],
  price: ['tag', 'dollar', 'badge', 'receipt', 'percent'],

  // People & social
  person: ['user', 'users', 'contact', 'baby', 'accessibility'],
  team: ['users', 'group', 'network'],
  social: ['share', 'heart', 'thumbs', 'message', 'users'],

  // Tech & development
  code: ['code', 'terminal', 'braces', 'brackets', 'file', 'regex'],
  dev: ['code', 'terminal', 'git', 'braces', 'bug', 'wrench'],
  server: ['server', 'database', 'hard', 'cloud', 'network'],
  data: ['database', 'table', 'chart', 'bar', 'pie', 'trending'],
  ai: ['brain', 'bot', 'cpu', 'sparkles', 'wand', 'circuit'],
  robot: ['bot', 'cpu', 'circuit', 'brain'],

  // Navigation & UI
  menu: ['menu', 'hamburger', 'panel', 'sidebar', 'ellipsis', 'grip'],
  close: ['x', 'circle', 'square'],
  back: ['arrow', 'left', 'undo', 'corner'],
  forward: ['arrow', 'right', 'redo'],
  settings: ['settings', 'sliders', 'wrench', 'cog', 'gear'],
  config: ['settings', 'sliders', 'wrench', 'cog', 'toggle'],

  // Security
  security: ['shield', 'lock', 'key', 'fingerprint', 'scan', 'eye'],
  auth: ['lock', 'key', 'fingerprint', 'log', 'shield', 'user'],
  password: ['lock', 'key', 'eye', 'asterisk'],

  // Media & creative
  music: ['music', 'headphones', 'speaker', 'volume', 'mic', 'radio', 'disc'],
  video: ['video', 'camera', 'film', 'play', 'clapperboard', 'monitor'],
  photo: ['camera', 'image', 'aperture', 'focus', 'frame'],
  art: ['palette', 'brush', 'pen', 'pencil', 'paint', 'figma', 'dribbble'],
  design: ['palette', 'pen', 'pencil', 'ruler', 'figma', 'layers', 'frame'],

  // Documents & files
  doc: ['file', 'document', 'text', 'notebook', 'clipboard', 'scroll'],
  write: ['pen', 'pencil', 'edit', 'type', 'text', 'notebook'],
  save: ['save', 'download', 'bookmark', 'archive', 'floppy'],
  folder: ['folder', 'archive', 'cabinet'],

  // Travel & transport
  travel: ['plane', 'car', 'bus', 'train', 'ship', 'bike', 'map', 'compass', 'luggage', 'globe'],
  map: ['map', 'compass', 'navigation', 'pin', 'locate', 'globe', 'route'],
  car: ['car', 'truck', 'bus', 'fuel', 'gauge', 'parking'],

  // Food & drink
  food: ['pizza', 'apple', 'cake', 'cookie', 'egg', 'sandwich', 'utensils', 'beef', 'salad', 'soup', 'cherry', 'grape', 'citrus', 'banana', 'popcorn', 'croissant', 'candy'],
  drink: ['coffee', 'cup', 'wine', 'beer', 'glass', 'milk', 'martini'],
  kitchen: ['utensils', 'microwave', 'refrigerator', 'chef', 'cooking'],

  // Health & fitness
  health: ['heart', 'activity', 'stethoscope', 'pill', 'syringe', 'thermometer', 'cross', 'hospital'],
  medical: ['stethoscope', 'pill', 'syringe', 'ambulance', 'cross', 'heart', 'hospital'],
  fitness: ['dumbbell', 'activity', 'heart', 'footprints', 'timer', 'bike'],
  sport: ['trophy', 'medal', 'goal', 'bike', 'dumbbell', 'timer', 'flag'],

  // Business
  business: ['briefcase', 'building', 'chart', 'trending', 'presentation', 'handshake', 'landmark'],
  office: ['building', 'briefcase', 'printer', 'paperclip', 'stamp', 'lamp', 'desk'],
  meeting: ['presentation', 'users', 'video', 'calendar', 'handshake'],

  // Time & schedule
  time: ['clock', 'timer', 'watch', 'hourglass', 'calendar', 'alarm'],
  schedule: ['calendar', 'clock', 'timer', 'alarm', 'list'],
  date: ['calendar', 'clock'],

  // Home & furniture
  home: ['house', 'home', 'building', 'door', 'bed', 'sofa', 'lamp', 'bath'],
  furniture: ['bed', 'sofa', 'lamp', 'armchair', 'table'],

  // Misc
  game: ['gamepad', 'dice', 'puzzle', 'joystick', 'trophy', 'swords'],
  power: ['zap', 'bolt', 'plug', 'battery', 'power'],
  magic: ['wand', 'sparkles', 'sparkle', 'stars', 'gem'],
  fire: ['flame', 'fire', 'campfire'],
  water: ['droplet', 'waves', 'droplets', 'glass'],
  love: ['heart', 'hearts'],
  star: ['star', 'sparkle', 'sparkles'],
  warning: ['alert', 'triangle', 'octagon', 'siren'],
  error: ['circle', 'alert', 'ban', 'octagon'],
  success: ['check', 'circle', 'badge'],
  info: ['info', 'circle', 'help'],
  edit: ['pen', 'pencil', 'edit', 'eraser', 'type'],
  delete: ['trash', 'eraser', 'x', 'minus'],
  add: ['plus', 'circle', 'square'],
  search: ['search', 'scan', 'zoom', 'magnifying'],
  filter: ['filter', 'funnel', 'sliders', 'list'],
  sort: ['arrow', 'down', 'up', 'list'],
  download: ['download', 'cloud', 'arrow', 'save'],
  upload: ['upload', 'cloud', 'arrow'],
  share: ['share', 'forward', 'external', 'link'],
  link: ['link', 'chain', 'external', 'unlink'],
  copy: ['copy', 'clipboard', 'files'],
  print: ['printer'],
  expand: ['maximize', 'expand', 'fullscreen', 'arrows'],
  collapse: ['minimize', 'shrink', 'arrows'],
  drag: ['grip', 'move', 'hand'],
}

// Pre-compute alias lookup: for each alias term, collect matching icon names
const ALIAS_MATCHES = new Map<string, Set<string>>()

for (const [term, fragments] of Object.entries(SEARCH_ALIASES)) {
  const matches = new Set<string>()
  for (const icon of ALL_ICONS) {
    const tokens = ICON_TOKENS.get(icon.name) || []
    const nameLower = icon.name.toLowerCase()
    for (const fragment of fragments) {
      if (nameLower.includes(fragment) || tokens.some(t => t.includes(fragment))) {
        matches.add(icon.name)
        break
      }
    }
  }
  ALIAS_MATCHES.set(term, matches)
}

export function searchIcons(query: string, limit: number = 120): IconResult[] {
  const q = query.toLowerCase().trim()
  if (!q) return []

  const scored = new Map<string, number>()

  for (const icon of ALL_ICONS) {
    const nameLower = icon.name.toLowerCase()
    const tokens = ICON_TOKENS.get(icon.name) || []
    let score = 0

    // Exact name match
    if (nameLower === q) {
      score = 100
    }
    // Name starts with query
    else if (nameLower.startsWith(q)) {
      score = 80
    }
    // Name contains query
    else if (nameLower.includes(q)) {
      score = 60
    }
    // Token exact match
    else if (tokens.includes(q)) {
      score = 50
    }
    // Token prefix match
    else if (tokens.some(t => t.startsWith(q))) {
      score = 40
    }
    // Token contains match
    else if (tokens.some(t => t.includes(q))) {
      score = 30
    }

    if (score > 0) {
      scored.set(icon.name, score)
    }
  }

  // Check alias matches
  for (const [term, matchSet] of ALIAS_MATCHES) {
    if (term.startsWith(q) || q.startsWith(term)) {
      for (const name of matchSet) {
        const existing = scored.get(name) || 0
        if (existing < 20) {
          scored.set(name, Math.max(existing, 20))
        }
      }
    }
  }

  // Sort by score descending, then alphabetically
  const results = Array.from(scored.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name]) => ({
      name,
      component: ICON_MAP.get(name)!,
    }))

  return results
}

export function getIconComponent(name: string): LucideIcon | undefined {
  return ICON_MAP.get(name)
}

export function getSearchSuggestions(query: string): string[] {
  const q = query.toLowerCase().trim()
  if (!q || q.length < 2) return []

  return Object.keys(SEARCH_ALIASES)
    .filter(term => term.startsWith(q) && term !== q)
    .slice(0, 5)
}

export { ALL_ICONS }
