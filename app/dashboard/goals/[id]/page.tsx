import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/server'
import { ProgressTracker } from '@/src/components/goals/ProgressTracker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface GoalDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function GoalDetailPage({ params }: GoalDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Fetch goal with key results
  const { data: goal, error } = await supabase
    .from('goals')
    .select(`
      *,
      key_results(*)
    `)
    .eq('id', id)
    .single()

  if (error || !goal) {
    notFound()
  }

  // Verify ownership or visibility
  if (goal.owner_id !== user.id && goal.visibility === 'private') {
    redirect('/dashboard/goals')
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/goals">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Goal Details</h1>
          </div>
        </div>

        {/* Goal Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl">{goal.title}</CardTitle>
                {goal.description && (
                  <CardDescription className="text-base">{goal.description}</CardDescription>
                )}
              </div>
              <Badge
                variant={
                  goal.status === 'active'
                    ? 'default'
                    : goal.status === 'completed'
                    ? 'secondary'
                    : 'outline'
                }
              >
                {goal.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Period</span>
                <p className="font-medium">{goal.period}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Visibility</span>
                <p className="font-medium capitalize">{goal.visibility}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Start Date</span>
                <p className="font-medium">
                  {goal.start_date ? new Date(goal.start_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">End Date</span>
                <p className="font-medium">
                  {goal.end_date ? new Date(goal.end_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Tracker */}
        <ProgressTracker
          goalId={goal.id}
          goalTitle={goal.title}
          keyResults={goal.key_results || []}
        />
      </div>
    </div>
  )
}
