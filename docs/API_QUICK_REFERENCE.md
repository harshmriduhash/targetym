## Référence rapide API

Toutes les routes exigent un utilisateur authentifié via Supabase Auth. Les réponses utilisent JSON.

### Goals
- GET `/api/goals`
  - Query: `owner_id?`, `status?`, `period?`
  - 200 `{ data: Goal[] }`
- POST `/api/goals`
  - Body:
    ```json
    { "title":"Q4 Growth", "description":"...", "status":"draft", "period":"quarterly", "start_date":"2025-10-01T00:00:00Z", "end_date":"2025-12-31T00:00:00Z", "visibility":"team", "parent_goal_id":null }
    ```
  - 201 `{ id: string }`
- GET `/api/goals/{id}` → 200 `{ data: Goal }`
- PATCH `/api/goals/{id}` → 200 `{ data: Goal }`
- DELETE `/api/goals/{id}` → 204

### Recruitment
- GET `/api/recruitment/jobs`
  - Query: `status?`, `department?`, `hiring_manager_id?`
  - 200 `{ data: JobPosting[] }`
- POST `/api/recruitment/jobs`
  - Body:
    ```json
    { "title":"Frontend Dev", "description":"...", "location":"Remote", "employment_type":"full_time", "salary_range_min":50000, "salary_range_max":65000, "currency":"USD" }
    ```
  - 201 `{ id: string }`
- GET `/api/recruitment/candidates`
  - Query: `job_posting_id?`, `status?`, `current_stage?`
  - 200 `{ data: Candidate[] }`
- POST `/api/recruitment/candidates`
  - Body:
    ```json
    { "job_posting_id":"uuid", "first_name":"Ada", "last_name":"Lovelace", "email":"ada@x.io", "phone":"+33...", "linkedin_url":"https://..." }
    ```
  - 201 `{ id: string }`
- PATCH `/api/recruitment/candidates/{id}/status`
  - Body: `{ "status":"interviewing", "current_stage":"technical" }`
  - 200 `{ data: Candidate }`

### Performance
- GET `/api/performance/reviews`
  - Query: `reviewee_id?`, `reviewer_id?`, `status?`, `review_period?`
  - 200 `{ data: PerformanceReview[] }`
- POST `/api/performance/reviews`
  - Body:
    ```json
    { "employee_id":"uuid", "review_type":"manager", "review_period":"2025-Q4" }
    ```
  - 201 `{ id: string }`
- PATCH `/api/performance/reviews/{id}`
  - Body: `updatePerformanceReviewSchema` partiel
  - 200 `{ data: PerformanceReview }`
- POST `/api/performance/feedback`
  - Body:
    ```json
    { "recipient_id":"reviewId-uuid", "feedback_type":"general", "content":"Great teamwork", "is_anonymous":false }
    ```
  - 201 `{ id: string }`

### AI
- POST `/api/ai/score-cv`
  - Body:
    ```json
    { "candidate_id":"uuid", "score":85, "summary":"...", "strengths":["React"], "concerns":["Testing"], "recommendation":"yes" }
    ```
  - 200 `{ success: true }`
- POST `/api/ai/recommend-career`
  - Body:
    ```json
    { "profile_id":"uuid", "current_level":"IC2", "target_level":"IC3", "development_areas":["Architecture"], "recommended_courses":["System Design"] }
    ```
  - 200 `{ success: true }`

Notes:
- Auth: Bearer cookie/session via Supabase; RLS recommandé côté DB.
- Dates: ISO 8601 (UTC) recommandées.

