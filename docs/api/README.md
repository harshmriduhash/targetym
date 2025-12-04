# Targetym API Documentation

## Overview

Targetym provides a RESTful API for managing HR operations including Goals & OKRs, KPIs, Recruitment, and Performance Management.

## Base URLs

- **Local Development:** `http://localhost:3000/api`
- **Production:** `https://targetym.vercel.app/api`

## Authentication

All API endpoints require authentication using Clerk JWT tokens.

```bash
Authorization: Bearer <clerk_jwt_token>
```

### Getting a Token

1. Sign in to Targetym
2. Get the session token from Clerk
3. Use it in the `Authorization` header

## API Endpoints

### Goals & OKRs

#### List Goals
```http
GET /v1/goals?page=1&pageSize=20&status=active
```

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `pageSize` (integer, default: 20, max: 100) - Items per page
- `status` (string) - Filter by status: `draft`, `active`, `completed`, `cancelled`
- `period` (string) - Filter by period: `quarterly`, `annual`, `custom`
- `owner_id` (uuid) - Filter by owner

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Increase Revenue",
      "description": "Grow revenue by 30%",
      "period": "quarterly",
      "status": "active",
      "start_date": "2025-01-01",
      "end_date": "2025-03-31",
      "owner_id": "user-123",
      "organization_id": "org-123",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 45,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

#### Create Goal
```http
POST /v1/goals
Content-Type: application/json

{
  "title": "Increase Revenue",
  "description": "Grow revenue by 30%",
  "period": "quarterly",
  "status": "active",
  "start_date": "2025-01-01",
  "end_date": "2025-03-31",
  "visibility": "team"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Increase Revenue",
    "period": "quarterly",
    ...
  }
}
```

#### Get Goal
```http
GET /v1/goals/{goalId}
```

#### Update Goal
```http
PATCH /v1/goals/{goalId}
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "completed"
}
```

#### Delete Goal
```http
DELETE /v1/goals/{goalId}
```

### KPIs

#### List KPIs
```http
GET /v1/kpis?page=1&category=sales&department=engineering
```

**Query Parameters:**
- `page`, `pageSize` - Pagination
- `category` (string) - Filter by category
- `department` (string) - Filter by department
- `status` (string) - Filter by status
- `visibility` (string) - Filter by visibility

#### Create KPI
```http
POST /v1/kpis
Content-Type: application/json

{
  "name": "Monthly Recurring Revenue",
  "description": "Track MRR growth",
  "category": "revenue",
  "metric_type": "currency",
  "unit": "USD",
  "target_value": 100000,
  "baseline_value": 75000,
  "measurement_frequency": "monthly"
}
```

#### Add KPI Measurement
```http
POST /v1/kpis/{kpiId}/measurements
Content-Type: application/json

{
  "measured_value": 85000,
  "measured_at": "2025-01-31T23:59:59Z",
  "notes": "Strong month, exceeded expectations"
}
```

### Recruitment

#### List Job Postings
```http
GET /v1/recruitment/jobs?status=published
```

#### Create Job Posting
```http
POST /v1/recruitment/jobs
Content-Type: application/json

{
  "title": "Senior Software Engineer",
  "department": "Engineering",
  "location": "Remote",
  "employment_type": "full_time",
  "description": "...",
  "requirements": ["5+ years experience", "..."],
  "salary_min": 120000,
  "salary_max": 180000
}
```

#### List Candidates
```http
GET /v1/recruitment/candidates?job_posting_id={jobId}&status=screening
```

#### Create Candidate
```http
POST /v1/recruitment/candidates
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "job_posting_id": "job-123",
  "cv_url": "https://storage.supabase.co/...",
  "linkedin_url": "https://linkedin.com/in/johndoe"
}
```

### Performance Reviews

#### List Reviews
```http
GET /v1/performance/reviews?reviewee_id={userId}&status=completed
```

#### Create Review
```http
POST /v1/performance/reviews
Content-Type: application/json

{
  "reviewee_id": "user-456",
  "review_period_start": "2024-07-01",
  "review_period_end": "2024-12-31",
  "review_type": "semi_annual",
  "overall_rating": 4.5,
  "summary": "...",
  "strengths": "...",
  "areas_for_improvement": "..."
}
```

### AI Features

#### Score CV
```http
POST /v1/ai/score-cv
Content-Type: application/json

{
  "candidate_id": "candidate-123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 85,
    "summary": "Strong technical background with relevant experience",
    "recommendations": [
      "Schedule technical interview",
      "Verify leadership experience"
    ],
    "scored_at": "2025-01-01T10:00:00Z"
  }
}
```

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

### Error Codes

- `UNAUTHORIZED` (401) - Authentication required or invalid token
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `VALIDATION_ERROR` (400) - Invalid request data
- `CONFLICT` (409) - Resource already exists
- `INTERNAL_ERROR` (500) - Server error
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests

## Rate Limiting

API requests are rate limited per user:

- **Standard operations:** 60 requests/minute
- **Create operations:** 20 requests/minute
- **Bulk operations:** 10 requests/minute
- **AI operations:** 5 requests/minute

Rate limit headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1609459200
```

## Pagination

All list endpoints support pagination:

**Request:**
```http
GET /v1/goals?page=2&pageSize=50
```

**Response:**
```json
{
  "data": [...],
  "meta": {
    "page": 2,
    "pageSize": 50,
    "totalItems": 150,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": true
  }
}
```

## Filtering & Sorting

Most list endpoints support filtering:

```http
GET /v1/goals?status=active&period=quarterly&owner_id=user-123
```

Sorting (where supported):
```http
GET /v1/goals?sort=created_at&order=desc
```

## Webhooks

Coming soon: Real-time webhooks for events like:
- Goal created/updated
- KPI threshold breached
- Candidate status changed
- Review submitted

## SDKs

Official SDKs coming soon:
- JavaScript/TypeScript
- Python
- Ruby

## OpenAPI Specification

Full OpenAPI 3.0 spec available at: [`/docs/api/openapi.yaml`](./openapi.yaml)

Import into:
- Postman
- Insomnia
- Swagger UI
- Redoc

## Support

- **Documentation:** https://docs.targetym.com
- **API Status:** https://status.targetym.com
- **Support:** support@targetym.com
- **GitHub Issues:** https://github.com/targetym/issues

## Changelog

### v1.0.0 (2025-01-11)
- Initial API release
- Goals & OKRs endpoints
- KPIs management
- Recruitment pipeline
- Performance reviews
- AI-powered features
