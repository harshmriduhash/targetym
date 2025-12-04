import { redirect } from 'next/navigation'
import { handleOAuthCallback } from '@/src/actions/integrations/handle-oauth-callback'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface CallbackPageProps {
  searchParams: {
    code?: string
    state?: string
    error?: string
  }
}

export default async function CallbackPage({ searchParams }: CallbackPageProps) {
  // Handle OAuth error
  if (searchParams.error) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Integration Failed</AlertTitle>
          <AlertDescription>
            {searchParams.error === 'access_denied'
              ? 'You denied access to the integration.'
              : 'An error occurred during authorization.'}
          </AlertDescription>
          <div className="mt-4">
            <Button asChild variant="outline">
              <Link href="/dashboard/integrations">Back to Integrations</Link>
            </Button>
          </div>
        </Alert>
      </div>
    )
  }

  // Validate required parameters
  if (!searchParams.code || !searchParams.state) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Invalid Callback</AlertTitle>
          <AlertDescription>
            Missing required parameters. Please try connecting again.
          </AlertDescription>
          <div className="mt-4">
            <Button asChild variant="outline">
              <Link href="/dashboard/integrations">Back to Integrations</Link>
            </Button>
          </div>
        </Alert>
      </div>
    )
  }

  // Handle OAuth callback
  const result = await handleOAuthCallback({
    code: searchParams.code,
    state: searchParams.state,
  })

  if (!result.success) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Integration Failed</AlertTitle>
          <AlertDescription>{result.error}</AlertDescription>
          <div className="mt-4">
            <Button asChild variant="outline">
              <Link href="/dashboard/integrations">Back to Integrations</Link>
            </Button>
          </div>
        </Alert>
      </div>
    )
  }

  // Success - redirect to integrations page
  redirect('/dashboard/integrations?success=true')
}
