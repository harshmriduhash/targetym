import { redirect } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/server'
import { JobPostingForm } from '@/src/components/recruitment'

export default async function NewJobPostingPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'manager'].includes(profile.role)) {
    redirect('/dashboard/recruitment')
  }

  return (
    <div className="container mx-auto py-8 flex justify-center">
      <JobPostingForm />
    </div>
  )
}
