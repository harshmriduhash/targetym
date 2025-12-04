'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { createJobPostingSchema, type CreateJobPostingInput } from '@/src/lib/validations/recruitment.schemas'
import { createJobPosting } from '@/src/actions/recruitment/create-job-posting'

interface JobPostingFormProps {
  onSuccess?: () => void
}

export function JobPostingForm({ onSuccess }: JobPostingFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<CreateJobPostingInput>({
    resolver: zodResolver(createJobPostingSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      employment_type: 'full_time',
    },
  })

  const onSubmit = async (data: CreateJobPostingInput) => {
    startTransition(async () => {
      const result = await createJobPosting(data)

      if (result.success) {
        toast.success('Job posting created successfully')
        onSuccess?.()
        router.push('/dashboard/recruitment/jobs')
      } else {
        toast.error(result.error?.message || 'Failed to create job posting')
      }
    })
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create Job Posting</CardTitle>
        <CardDescription>Create a new job posting for your organization</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Senior Developer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Job description and requirements..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Paris, France" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full_time">Full-time</SelectItem>
                        <SelectItem value="part_time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="temporary">Temporary</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Job Posting'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/recruitment/jobs')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

