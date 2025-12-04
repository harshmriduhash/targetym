// Extended types for new HR modules
import { Json } from './database.types';

// ============================================
// MODULE OKR - Types étendus
// ============================================

export type OKRLevel = 'individual' | 'team' | 'department' | 'company';
export type OKRPeriod = 'quarter' | 'semester' | 'year';
export type KeyResultType = 'quantitative' | 'qualitative';
export type MeasurementMethod = 'score' | 'percentage' | 'custom';

export interface OKRComment {
  id: string;
  okr_id: string;
  key_result_id?: string;
  author_id: string;
  author_name: string;
  content: string;
  mentions: string[];
  created_at: string;
  updated_at: string;
}

export interface OKRUpdate {
  id: string;
  key_result_id: string;
  previous_value: number;
  new_value: number;
  updated_by: string;
  updated_by_name: string;
  comment?: string;
  created_at: string;
}

export interface KeyResultExtended {
  id: string;
  goal_id: string;
  description: string;
  type: KeyResultType;
  measurement_method: MeasurementMethod;
  target_value: number;
  current_value: number;
  unit?: string;
  weight: number; // Importance relative (0-100)
  status: string;
  updates: OKRUpdate[];
  created_at: string;
  updated_at: string;
}

export interface GoalExtended {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  owner_id: string;
  owner_name: string;
  level: OKRLevel;
  period: OKRPeriod;
  start_date: string;
  end_date: string;
  parent_goal_id?: string;
  children_goals?: GoalExtended[];
  key_results: KeyResultExtended[];
  collaborators: string[];
  comments: OKRComment[];
  progress_percentage: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface OKRIntegration {
  id: string;
  organization_id: string;
  platform: 'notion' | 'asana' | 'teams' | 'slack' | 'google_calendar';
  enabled: boolean;
  config: Json;
  created_at: string;
  updated_at: string;
}

export interface OKRReminder {
  id: string;
  organization_id: string;
  okr_id: string;
  reminder_type: 'update' | 'deadline' | 'blocked';
  recipients: string[];
  frequency: 'daily' | 'weekly' | 'monthly';
  last_sent_at?: string;
  created_at: string;
}

export interface OKRAIRecommendation {
  id: string;
  organization_id: string;
  recommendation_type: 'objective' | 'key_result' | 'adjustment';
  target_id?: string;
  content: string;
  confidence_score: number;
  based_on: Json;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

// ============================================
// MODULE FORMATION & DÉVELOPPEMENT
// ============================================

export type CourseProvider = 'internal' | 'coursera' | 'udemy' | 'linkedin' | 'managersity' | 'other';
export type CourseStatus = 'not_started' | 'in_progress' | 'completed' | 'failed';
export type CertificationStatus = 'active' | 'expired' | 'pending';

export interface Course {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  provider: CourseProvider;
  external_url?: string;
  duration_hours: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  is_mandatory: boolean;
  required_for_positions: string[];
  skills_covered: string[];
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  id: string;
  organization_id: string;
  course_id: string;
  profile_id: string;
  status: CourseStatus;
  progress_percentage: number;
  started_at?: string;
  completed_at?: string;
  score?: number;
  certificate_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: string;
  organization_id: string;
  profile_id: string;
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date?: string;
  certificate_url?: string;
  status: CertificationStatus;
  created_at: string;
  updated_at: string;
}

export interface SkillAssessment {
  id: string;
  organization_id: string;
  profile_id: string;
  skill_name: string;
  self_rating: number; // 1-5
  manager_rating?: number; // 1-5
  target_rating: number; // 1-5
  gap: number;
  assessed_at: string;
  created_at: string;
  updated_at: string;
}

export interface DevelopmentPlan {
  id: string;
  organization_id: string;
  profile_id: string;
  current_position: string;
  target_position?: string;
  skills_to_develop: SkillAssessment[];
  recommended_courses: string[];
  recommended_mentors: string[];
  timeline_months: number;
  progress_percentage: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface LearningPath {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  target_role: string;
  courses: string[];
  estimated_duration_hours: number;
  prerequisites: string[];
  created_at: string;
  updated_at: string;
}

export interface TrainingBudget {
  id: string;
  organization_id: string;
  profile_id: string;
  year: number;
  total_budget: number;
  used_budget: number;
  remaining_budget: number;
  currency: string;
  updated_at: string;
}

// ============================================
// MODULE TALENT ACQUISITION & CARRIÈRE (Extended)
// ============================================

export type OnboardingStepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export interface OnboardingChecklist {
  id: string;
  organization_id: string;
  profile_id: string;
  position: string;
  steps: OnboardingStep[];
  overall_progress: number;
  start_date: string;
  expected_completion_date: string;
  actual_completion_date?: string;
  created_at: string;
  updated_at: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  responsible_party: 'hr' | 'manager' | 'employee' | 'it';
  status: OnboardingStepStatus;
  due_date?: string;
  completed_at?: string;
  completed_by?: string;
  notes?: string;
  order: number;
}

export interface CareerPath {
  id: string;
  organization_id: string;
  from_position: string;
  to_position: string;
  path_type: 'vertical' | 'horizontal' | 'diagonal';
  required_skills: string[];
  required_experience_years: number;
  typical_duration_months: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface InternalMobilityOpportunity {
  id: string;
  organization_id: string;
  position_title: string;
  department: string;
  manager_id: string;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  available_from: string;
  status: 'open' | 'closed' | 'filled';
  created_at: string;
  updated_at: string;
}

export interface CareerInterview {
  id: string;
  organization_id: string;
  profile_id: string;
  manager_id: string;
  interview_date: string;
  aspirations: string;
  strengths: string;
  development_areas: string;
  agreed_actions: Json;
  next_review_date?: string;
  created_at: string;
  updated_at: string;
}

export interface TalentPool {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  criteria: Json;
  member_ids: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SuccessionPlan {
  id: string;
  organization_id: string;
  position: string;
  current_holder_id?: string;
  successors: SuccessionCandidate[];
  criticality: 'high' | 'medium' | 'low';
  timeline_months: number;
  status: 'active' | 'completed' | 'on_hold';
  created_at: string;
  updated_at: string;
}

export interface SuccessionCandidate {
  profile_id: string;
  readiness_level: 'ready_now' | 'ready_1_year' | 'ready_2_years' | 'needs_development';
  development_plan_id?: string;
  notes?: string;
}

// ============================================
// MODULE PEOPLE ANALYTICS & IA
// ============================================

export type AIRecommendationType =
  | 'recruitment_profile'
  | 'high_potential'
  | 'turnover_risk'
  | 'development_path'
  | 'team_composition'
  | 'salary_adjustment';

export interface AIRecommendation {
  id: string;
  organization_id: string;
  recommendation_type: AIRecommendationType;
  target_id?: string;
  target_type?: 'profile' | 'team' | 'department';
  title: string;
  description: string;
  confidence_score: number; // 0-100
  supporting_data: Json;
  actions_suggested: string[];
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'reviewed' | 'implemented' | 'dismissed';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface TurnoverRiskAnalysis {
  id: string;
  organization_id: string;
  profile_id: string;
  risk_score: number; // 0-100
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  contributing_factors: RiskFactor[];
  recommended_actions: string[];
  analyzed_at: string;
  created_at: string;
}

export interface RiskFactor {
  factor: string;
  weight: number;
  description: string;
}

export interface TalentSegment {
  id: string;
  organization_id: string;
  segment_name: string;
  criteria: Json;
  member_count: number;
  characteristics: Json;
  created_at: string;
  updated_at: string;
}

export interface HRAnalyticsDashboard {
  organization_id: string;
  period_start: string;
  period_end: string;

