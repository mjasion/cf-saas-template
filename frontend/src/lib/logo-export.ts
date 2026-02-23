import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { type LogoConfig, getIconByName, DEFAULT_LOGO_CONFIG } from './logo-config'
import { Zap } from 'lucide-react'

function parseGradient(value: string): { angle: number; stops: { color: string; offset: string }[] } {
  // Parse "linear-gradient(135deg, #a, #b)" or "linear-gradient(135deg, #a 20%, #b 80%)"
  const match = value.match(/linear-gradient\((\d+)deg,\s*(.+)\)/)
  if (!match) return { angle: 135, stops: [{ color: value, offset: '0%' }, { color: value, offset: '100%' }] }

  const angle = parseInt(match[1], 10)
  const stopsRaw = match[2].split(',').map((s) => s.trim())
  const stops = stopsRaw.map((s, i) => {
    const parts = s.split(/\s+/)
    const color = parts[0]
    const offset = parts[1] || `${(i / (stopsRaw.length - 1)) * 100}%`
    return { color, offset }
  })

  return { angle, stops }
}

function angleToCoords(angle: number): { x1: string; y1: string; x2: string; y2: string } {
  const rad = ((angle - 90) * Math.PI) / 180
  const x1 = `${Math.round(50 - Math.cos(rad) * 50)}%`
  const y1 = `${Math.round(50 - Math.sin(rad) * 50)}%`
  const x2 = `${Math.round(50 + Math.cos(rad) * 50)}%`
  const y2 = `${Math.round(50 + Math.sin(rad) * 50)}%`
  return { x1, y1, x2, y2 }
}

function resolveBg(config: LogoConfig): string {
  if (config.bgType === 'theme') {
    if (typeof document !== 'undefined') {
      return getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#6363f1'
    }
    return '#6363f1'
  }
  return config.bgValue
}

function getShapeRadius(shape: string, size: number): number {
  if (shape === 'rounded-full') return size / 2
  if (shape === 'rounded-2xl') return size * 0.12
  return size * 0.08
}

export function generateLogoSvg(config: LogoConfig, size: number = 512): string {
  const bg = resolveBg(config)
  const radius = getShapeRadius(config.shape, size)
  const iconSize = Math.round(size * 0.5)
  const iconOffset = Math.round((size - iconSize) / 2)

  const IconComponent = getIconByName(config.icon) || Zap
  const iconMarkup = renderToStaticMarkup(
    createElement(IconComponent, {
      width: iconSize,
      height: iconSize,
      color: config.iconColor,
      strokeWidth: 2,
    })
  )

  // Extract inner content of the rendered <svg>...</svg>
  const innerMatch = iconMarkup.match(/<svg[^>]*>([\s\S]*)<\/svg>/)
  const iconInner = innerMatch ? innerMatch[1] : ''

  let bgDefs = ''
  let fillAttr: string

  if (bg.includes('linear-gradient')) {
    const { angle, stops } = parseGradient(bg)
    const coords = angleToCoords(angle)
    const stopElements = stops
      .map((s) => `<stop offset="${s.offset}" stop-color="${s.color}" />`)
      .join('')
    bgDefs = `<defs><linearGradient id="bg" x1="${coords.x1}" y1="${coords.y1}" x2="${coords.x2}" y2="${coords.y2}">${stopElements}</linearGradient></defs>`
    fillAttr = 'url(#bg)'
  } else {
    fillAttr = bg
  }

  const shapeEl =
    config.shape === 'rounded-full'
      ? `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${fillAttr}" />`
      : `<rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${fillAttr}" />`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  ${bgDefs}
  ${shapeEl}
  <g transform="translate(${iconOffset}, ${iconOffset})">
    <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${config.iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${iconInner}
    </svg>
  </g>
</svg>`
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadSvg(config: LogoConfig = DEFAULT_LOGO_CONFIG, size: number = 512) {
  const svgString = generateLogoSvg(config, size)
  const blob = new Blob([svgString], { type: 'image/svg+xml' })
  downloadBlob(blob, 'logo.svg')
}

export async function downloadPng(config: LogoConfig = DEFAULT_LOGO_CONFIG, size: number = 512) {
  const svgString = generateLogoSvg(config, size)
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const img = new Image()
  img.width = size
  img.height = size

  return new Promise<void>((resolve, reject) => {
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, size, size)
      URL.revokeObjectURL(url)
      canvas.toBlob((pngBlob) => {
        if (pngBlob) {
          downloadBlob(pngBlob, 'logo.png')
          resolve()
        } else {
          reject(new Error('Canvas toBlob failed'))
        }
      }, 'image/png')
    }
    img.onerror = reject
    img.src = url
  })
}
