import { useState } from 'react'
import { Download, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLogo } from '@/lib/use-logo'
import {
  CURATED_ICONS,
  GRADIENT_PRESETS,
  type LogoShape,
  type LogoBgType,
  type IconEntry,
} from '@/lib/logo-config'
import { downloadSvg, downloadPng } from '@/lib/logo-export'
import { LogoMark } from '@/components/ui/logo'
import { BentoGrid, BentoCard } from '@/components/bento'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const ICON_CATEGORIES = ['all', 'abstract', 'business', 'tech', 'nature'] as const
type IconCategory = (typeof ICON_CATEGORIES)[number]

const SHAPES: { value: LogoShape; label: string; preview: string }[] = [
  { value: 'rounded-lg', label: 'Square', preview: 'rounded-lg' },
  { value: 'rounded-2xl', label: 'Squircle', preview: 'rounded-2xl' },
  { value: 'rounded-full', label: 'Circle', preview: 'rounded-full' },
]

const BG_TABS: { value: LogoBgType; label: string }[] = [
  { value: 'gradient', label: 'Gradient' },
  { value: 'solid', label: 'Solid' },
  { value: 'theme', label: 'Theme' },
]

export function LogoBuilder() {
  const { config, setConfig, resetConfig } = useLogo()
  const [iconFilter, setIconFilter] = useState<IconCategory>('all')

  const filteredIcons: IconEntry[] =
    iconFilter === 'all'
      ? CURATED_ICONS
      : CURATED_ICONS.filter((e) => e.category === iconFilter)

  const updateField = <K extends keyof typeof config>(key: K, value: (typeof config)[K]) => {
    setConfig({ ...config, [key]: value })
  }

  return (
    <BentoGrid columns={3}>
      {/* Live Preview */}
      <BentoCard colSpan={2} rowSpan={2} index={0}>
        <h3 className="font-semibold mb-4">Preview</h3>
        <div className="flex flex-col items-center justify-center gap-6 py-6">
          <div
            className="flex items-center justify-center rounded-2xl p-8"
            style={{
              background: 'var(--color-muted)',
              backgroundImage:
                'radial-gradient(circle, var(--color-border) 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          >
            <LogoMark size="lg" />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadSvg(config)}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              SVG
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadPng(config)}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              PNG
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetConfig}
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
        </div>
      </BentoCard>

      {/* Shape */}
      <BentoCard index={1}>
        <h3 className="font-semibold mb-3">Shape</h3>
        <div className="grid grid-cols-3 gap-2">
          {SHAPES.map((s) => (
            <button
              key={s.value}
              onClick={() => updateField('shape', s.value)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-lg p-2 transition-colors',
                config.shape === s.value
                  ? 'bg-primary/10 ring-2 ring-primary'
                  : 'hover:bg-accent',
              )}
            >
              <div
                className={cn('h-8 w-8 bg-primary', s.preview)}
              />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </button>
          ))}
        </div>
      </BentoCard>

      {/* Brand Text & Icon Color */}
      <BentoCard index={2}>
        <div className="space-y-3">
          <div>
            <Label htmlFor="logo-text" className="text-sm font-semibold">Brand Text</Label>
            <Input
              id="logo-text"
              value={config.text}
              onChange={(e) => updateField('text', e.target.value)}
              maxLength={20}
              placeholder="SaaS"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="icon-color" className="text-sm font-semibold">Icon Color</Label>
            <div className="flex items-center gap-2 mt-1">
              <input
                id="icon-color"
                type="color"
                value={config.iconColor}
                onChange={(e) => updateField('iconColor', e.target.value)}
                className="h-8 w-8 cursor-pointer rounded border border-border bg-transparent"
              />
              <span className="text-xs text-muted-foreground font-mono">{config.iconColor}</span>
            </div>
          </div>
        </div>
      </BentoCard>

      {/* Icon Picker */}
      <BentoCard colSpan={2} index={3}>
        <h3 className="font-semibold mb-3">Icon</h3>
        <div className="flex flex-wrap gap-1 mb-3">
          {ICON_CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={iconFilter === cat ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setIconFilter(cat)}
              className="capitalize text-xs h-7 px-2.5"
            >
              {cat}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-10 gap-1.5 max-h-48 overflow-y-auto">
          {filteredIcons.map((entry) => (
            <button
              key={entry.name}
              onClick={() => updateField('icon', entry.name)}
              title={entry.name}
              className={cn(
                'flex items-center justify-center rounded-lg p-2 transition-colors',
                config.icon === entry.name
                  ? 'bg-primary/10 ring-2 ring-primary text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <entry.icon className="h-5 w-5" />
            </button>
          ))}
        </div>
      </BentoCard>

      {/* Background */}
      <BentoCard index={4}>
        <h3 className="font-semibold mb-3">Background</h3>
        <div className="flex gap-1 mb-3">
          {BG_TABS.map((tab) => (
            <Button
              key={tab.value}
              variant={config.bgType === tab.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                if (tab.value === 'theme') {
                  setConfig({ ...config, bgType: 'theme', bgValue: 'auto' })
                } else if (tab.value === 'solid') {
                  setConfig({ ...config, bgType: 'solid', bgValue: '#6363f1' })
                } else {
                  setConfig({ ...config, bgType: 'gradient', bgValue: GRADIENT_PRESETS[0].value })
                }
              }}
              className="text-xs h-7 px-2.5"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {config.bgType === 'gradient' && (
          <div className="grid grid-cols-4 gap-1.5">
            {GRADIENT_PRESETS.map((g) => (
              <button
                key={g.id}
                onClick={() => updateField('bgValue', g.value)}
                title={g.name}
                className={cn(
                  'h-8 w-full rounded-md transition-all',
                  config.bgValue === g.value && 'ring-2 ring-primary ring-offset-1 ring-offset-background',
                )}
                style={{ background: g.value }}
              />
            ))}
          </div>
        )}

        {config.bgType === 'solid' && (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.bgValue.startsWith('#') ? config.bgValue : '#6363f1'}
              onChange={(e) => updateField('bgValue', e.target.value)}
              className="h-8 w-8 cursor-pointer rounded border border-border bg-transparent"
            />
            <span className="text-xs text-muted-foreground font-mono">
              {config.bgValue.startsWith('#') ? config.bgValue : '#6363f1'}
            </span>
          </div>
        )}

        {config.bgType === 'theme' && (
          <p className="text-xs text-muted-foreground">
            Automatically uses your selected theme&apos;s primary color and gradient.
          </p>
        )}
      </BentoCard>
    </BentoGrid>
  )
}
