'use client'

import { useEffect, useState } from 'react'
import { IntegrationCard } from './IntegrationCard'
import { ConnectIntegrationDialog } from './ConnectIntegrationDialog'
import { listIntegrations } from '@/src/actions/integrations/list-integrations'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface Integration {
  id: string
  providerId: string
  providerName: string
  status: string
  connectedAt: string | null
  lastSyncAt: string | null
}

const availableProviders = [
  { id: 'slack', name: 'Slack', description: 'Team communication' },
  { id: 'google', name: 'Google Workspace', description: 'Calendar, Drive, Gmail' },
  { id: 'asana', name: 'Asana', description: 'Project management' },
  { id: 'notion', name: 'Notion', description: 'Documentation' },
]

export function IntegrationsList() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadIntegrations = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await listIntegrations()
      if (result.success) {
        setIntegrations(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to load integrations')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadIntegrations()
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  const connectedProviders = new Set(integrations.map((i) => i.providerId))
  const providersToShow = availableProviders.map((provider) => {
    const existing = integrations.find((i) => i.providerId === provider.id)
    return existing || {
      id: provider.id,
      providerId: provider.id,
      providerName: provider.name,
      status: 'disconnected',
      connectedAt: null,
      lastSyncAt: null,
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integrations</h2>
          <p className="text-muted-foreground">
            Connect external services to enhance your HR platform
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {providersToShow.map((integration) => (
          <div key={integration.providerId}>
            {integration.status === 'disconnected' ? (
              <ConnectIntegrationDialog
                providerId={integration.providerId}
                providerName={integration.providerName}
                onConnect={loadIntegrations}
              />
            ) : (
              <IntegrationCard
                integration={integration}
                onDisconnect={loadIntegrations}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
