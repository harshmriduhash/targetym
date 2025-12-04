/**
 * Example: Basic Performance Management
 *
 * Demonstrates performance review creation and management
 * with rating systems and feedback collection.
 *
 * @package performance-management
 */

import { ReviewForm, ReviewsList } from '@/public/registry/performance-management/files/components/performance'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { FileText, Users } from 'lucide-react'

export default function BasicPerformanceExample() {
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Performance Management</h1>
        <p className="text-muted-foreground mt-2">
          Conduct performance reviews, collect feedback, and track employee development
        </p>
      </div>

      <Tabs defaultValue="reviews" className="space-y-6">
        <TabsList>
          <TabsTrigger value="reviews" className="gap-2">
            <FileText className="h-4 w-4" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="create">Create Review</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-4">
          {/* Display all performance reviews */}
          <ReviewsList
            initialFilters={{
              status: 'in_progress' // Show active reviews
            }}
          />
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          {/* Create new performance review */}
          <ReviewForm
            onSuccess={() => {
              toast.success('Review created successfully!', {
                description: 'The employee will be notified to complete their self-assessment.'
              })
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

/**
 * Usage Notes:
 *
 * 1. ReviewForm component:
 *    - Employee selection
 *    - Review period configuration
 *    - Review type: annual, mid-year, probation, project-based
 *    - Rating categories customization
 *    - Self-assessment toggle
 *    - Peer feedback collection
 *
 * 2. ReviewsList component:
 *    - All performance reviews with status
 *    - Filter by status, employee, reviewer, period
 *    - Quick actions: view, edit, complete
 *    - Progress tracking
 *    - Due date reminders
 *
 * 3. Performance Review Workflow:
 *    a. Manager creates review
 *    b. Employee completes self-assessment
 *    c. Peers provide feedback (optional)
 *    d. Manager rates and provides feedback
 *    e. Review meeting scheduled
 *    f. Review finalized and shared
 *
 * 4. Rating Categories:
 *    - Technical skills
 *    - Communication
 *    - Leadership
 *    - Teamwork
 *    - Problem solving
 *    - Custom categories (configurable)
 *
 * 5. Required Server Actions:
 *    - createPerformanceReview
 *    - getPerformanceReviews
 *    - updateReviewStatus
 *    - createPeerFeedback
 *
 * 6. Database Requirements:
 *    - performance_reviews table
 *    - performance_ratings table
 *    - peer_feedback table
 *    - RLS policies for confidentiality
 */
