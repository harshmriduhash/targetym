'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Check, Clock, X } from 'lucide-react'
import { disconnectIntegration } from '@/src/actions/integrations/disconnect-integration'
import { toast } from 'sonner'

interface IntegrationCardProps {
  integration: {
    id: string
    providerId: string
    providerName: string
    status: string
    connectedAt: string | null
    lastSyncAt: string | null
  }
  onDisconnect?: () => void
}

const providerIcons: Record<string, string> = {
  slack: '💬',
  google: '📧',
  asana: '✅',
  notion: '📝',
  jira: '🎯',
  microsoft: '💼',
}

const statusConfig = {
  connected: { label: 'Connected', variant: 'default' as const, icon: Check, color: 'text-green-600' },
  pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
  error: { label: 'Error', variant: 'destructive' as const, icon: AlertCircle, color: 'text-red-600' },
  disconnected: { label: 'Disconnected', variant: 'outline' as const, icon: X, color: 'text-gray-600' },
}

export function IntegrationCard({ integration, onDisconnect }: IntegrationCardProps) {
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const statusInfo = statusConfig[integration.status as keyof typeof statusConfig] || statusConfig.disconnected
  const StatusIcon = statusInfo.icon

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      const result = await disconnectIntegration({
        integrationId: integration.id,
        revokeTokens: true,
      })

      if (result.success) {
        toast.success(`${integration.providerName} disconnected successfully`)
        onDisconnect?.()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Failed to disconnect integration')
    } finally {
      setIsDisconnecting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">
              {providerIcons[integration.providerId] || '🔗'}
            </div>
            <div>
              <CardTitle className="text-lg">{integration.providerName}</CardTitle>
              <CardDescription className="mt-1">
                {integration.providerId === 'slack' && 'Team communication and notifications'}
                {integration.providerId === 'google' && 'Calendar, Drive, and Gmail integration'}
                {integration.providerId === 'asana' && 'Task and project management'}
                {integration.providerId === 'notion' && 'Documentation and knowledge base'}
              </CardDescription>
            </div>
          </div>
          <Badge variant={statusInfo.variant} className="flex items-center gap-1">
            <StatusIcon className="h-3 w-3" />
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {integration.connectedAt && (
            <div className="text-sm text-muted-foreground">
              Connected: {new Date(integration.connectedAt).toLocaleDateString()}
            </div>
          )}
          {integration.lastSyncAt && (
            <div className="text-sm text-muted-foreground">
              Last sync: {new Date(integration.lastSyncAt).toLocaleString()}
            </div>
          )}

          <div className="flex gap-2">
            {integration.status === 'connected' && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
              >
                {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