  // Recrutement
  recruitment_metrics: {
    positions_opened: number;
    positions_filled: number;
    average_time_to_hire: number;
    cost_per_hire: number;
    offer_acceptance_rate: number;
    source_effectiveness: Record<string, number>;
  };

  // Onboarding
  onboarding_metrics: {
    new_hires: number;
    average_onboarding_duration: number;
    onboarding_completion_rate: number;
  };

  // Formation
  training_metrics: {
    total_training_hours: number;
    average_hours_per_employee: number;
    training_completion_rate: number;
    training_satisfaction_score: number;
    certifications_earned: number;
  };

  // Performance
  performance_metrics: {
    average_performance_rating: number;
    high_performers_percentage: number;
    low_performers_percentage: number;
    goals_achievement_rate: number;
  };

  // Rétention
  retention_metrics: {
    turnover_rate: number;
    voluntary_turnover_rate: number;
    average_tenure: number;
    high_risk_employees: number;
  };

  // Diversité & Inclusion
  diversity_metrics: {
    gender_distribution: Record<string, number>;
    age_distribution: Record<string, number>;
    department_distribution: Record<string, number>;
    seniority_distribution: Record<string, number>;
  };

  // Engagement
  engagement_metrics: {
    overall_engagement_score: number;
    participation_rate: number;
    eNPS: number;
  };
}

export interface PredictiveAnalysis {
  id: string;
  organization_id: string;
  analysis_type: 'turnover' | 'performance' | 'skills_gap' | 'hiring_needs';
  predictions: Json;
  confidence_interval: number;
  model_version: string;
  generated_at: string;
  valid_until: string;
  created_at: string;
}

export interface SkillsInventory {
  organization_id: string;
  generated_at: string;
  skills: SkillDistribution[];
}

export interface SkillDistribution {
  skill_name: string;
  total_employees: number;
  proficiency_levels: {
    beginner: number;
    intermediate: number;
    advanced: number;
    expert: number;
  };
  demand_trend: 'increasing' | 'stable' | 'decreasing';
}

// ============================================
// INTEGRATION & NOTIFICATIONS
// ============================================

export interface SystemNotification {
  id: string;
  organization_id: string;
  recipient_id: string;
  notification_type: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  read_at?: string;
}

export interface ActivityLog {
  id: string;
  organization_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes: Json;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}
