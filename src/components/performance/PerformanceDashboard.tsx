'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, TrendingUp, Award, MessageSquare } from 'lucide-react'
import type { PerformanceReview, Feedback } from '@/src/types/database.types'

interface PerformanceDashboardProps {
  reviews: PerformanceReview[]
  feedback: Feedback[]
  onSelectReview?: (review: PerformanceReview) => void
}

export function PerformanceDashboard({ reviews, feedback, onSelectReview }: PerformanceDashboardProps) {
  const stats = {
    totalReviews: reviews.length,
    avgRating: reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.overall_rating || 0), 0) / reviews.filter(r => r.overall_rating).length).toFixed(1)
      : '0',
    completedReviews: reviews.filter((r) => r.status === 'completed').length,
    pendingReviews: reviews.filter((r) => r.status === 'draft').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Performance Management</h1>
        <p className="text-muted-foreground">Track reviews and feedback</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating}/5</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedReviews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedback.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews and Feedback Tabs */}
      <Tabs defaultValue="reviews">
        <TabsList>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          <TabsTrigger value="feedback">Feedback ({feedback.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-4 mt-6">
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Award className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No performance reviews yet</p>
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <Card
                key={review.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onSelectReview?.(review)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">Performance Review</CardTitle>
                      <CardDescription>
                        Created: {new Date(review.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        review.status === 'completed'
                          ? 'default'
                          : review.status === 'submitted'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {review.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {review.overall_rating && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Rating:</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: review.overall_rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="ml-2 text-sm text-muted-foreground">
                            {review.overall_rating}/5
                          </span>
                        </div>
                      </div>
                    )}

                    {review.strengths && (
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Strengths</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {review.strengths}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4 mt-6">
          {feedback.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No feedback yet</p>
              </CardContent>
            </Card>
          ) : (
            feedback.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base capitalize">{item.type} Feedback</CardTitle>
                      <CardDescription>
                        {new Date(item.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    {item.is_anonymous && <Badge variant="outline">Anonymous</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{item.content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
