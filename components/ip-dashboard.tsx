'use client'

import { useEffect, useState } from 'react'
import { Activity, Check, Clipboard, Gauge, Globe2, MapPin, Network, RefreshCw, Server, ShieldCheck, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'

type IpData = { ip: string; ipv4: string; ipv6: string; hostname: string; city: string; region: string; country: string; latitude: string; longitude: string; timezone: string; isp: string; userAgent: string; timestamp: string }

const details = [
  { key: 'ipv4', label: 'IPv4', icon: Network }, { key: 'ipv6', label: 'IPv6', icon: Network }, { key: 'hostname', label: 'Hostname', icon: Server },
  { key: 'city', label: 'Cidade', icon: MapPin }, { key: 'region', label: 'Região', icon: Globe2 }, { key: 'country', label: 'País', icon: Globe2 },
  { key: 'timezone', label: 'Fuso horário', icon: Activity }, { key: 'isp', label: 'Provedor', icon: Network },
] as const

function detectOs(userAgent: string) {
  if (/Windows/i.test(userAgent)) return 'Windows'
  if (/Mac OS|Macintosh/i.test(userAgent)) return 'macOS'
  if (/Android/i.test(userAgent)) return 'Android'
  if (/iPhone|iPad/i.test(userAgent)) return 'iOS'
  if (/Linux/i.test(userAgent)) return 'Linux'
  return 'Desconhecido'
}

export function IpDashboard() {
  const [data, setData] = useState<IpData | null>(null)
  const [loading, setLoading] = useState(true)
  const [speed, setSpeed] = useState('Medindo...')
  const [copied, setCopied] = useState(false)

  async function measureSpeed() {
    try {
      const started = performance.now()
      const response = await fetch(`https://speed.cloudflare.com/__down?bytes=5000000&cacheBust=${Date.now()}`, { cache: 'no-store' })
      await response.arrayBuffer()
      const megabits = (5 * 8) / ((performance.now() - started) / 1000)
      setSpeed(`${megabits.toFixed(1)} Mbps`)
    } catch { setSpeed('Indisponível') }
  }

  async function loadIp() {
    setLoading(true)
    await Promise.all([
      fetch('/api/ip', { cache: 'no-store' }).then((response) => response.json()).then(setData),
      measureSpeed(),
    ])
    setLoading(false)
  }

  useEffect(() => { loadIp() }, [])

  async function copyIp() {
    if (!data?.ip) return
    await navigator.clipboard.writeText(data.ip)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  const mapUrl = data && data.latitude !== 'N/A' && data.longitude !== 'N/A' ? `https://www.openstreetmap.org/export/embed.html?bbox=${Number(data.longitude) - 0.12}%2C${Number(data.latitude) - 0.08}%2C${Number(data.longitude) + 0.12}%2C${Number(data.latitude) + 0.08}&layer=mapnik&marker=${data.latitude}%2C${data.longitude}` : ''

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border"><div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5"><div className="flex items-center gap-3"><div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Terminal className="size-4" aria-hidden="true" /></div><span className="text-sm font-semibold tracking-tight">ip.inspect</span></div><span className="font-mono text-xs text-muted-foreground">v1.1.0</span></div></header>
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16 md:py-24">
        <section className="flex flex-col gap-4"><div className="flex items-center gap-2 text-sm text-muted-foreground"><span className="size-2 rounded-full bg-primary" aria-hidden="true" />Conexão detectada</div><div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"><div className="flex flex-col gap-3"><h1 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl">Seu endereço IP</h1><p className="max-w-xl text-base leading-7 text-muted-foreground">Uma visão clara das informações públicas associadas à sua conexão atual.</p></div><Button variant="outline" onClick={loadIp} disabled={loading}><RefreshCw data-icon="inline-start" className={loading ? 'animate-spin' : ''} />Atualizar</Button></div></section>
        <section className="flex flex-col gap-4"><div className="flex items-center justify-between text-sm text-muted-foreground"><span>Endereço público</span><ShieldCheck className="size-4" aria-label="Conexão verificada" /></div><div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm md:flex-row md:items-center md:justify-between md:p-8"><code className="break-all font-mono text-3xl font-medium tracking-tight md:text-5xl">{loading ? '...' : data?.ip}</code><Button variant="secondary" size="sm" onClick={copyIp} disabled={loading}>{copied ? <Check data-icon="inline-start" /> : <Clipboard data-icon="inline-start" />}{copied ? 'Copiado' : 'Copiar'}</Button></div></section>
        <section className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">{details.map(({ key, label, icon: Icon }) => <div key={key} className="flex min-h-32 flex-col justify-between gap-6 bg-card p-5"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{label}</span><Icon className="size-4 text-muted-foreground" aria-hidden="true" /></div><span className="truncate font-mono text-sm">{loading ? '...' : data?.[key]}</span></div>)}<div className="flex min-h-32 flex-col justify-between gap-6 bg-card p-5"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Sistema operacional</span><Server className="size-4 text-muted-foreground" aria-hidden="true" /></div><span className="font-mono text-sm">{loading ? '...' : detectOs(data?.userAgent || '')}</span></div><div className="flex min-h-32 flex-col justify-between gap-6 bg-card p-5"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Velocidade estimada</span><Gauge className="size-4 text-muted-foreground" aria-hidden="true" /></div><span className="font-mono text-sm">{speed}</span></div><div className="flex min-h-32 flex-col justify-between gap-6 bg-card p-5 md:col-span-2 lg:col-span-3"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Navegador e dispositivo</span><Server className="size-4 text-muted-foreground" aria-hidden="true" /></div><span className="line-clamp-2 font-mono text-xs leading-5 text-foreground/80">{loading ? '...' : data?.userAgent}</span></div></section>
        <section className="flex flex-col gap-4"><div className="flex items-center justify-between"><div><h2 className="text-lg font-medium tracking-tight">Localidade aproximada</h2><p className="text-sm text-muted-foreground">O mapa usa a localização estimada pelo endereço IP.</p></div><MapPin className="size-5 text-muted-foreground" aria-hidden="true" /></div><div className="overflow-hidden rounded-xl border border-border bg-muted">{mapUrl ? <iframe title="Mapa da localidade aproximada" src={mapUrl} className="h-80 w-full border-0 grayscale" loading="lazy" /> : <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">Mapa indisponível</div>}</div></section>
        <footer className="flex items-center justify-between border-t border-border pt-5 text-xs text-muted-foreground"><span>Dados atualizados em tempo real</span><span className="font-mono">{data ? new Date(data.timestamp).toLocaleTimeString('pt-BR') : '--:--:--'}</span></footer>
      </div>
    </main>
  )
}

export default IpDashboard
