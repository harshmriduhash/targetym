'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { connectIntegration } from '@/src/actions/integrations/connect-integration'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface ConnectIntegrationDialogProps {
  providerId: string
  providerName: string
  onConnect?: () => void
}

const providerIcons: Record<string, string> = {
  slack: '💬',
  google: '📧',
  asana: '✅',
  notion: '📝',
  jira: '🎯',
  microsoft: '💼',
}

const providerScopes: Record<string, string[]> = {
  slack: ['channels:read', 'chat:write', 'users:read', 'users:read.email'],
  google: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ],
  asana: ['default'],
  notion: ['read_content', 'update_content'],
}

export function ConnectIntegrationDialog({
  providerId,
  providerName,
  onConnect,
}: ConnectIntegrationDialogProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      const result = await connectIntegration({
        providerId,
        scopes: providerScopes[providerId],
      })

      if (result.success) {
        // Redirect to OAuth authorization URL
        window.location.href = result.data.url
      } else {
        toast.error(result.error)
        setIsConnecting(false)
      }
    } catch (error) {
      toast.error('Failed to initiate connection')
      setIsConnecting(false)
    }
  }

  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="text-4xl opacity-50">
            {providerIcons[providerId] || '🔗'}
          </div>
          <div>
            <CardTitle className="text-lg">{providerName}</CardTitle>
            <CardDescription className="mt-1">
              {providerId === 'slack' && 'Team communication and notifications'}
              {providerId === 'google' && 'Calendar, Drive, and Gmail integration'}
              {providerId === 'asana' && 'Task and project management'}
              {providerId === 'notion' && 'Documentation and knowledge base'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full"
        >
          {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isConnecting ? 'Connecting...' : `Connect ${providerName}`}
        </Button>
      </CardContent>
    </Card>
  )
}
