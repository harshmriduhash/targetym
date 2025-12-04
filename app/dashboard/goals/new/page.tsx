import { redirect } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/server'
import { GoalForm } from '@/src/components/goals'

export default async function NewGoalPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto py-8 flex justify-center">
      <GoalForm />
    </div>
  )
}
