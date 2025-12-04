'use client'

import { useState, useEffect } from 'react'
import { useRealtimeSubscription } from '@/src/lib/realtime'
import { Badge } from '@/components/ui/badge'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'

interface RealtimeIndicatorProps {
  /**
   * Table to monitor
   */
  table: string

  /**
   * Filter for the subscription
   */
  filter?: string

  /**
   * Show detailed status
   * @default false
   */
  detailed?: boolean

  /**
   * Show reconnect button
   * @default true
   */
  showReconnect?: boolean
}

/**
 * Component that displays Realtime connection status
 *
 * @example
 * ```tsx
 * <RealtimeIndicator
 *   table="goals"
 *   filter={`organization_id=eq.${organizationId}`}
 *   detailed
 * />
 * ```
 */
export function RealtimeIndicator({
  table,
  filter,
  detailed = false,
  showReconnect = true,
}: RealtimeIndicatorProps) {
  const [lastEventTime, setLastEventTime] = useState<Date | null>(null)

  const { status, error, reconnect } = useRealtimeSubscription({
    table,
    filter,
    event: '*',
    onInsert: () => setLastEventTime(new Date()),
    onUpdate: () => setLastEventTime(new Date()),
    onDelete: () => setLastEventTime(new Date()),
    debug: true,
  })

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500'
      case 'connecting':
        return 'bg-yellow-500'
      case 'disconnected':
        return 'bg-gray-500'
      case 'error':
        return 'bg-red-500'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <Wifi className="h-3 w-3" />
      case 'connecting':
        return <RefreshCw className="h-3 w-3 animate-spin" />
      case 'disconnected':
      case 'error':
        return <WifiOff className="h-3 w-3" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connecté'
      case 'connecting':
        return 'Connexion...'
      case 'disconnected':
        return 'Déconnecté'
      case 'error':
        return 'Erreur'
    }
  }

  if (!detailed) {
    return (
      <Badge variant="outline" className="gap-1">
        <span className={`h-2 w-2 rounded-full ${getStatusColor()}`} />
        {getStatusText()}
      </Badge>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="gap-2">
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </Badge>

      {lastEventTime && (
        <span className="text-xs text-muted-foreground">
          Dernier événement: {lastEventTime.toLocaleTimeString()}
        </span>
      )}

      {error && (
        <span className="text-xs text-destructive">
          {error.message}
        </span>
      )}

      {showReconnect && (status === 'error' || status === 'disconnected') && (
        <button
          onClick={reconnect}
          className="text-xs text-primary hover:underline"
        >
          Reconnecter
        </button>
      )}
    </div>
  )
}
