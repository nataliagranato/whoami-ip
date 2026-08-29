'use client'

import { useEffect, useState } from 'react'
import {
  Activity,
  Check,
  Clipboard,
  Globe2,
  MapPin,
  Network,
  RefreshCw,
  Server,
  ShieldCheck,
  Terminal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

type IpData = {
  ip: string
  city: string
  region: string
  country: string
  latitude: string
  longitude: string
  timezone: string
  isp: string
  userAgent: string
  timestamp: string
}

const details = [
  { key: 'city', label: 'Cidade', icon: MapPin },
  { key: 'region', label: 'Região', icon: Globe2 },
  { key: 'country', label: 'País', icon: Globe2 },
  { key: 'timezone', label: 'Fuso horário', icon: Activity },
  { key: 'isp', label: 'Provedor', icon: Network },
  { key: 'latitude', label: 'Latitude', icon: MapPin },
  { key: 'longitude', label: 'Longitude', icon: MapPin },
] as const

export function IpDashboard() {
  const [data, setData] = useState<IpData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  async function loadIp() {
    setLoading(true)
    try {
      const response = await fetch('/api/ip', { cache: 'no-store' })
      setData(await response.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIp()
  }, [])

  async function copyIp() {
    if (!data?.ip) return
    await navigator.clipboard.writeText(data.ip)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Terminal className="size-4" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold tracking-tight">ip.inspect</span>
          </div>
          <span className="font-mono text-xs text-muted-foreground">v1.0.0</span>
        </div>
      </header>

      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16 md:py-24">
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
            Conexão detectada
          </div>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-3">
              <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Seu endereço IP</h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground">
                Uma visão clara das informações públicas associadas à sua conexão atual.
              </p>
            </div>
            <Button variant="outline" onClick={loadIp} disabled={loading}>
              <RefreshCw data-icon="inline-start" className={loading ? 'animate-spin' : ''} />
              Atualizar
            </Button>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Endereço público</span>
            <ShieldCheck className="size-4" aria-label="Conexão verificada" />
          </div>
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm md:flex-row md:items-center md:justify-between md:p-8">
            <code className="break-all font-mono text-3xl font-medium tracking-tight md:text-5xl">
              {loading ? '...' : data?.ip}
            </code>
            <Button variant="secondary" size="sm" onClick={copyIp} disabled={loading}>
              {copied ? <Check data-icon="inline-start" /> : <Clipboard data-icon="inline-start" />}
              {copied ? 'Copiado' : 'Copiar'}
            </Button>
          </div>
        </section>

        <section className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {details.map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex min-h-32 flex-col justify-between gap-6 bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{label}</span>
                <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
              </div>
              <span className="truncate font-mono text-sm">{loading ? '...' : data?.[key]}</span>
            </div>
          ))}
          <div className="flex min-h-32 flex-col justify-between gap-6 bg-card p-5 md:col-span-2 lg:col-span-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Navegador e dispositivo</span>
              <Server className="size-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <span className="line-clamp-2 font-mono text-xs leading-5 text-foreground/80">
              {loading ? '...' : data?.userAgent}
            </span>
          </div>
        </section>

        <footer className="flex items-center justify-between border-t border-border pt-5 text-xs text-muted-foreground">
          <span>Dados atualizados em tempo real</span>
          <span className="font-mono">{data ? new Date(data.timestamp).toLocaleTimeString('pt-BR') : '--:--:--'}</span>
        </footer>
      </div>
    </main>
  )
}

export default IpDashboard
