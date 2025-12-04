/**
 * Example: Performance Analytics with Charts
 *
 * Visual performance tracking with charts and trend analysis
 * using Recharts for data visualization.
 *
 * @package performance-management
 */

'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPerformanceReviews } from '@/src/actions/performance'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, Award, Target, Users } from 'lucide-react'

export default function PerformanceAnalyticsExample() {
  const [employeeId, setEmployeeId] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<string>('year')

  // Fetch performance data
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['performance-analytics', employeeId, timeRange],
    queryFn: async () => {
      const result = await getPerformanceReviews({
        filters: employeeId !== 'all' ? { employee_id: employeeId } : {},
      })
      if (!result.success) throw new Error(result.error.message)
      return result.data
    },
  })

  // Process data for charts
  const performanceTrendData = reviews?.data.map((review: any) => ({
    period: new Date(review.review_period_start).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    }),
    overall_rating: review.overall_rating || 0,
    technical: review.ratings?.technical || 0,
    communication: review.ratings?.communication || 0,
    leadership: review.ratings?.leadership || 0,
  })) || []

  // Skills radar data (latest review)
  const latestReview = reviews?.data[0]
  const skillsRadarData = latestReview ? [
    { skill: 'Technical', rating: latestReview.ratings?.technical || 0 },
    { skill: 'Communication', rating: latestReview.ratings?.communication || 0 },
    { skill: 'Leadership', rating: latestReview.ratings?.leadership || 0 },
    { skill: 'Teamwork', rating: latestReview.ratings?.teamwork || 0 },
    { skill: 'Problem Solving', rating: latestReview.ratings?.problem_solving || 0 },
  ] : []

  // Rating distribution
  const ratingDistribution = [
    { rating: '5 - Exceptional', count: reviews?.data.filter((r: any) => r.overall_rating >= 4.5).length || 0 },
    { rating: '4 - Exceeds', count: reviews?.data.filter((r: any) => r.overall_rating >= 3.5 && r.overall_rating < 4.5).length || 0 },
    { rating: '3 - Meets', count: reviews?.data.filter((r: any) => r.overall_rating >= 2.5 && r.overall_rating < 3.5).length || 0 },
    { rating: '2 - Needs Improvement', count: reviews?.data.filter((r: any) => r.overall_rating >= 1.5 && r.overall_rating < 2.5).length || 0 },
    { rating: '1 - Unsatisfactory', count: reviews?.data.filter((r: any) => r.overall_rating < 1.5).length || 0 },
  ]

  // Calculate key metrics
  const avgRating = reviews?.data.reduce((acc: number, r: any) => acc + (r.overall_rating || 0), 0) / (reviews?.data.length || 1)
  const improvementTrend = reviews?.data.length > 1
    ? ((reviews.data[0].overall_rating || 0) - (reviews.data[reviews.data.length - 1].overall_rating || 0))
    : 0

  return (
    <div className="container mx-auto py-6 max-w-7xl space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Performance Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track performance trends and analyze employee development over time
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={employeeId} onValueChange={setEmployeeId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select employee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employees</SelectItem>
            {/* Add employee options from your data */}
          </SelectContent>
        </Select>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="quarter">Last Quarter</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">out of 5.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improvement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {improvementTrend > 0 ? '+' : ''}{improvementTrend.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">vs previous review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews?.data.length || 0}</div>
            <p className="text-xs text-muted-foreground">completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peer Feedback</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviews?.data.reduce((acc: number, r: any) => acc + (r.peer_feedback?.length || 0), 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">total received</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
          <CardDescription>
            Track rating changes over time across different categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={performanceTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="overall_rating"
                stroke="#8884d8"
                strokeWidth={2}
                name="Overall"
              />
              <Line
                type="monotone"
                dataKey="technical"
                stroke="#82ca9d"
                strokeWidth={2}
                name="Technical"
              />
              <Line
                type="monotone"
                dataKey="communication"
                stroke="#ffc658"
                strokeWidth={2}
                name="Communication"
              />
              <Line
                type="monotone"
                dataKey="leadership"
                stroke="#ff8042"
                strokeWidth={2}
                name="Leadership"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Skills Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Skills Assessment</CardTitle>
            <CardDescription>
              Latest review ratings across all skill categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={skillsRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={90} domain={[0, 5]} />
                <Radar
                  name="Rating"
                  dataKey="rating"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>
              Breakdown of performance ratings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * Analytics Features:
 *
 * 1. Key Metrics Cards:
 *    - Average rating across all reviews
 *    - Improvement trend vs previous period
 *    - Total completed reviews
 *    - Peer feedback count
 *
 * 2. Performance Trend Chart:
 *    - Line chart showing rating changes over time
 *    - Multiple lines for different skill categories
 *    - Filterable by employee and time range
 *    - Identifies patterns and trends
 *
 * 3. Skills Radar Chart:
 *    - Visual representation of skill strengths
 *    - Latest review ratings
 *    - Easy identification of development areas
 *    - Comprehensive skill coverage
 *
 * 4. Rating Distribution:
 *    - Bar chart of rating frequency
 *    - Standard rating scale (1-5)
 *    - Team or individual view
 *    - Performance benchmarking
 *
 * 5. Data Processing:
 *    - Aggregates review data
 *    - Calculates trends and averages
 *    - Handles missing data gracefully
 *    - Real-time updates via React Query
 *
 * 6. Use Cases:
 *    - Individual performance tracking
 *    - Team performance analysis
 *    - Identify training needs
 *    - Track development progress
 *    - Support promotion decisions
 *
 * 7. Dependencies:
 *    - recharts: Chart library
 *    - @tanstack/react-query: Data fetching
 *    - Performance review data structure
 */
