export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ab_test_assignments: {
        Row: {
          assigned_at: string | null
          experiment_id: string
          id: string
          user_id: string
          variant_id: string
        }
        Insert: {
          assigned_at?: string | null
          experiment_id: string
          id?: string
          user_id: string
          variant_id: string
        }
        Update: {
          assigned_at?: string | null
          experiment_id?: string
          id?: string
          user_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_assignments_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "ab_test_experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_test_experiments: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          metadata: Json | null
          name: string
          start_date: string | null
          status: string | null
          target_percentage: number | null
          updated_at: string | null
          variants: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id: string
          metadata?: Json | null
          name: string
          start_date?: string | null
          status?: string | null
          target_percentage?: number | null
          updated_at?: string | null
          variants?: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          start_date?: string | null
          status?: string | null
          target_percentage?: number | null
          updated_at?: string | null
          variants?: Json
        }
        Relationships: []
      }
      ab_test_exposures: {
        Row: {
          experiment_id: string
          exposed_at: string | null
          id: string
          user_id: string
          variant_id: string
        }
        Insert: {
          experiment_id: string
          exposed_at?: string | null
          id?: string
          user_id: string
          variant_id: string
        }
        Update: {
          experiment_id?: string
          exposed_at?: string | null
          id?: string
          user_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_exposures_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "ab_test_experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_exposures_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_activities: {
        Row: {
          agent_type: string
          completed_at: string | null
          created_at: string
          duration_seconds: number | null
          error_message: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          started_at: string | null
          status: string | null
          task_description: string | null
          task_id: string | null
          task_type: string
          updated_at: string
        }
        Insert: {
          agent_type: string
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          started_at?: string | null
          status?: string | null
          task_description?: string | null
          task_id?: string | null
          task_type: string
          updated_at?: string
        }
        Update: {
          agent_type?: string
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          started_at?: string | null
          status?: string | null
          task_description?: string | null
          task_id?: string | null
          task_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "agent_activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "agent_activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_communications: {
        Row: {
          context: string | null
          created_at: string
          dependencies: string[] | null
          from_agent: string
          id: string
          message_type: string
          payload: Json | null
          responded_at: string | null
          to_agent: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          dependencies?: string[] | null
          from_agent: string
          id?: string
          message_type: string
          payload?: Json | null
          responded_at?: string | null
          to_agent: string
        }
        Update: {
          context?: string | null
          created_at?: string
          dependencies?: string[] | null
          from_agent?: string
          id?: string
          message_type?: string
          payload?: Json | null
          responded_at?: string | null
          to_agent?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          organization_id: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_notes: {
        Row: {
          candidate_id: string
          created_at: string
          created_by: string
          id: string
          is_private: boolean | null
          note: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          created_by: string
          id?: string
          is_private?: boolean | null
          note: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          created_by?: string
          id?: string
          is_private?: boolean | null
          note?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_notes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_notes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "candidate_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "candidate_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          ai_analyzed_at: string | null
          ai_concerns: string[] | null
          ai_cv_recommendation: string | null
          ai_cv_score: number | null
          ai_cv_summary: string | null
          ai_recommendation: string | null
          ai_score: number | null
          ai_scored_at: string | null
          ai_strengths: string[] | null
          ai_summary: string | null
          applied_at: string
          cover_letter: string | null
          created_at: string
          email: string
          first_name: string
          full_name: string | null
          github_url: string | null
          id: string
          job_posting_id: string | null
          last_name: string
          linkedin_url: string | null
          organization_id: string
          phone: string | null
          portfolio_url: string | null
          rating: number | null
          resume_url: string | null
          search_vector: unknown
          source: string | null
          status: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          ai_analyzed_at?: string | null
          ai_concerns?: string[] | null
          ai_cv_recommendation?: string | null
          ai_cv_score?: number | null
          ai_cv_summary?: string | null
          ai_recommendation?: string | null
          ai_score?: number | null
          ai_scored_at?: string | null
          ai_strengths?: string[] | null
          ai_summary?: string | null
          applied_at?: string
          cover_letter?: string | null
          created_at?: string
          email: string
          first_name: string
          full_name?: string | null
          github_url?: string | null
          id?: string
          job_posting_id?: string | null
          last_name: string
          linkedin_url?: string | null
          organization_id: string
          phone?: string | null
          portfolio_url?: string | null
          rating?: number | null
          resume_url?: string | null
          search_vector?: unknown
          source?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          ai_analyzed_at?: string | null
          ai_concerns?: string[] | null
          ai_cv_recommendation?: string | null
          ai_cv_score?: number | null
          ai_cv_summary?: string | null
          ai_recommendation?: string | null
          ai_score?: number | null
          ai_scored_at?: string | null
          ai_strengths?: string[] | null
          ai_summary?: string | null
          applied_at?: string
          cover_letter?: string | null
          created_at?: string
          email?: string
          first_name?: string
          full_name?: string | null
          github_url?: string | null
          id?: string
          job_posting_id?: string | null
          last_name?: string
          linkedin_url?: string | null
          organization_id?: string
          phone?: string | null
          portfolio_url?: string | null
          rating?: number | null
          resume_url?: string | null
          search_vector?: unknown
          source?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidates_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "candidates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "candidates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      career_development: {
        Row: {
          career_path: string | null
          certifications_to_pursue: string[] | null
          created_at: string
          current_level: string | null
          development_goals: string[] | null
          id: string
          mentor_id: string | null
          notes: string | null
          organization_id: string
          profile_id: string
          skills_to_develop: string[] | null
          status: string | null
          target_completion_date: string | null
          target_level: string | null
          updated_at: string
        }
        Insert: {
          career_path?: string | null
          certifications_to_pursue?: string[] | null
          created_at?: string
          current_level?: string | null
          development_goals?: string[] | null
          id?: string
          mentor_id?: string | null
          notes?: string | null
          organization_id: string
          profile_id: string
          skills_to_develop?: string[] | null
          status?: string | null
          target_completion_date?: string | null
          target_level?: string | null
          updated_at?: string
        }
        Update: {
          career_path?: string | null
          certifications_to_pursue?: string[] | null
          created_at?: string
          current_level?: string | null
          development_goals?: string[] | null
          id?: string
          mentor_id?: string | null
          notes?: string | null
          organization_id?: string
          profile_id?: string
          skills_to_develop?: string[] | null
          status?: string | null
          target_completion_date?: string | null
          target_level?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_development_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_development_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "career_development_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "career_development_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_development_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string
          email: string
          first_name: string
          hire_date: string
          id: string
          last_name: string
          location: string | null
          organization_id: string
          phone: string | null
          role: string
          search_vector: unknown
          status: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department: string
          email: string
          first_name: string
          hire_date: string
          id?: string
          last_name: string
          location?: string | null
          organization_id: string
          phone?: string | null
          role: string
          search_vector?: unknown
          status?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string
          email?: string
          first_name?: string
          hire_date?: string
          id?: string
          last_name?: string
          location?: string | null
          organization_id?: string
          phone?: string | null
          role?: string
          search_vector?: unknown
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "employees_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "employees_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          category: string
          created_at: string
          helpful_count: number
          id: string
          order_index: number | null
          organization_id: string
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          category: string
          created_at?: string
          helpful_count?: number
          id?: string
          order_index?: number | null
          organization_id: string
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          helpful_count?: number
          id?: string
          order_index?: number | null
          organization_id?: string
          question?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "faqs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "faqs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "faqs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flag_overrides: {
        Row: {
          created_at: string | null
          enabled: boolean
          flag_name: string
          id: string
          reason: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          enabled: boolean
          flag_name: string
          id?: string
          reason?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          enabled?: boolean
          flag_name?: string
          id?: string
          reason?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_flag_overrides_flag_name_fkey"
            columns: ["flag_name"]
            isOneToOne: false
            referencedRelation: "feature_flags"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "feature_flag_overrides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          config: Json | null
          created_at: string | null
          description: string | null
          enabled: boolean | null
          id: string
          name: string
          rollout_percentage: number | null
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          name: string
          rollout_percentage?: number | null
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          name?: string
          rollout_percentage?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      form_entries: {
        Row: {
          created_at: string
          department: string
          form_data: Json | null
          form_name: string
          id: string
          organization_id: string
          priority: string
          reviewed_at: string | null
          reviewed_by_id: string | null
          status: string
          submitted_at: string
          submitted_by_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department: string
          form_data?: Json | null
          form_name: string
          id?: string
          organization_id: string
          priority?: string
          reviewed_at?: string | null
          reviewed_by_id?: string | null
          status?: string
          submitted_at?: string
          submitted_by_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string
          form_data?: Json | null
          form_name?: string
          id?: string
          organization_id?: string
          priority?: string
          reviewed_at?: string | null
          reviewed_by_id?: string | null
          status?: string
          submitted_at?: string
          submitted_by_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "form_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "form_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_entries_reviewed_by_id_fkey"
            columns: ["reviewed_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_entries_submitted_by_id_fkey"
            columns: ["submitted_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_collaborators: {
        Row: {
          added_at: string
          goal_id: string
          id: string
          profile_id: string
          role: string | null
        }
        Insert: {
          added_at?: string
          goal_id: string
          id?: string
          profile_id: string
          role?: string | null
        }
        Update: {
          added_at?: string
          goal_id?: string
          id?: string
          profile_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_collaborators_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_collaborators_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "mv_goals_with_progress"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_collaborators_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          alignment_level: string | null
          confidence_level: number | null
          created_at: string
          deleted_at: string | null
          description: string | null
          end_date: string | null
          goal_type: string | null
          id: string
          is_aspirational: boolean | null
          organization_id: string
          owner_id: string
          parent_goal_id: string | null
          period: string
          priority: string | null
          progress_percentage: number | null
          search_vector: unknown
          start_date: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
          visibility: string | null
        }
        Insert: {
          alignment_level?: string | null
          confidence_level?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          goal_type?: string | null
          id?: string
          is_aspirational?: boolean | null
          organization_id: string
          owner_id: string
          parent_goal_id?: string | null
          period: string
          priority?: string | null
          progress_percentage?: number | null
          search_vector?: unknown
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          visibility?: string | null
        }
        Update: {
          alignment_level?: string | null
          confidence_level?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          goal_type?: string | null
          id?: string
          is_aspirational?: boolean | null
          organization_id?: string
          owner_id?: string
          parent_goal_id?: string | null
          period?: string
          priority?: string | null
          progress_percentage?: number | null
          search_vector?: unknown
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "goals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "goals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_parent_goal_id_fkey"
            columns: ["parent_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_parent_goal_id_fkey"
            columns: ["parent_goal_id"]
            isOneToOne: false
            referencedRelation: "mv_goals_with_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_consents: {
        Row: {
          consent_type: string
          consent_version: string | null
          created_at: string
          data_categories: string[] | null
          granted: boolean | null
          granted_at: string | null
          id: string
          integration_id: string
          ip_address: string | null
          metadata: Json | null
          revoked_at: string | null
          scopes: string[] | null
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          consent_type: string
          consent_version?: string | null
          created_at?: string
          data_categories?: string[] | null
          granted?: boolean | null
          granted_at?: string | null
          id?: string
          integration_id: string
          ip_address?: string | null
          metadata?: Json | null
          revoked_at?: string | null
          scopes?: string[] | null
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          consent_type?: string
          consent_version?: string | null
          created_at?: string
          data_categories?: string[] | null
          granted?: boolean | null
          granted_at?: string | null
          id?: string
          integration_id?: string
          ip_address?: string | null
          metadata?: Json | null
          revoked_at?: string | null
          scopes?: string[] | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_consents_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_consents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_credentials: {
        Row: {
          access_token_encrypted: string
          created_at: string
          encryption_key_id: string
          expires_at: string | null
          id: string
          integration_id: string
          last_rotated_at: string | null
          pkce_verifier_encrypted: string | null
          refresh_token_encrypted: string | null
          scopes: string[] | null
          token_type: string | null
          updated_at: string
        }
        Insert: {
          access_token_encrypted: string
          created_at?: string
          encryption_key_id: string
          expires_at?: string | null
          id?: string
          integration_id: string
          last_rotated_at?: string | null
          pkce_verifier_encrypted?: string | null
          refresh_token_encrypted?: string | null
          scopes?: string[] | null
          token_type?: string | null
          updated_at?: string
        }
        Update: {
          access_token_encrypted?: string
          created_at?: string
          encryption_key_id?: string
          expires_at?: string | null
          id?: string
          integration_id?: string
          last_rotated_at?: string | null
          pkce_verifier_encrypted?: string | null
          refresh_token_encrypted?: string | null
          scopes?: string[] | null
          token_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_credentials_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: true
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_oauth_states: {
        Row: {
          code_challenge: string
          code_verifier: string
          created_at: string
          expires_at: string
          id: string
          initiated_by: string | null
          ip_address: string | null
          organization_id: string
          provider_id: string
          redirect_uri: string
          scopes: string[] | null
          state: string
          used_at: string | null
          user_agent: string | null
        }
        Insert: {
          code_challenge: string
          code_verifier: string
          created_at?: string
          expires_at?: string
          id?: string
          initiated_by?: string | null
          ip_address?: string | null
          organization_id: string
          provider_id: string
          redirect_uri: string
          scopes?: string[] | null
          state: string
          used_at?: string | null
          user_agent?: string | null
        }
        Update: {
          code_challenge?: string
          code_verifier?: string
          created_at?: string
          expires_at?: string
          id?: string
          initiated_by?: string | null
          ip_address?: string | null
          organization_id?: string
          provider_id?: string
          redirect_uri?: string
          scopes?: string[] | null
          state?: string
          used_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_oauth_states_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_oauth_states_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "integration_oauth_states_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "integration_oauth_states_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_oauth_states_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "integration_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_providers: {
        Row: {
          authorization_endpoint: string | null
          created_at: string
          default_scopes: string[] | null
          description: string | null
          display_name: string
          documentation_url: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          oauth_version: string | null
          rate_limit_per_hour: number | null
          revocation_endpoint: string | null
          scopes_available: string[] | null
          token_endpoint: string | null
          updated_at: string
          webhook_support: boolean | null
        }
        Insert: {
          authorization_endpoint?: string | null
          created_at?: string
          default_scopes?: string[] | null
          description?: string | null
          display_name: string
          documentation_url?: string | null
          icon_url?: string | null
          id: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          oauth_version?: string | null
          rate_limit_per_hour?: number | null
          revocation_endpoint?: string | null
          scopes_available?: string[] | null
          token_endpoint?: string | null
          updated_at?: string
          webhook_support?: boolean | null
        }
        Update: {
          authorization_endpoint?: string | null
          created_at?: string
          default_scopes?: string[] | null
          description?: string | null
          display_name?: string
          documentation_url?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          oauth_version?: string | null
          rate_limit_per_hour?: number | null
          revocation_endpoint?: string | null
          scopes_available?: string[] | null
          token_endpoint?: string | null
          updated_at?: string
          webhook_support?: boolean | null
        }
        Relationships: []
      }
      integration_sync_logs: {
        Row: {
          completed_at: string | null
          created_at: string
          direction: string
          duration_ms: number | null
          error_details: Json | null
          error_message: string | null
          error_stack: string | null
          id: string
          integration_id: string
          metadata: Json | null
          records_created: number | null
          records_failed: number | null
          records_processed: number | null
          records_updated: number | null
          resource_count: number | null
          resource_type: string | null
          started_at: string
          status: string
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          direction: string
          duration_ms?: number | null
          error_details?: Json | null
          error_message?: string | null
          error_stack?: string | null
          id?: string
          integration_id: string
          metadata?: Json | null
          records_created?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          resource_count?: number | null
          resource_type?: string | null
          started_at?: string
          status: string
          sync_type: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          direction?: string
          duration_ms?: number | null
          error_details?: Json | null
          error_message?: string | null
          error_stack?: string | null
          id?: string
          integration_id?: string
          metadata?: Json | null
          records_created?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          resource_count?: number | null
          resource_type?: string | null
          started_at?: string
          status?: string
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_sync_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_webhooks: {
        Row: {
          created_at: string
          event_types: string[] | null
          external_webhook_id: string | null
          id: string
          integration_id: string
          is_active: boolean | null
          last_received_at: string | null
          last_verified_at: string | null
          metadata: Json | null
          secret_encrypted: string
          signature_header: string | null
          total_failed: number | null
          total_received: number | null
          updated_at: string
          webhook_url: string
        }
        Insert: {
          created_at?: string
          event_types?: string[] | null
          external_webhook_id?: string | null
          id?: string
          integration_id: string
          is_active?: boolean | null
          last_received_at?: string | null
          last_verified_at?: string | null
          metadata?: Json | null
          secret_encrypted: string
          signature_header?: string | null
          total_failed?: number | null
          total_received?: number | null
          updated_at?: string
          webhook_url: string
        }
        Update: {
          created_at?: string
          event_types?: string[] | null
          external_webhook_id?: string | null
          id?: string
          integration_id?: string
          is_active?: boolean | null
          last_received_at?: string | null
          last_verified_at?: string | null
          metadata?: Json | null
          secret_encrypted?: string
          signature_header?: string | null
          total_failed?: number | null
          total_received?: number | null
          updated_at?: string
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_webhooks_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          connected_at: string | null
          connected_by: string | null
          consecutive_failures: number | null
          created_at: string
          disconnected_at: string | null
          error_details: Json | null
          error_message: string | null
          health_status: string | null
          id: string
          last_health_check_at: string | null
          last_sync_at: string | null
          metadata: Json | null
          name: string | null
          next_sync_at: string | null
          organization_id: string
          provider_id: string
          scopes_granted: string[] | null
          settings: Json | null
          status: string | null
          sync_enabled: boolean | null
          sync_frequency: string | null
          updated_at: string
          workspace_id: string | null
          workspace_name: string | null
        }
        Insert: {
          connected_at?: string | null
          connected_by?: string | null
          consecutive_failures?: number | null
          created_at?: string
          disconnected_at?: string | null
          error_details?: Json | null
          error_message?: string | null
          health_status?: string | null
          id?: string
          last_health_check_at?: string | null
          last_sync_at?: string | null
          metadata?: Json | null
          name?: string | null
          next_sync_at?: string | null
          organization_id: string
          provider_id: string
          scopes_granted?: string[] | null
          settings?: Json | null
          status?: string | null
          sync_enabled?: boolean | null
          sync_frequency?: string | null
          updated_at?: string
          workspace_id?: string | null
          workspace_name?: string | null
        }
        Update: {
          connected_at?: string | null
          connected_by?: string | null
          consecutive_failures?: number | null
          created_at?: string
          disconnected_at?: string | null
          error_details?: Json | null
          error_message?: string | null
          health_status?: string | null
          id?: string
          last_health_check_at?: string | null
          last_sync_at?: string | null
          metadata?: Json | null
          name?: string | null
          next_sync_at?: string | null
          organization_id?: string
          provider_id?: string
          scopes_granted?: string[] | null
          settings?: Json | null
          status?: string | null
          sync_enabled?: boolean | null
          sync_frequency?: string | null
          updated_at?: string
          workspace_id?: string | null
          workspace_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrations_connected_by_fkey"
            columns: ["connected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integrations_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "integration_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          candidate_id: string
          created_at: string
          duration_minutes: number | null
          feedback: string | null
          id: string
          interview_type: string | null
          interviewer_id: string
          job_posting_id: string | null
          location: string | null
          meeting_link: string | null
          notes: string | null
          organization_id: string
          rating: number | null
          recommendation: string | null
          scheduled_at: string
          status: string | null
          updated_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          duration_minutes?: number | null
          feedback?: string | null
          id?: string
          interview_type?: string | null
          interviewer_id: string
          job_posting_id?: string | null
          location?: string | null
          meeting_link?: string | null
          notes?: string | null
          organization_id: string
          rating?: number | null
          recommendation?: string | null
          scheduled_at: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          duration_minutes?: number | null
          feedback?: string | null
          id?: string
          interview_type?: string | null
          interviewer_id?: string
          job_posting_id?: string | null
          location?: string | null
          meeting_link?: string | null
          notes?: string | null
          organization_id?: string
          rating?: number | null
          recommendation?: string | null
          scheduled_at?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interviews_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_interviewer_id_fkey"
            columns: ["interviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "interviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "interviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          benefits: string[] | null
          closes_at: string | null
          created_at: string
          created_by: string | null
          department: string | null
          description: string
          employment_type: string | null
          experience_level: string | null
          hiring_manager_id: string | null
          id: string
          location: string | null
          organization_id: string
          published_at: string | null
          remote_allowed: boolean | null
          requirements: string[] | null
          responsibilities: string[] | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          search_vector: unknown
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          benefits?: string[] | null
          closes_at?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description: string
          employment_type?: string | null
          experience_level?: string | null
          hiring_manager_id?: string | null
          id?: string
          location?: string | null
          organization_id: string
          published_at?: string | null
          remote_allowed?: boolean | null
          requirements?: string[] | null
          responsibilities?: string[] | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          search_vector?: unknown
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          benefits?: string[] | null
          closes_at?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string
          employment_type?: string | null
          experience_level?: string | null
          hiring_manager_id?: string | null
          id?: string
          location?: string | null
          organization_id?: string
          published_at?: string | null
          remote_allowed?: boolean | null
          requirements?: string[] | null
          responsibilities?: string[] | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          search_vector?: unknown
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_postings_hiring_manager_id_fkey"
            columns: ["hiring_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_postings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "job_postings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "job_postings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      key_results: {
        Row: {
          created_at: string
          current_value: number | null
          description: string | null
          due_date: string | null
          goal_id: string
          id: string
          metric_type: string | null
          organization_id: string
          progress_percentage: number | null
          start_value: number | null
          status: string | null
          target_value: number
          title: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          description?: string | null
          due_date?: string | null
          goal_id: string
          id?: string
          metric_type?: string | null
          organization_id: string
          progress_percentage?: number | null
          start_value?: number | null
          status?: string | null
          target_value: number
          title: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_value?: number | null
          description?: string | null
          due_date?: string | null
          goal_id?: string
          id?: string
          metric_type?: string | null
          organization_id?: string
          progress_percentage?: number | null
          start_value?: number | null
          status?: string | null
          target_value?: number
          title?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "key_results_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "key_results_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "mv_goals_with_progress"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "key_results_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "key_results_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "key_results_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_alerts: {
        Row: {
          alert_type: string
          condition: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          kpi_id: string
          last_triggered_at: string | null
          notification_channels: string[] | null
          notify_users: string[] | null
          organization_id: string
          threshold_value: number | null
          trigger_count: number | null
          updated_at: string
        }
        Insert: {
          alert_type: string
          condition: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          kpi_id: string
          last_triggered_at?: string | null
          notification_channels?: string[] | null
          notify_users?: string[] | null
          organization_id: string
          threshold_value?: number | null
          trigger_count?: number | null
          updated_at?: string
        }
        Update: {
          alert_type?: string
          condition?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          kpi_id?: string
          last_triggered_at?: string | null
          notification_channels?: string[] | null
          notify_users?: string[] | null
          organization_id?: string
          threshold_value?: number | null
          trigger_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kpi_alerts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_alerts_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "kpi_performance_trends"
            referencedColumns: ["kpi_id"]
          },
          {
            foreignKeyName: "kpi_alerts_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "kpis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_alerts_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "kpis_with_latest_measurement"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "kpi_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "kpi_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_measurements: {
        Row: {
          created_at: string
          id: string
          kpi_id: string
          measured_at: string
          measured_by: string | null
          measured_value: number
          measurement_period_end: string | null
          measurement_period_start: string | null
          measurement_source: string | null
          metadata: Json | null
          notes: string | null
          organization_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kpi_id: string
          measured_at?: string
          measured_by?: string | null
          measured_value: number
          measurement_period_end?: string | null
          measurement_period_start?: string | null
          measurement_source?: string | null
          metadata?: Json | null
          notes?: string | null
          organization_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kpi_id?: string
          measured_at?: string
          measured_by?: string | null
          measured_value?: number
          measurement_period_end?: string | null
          measurement_period_start?: string | null
          measurement_source?: string | null
          metadata?: Json | null
          notes?: string | null
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kpi_measurements_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "kpi_performance_trends"
            referencedColumns: ["kpi_id"]
          },
          {
            foreignKeyName: "kpi_measurements_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "kpis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_measurements_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "kpis_with_latest_measurement"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_measurements_measured_by_fkey"
            columns: ["measured_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_measurements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "kpi_measurements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "kpi_measurements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      kpis: {
        Row: {
          aligned_goal_id: string | null
          auto_update_enabled: boolean | null
          baseline_value: number | null
          category: string | null
          created_at: string
          current_value: number | null
          data_source: string | null
          deleted_at: string | null
          department: string | null
          description: string | null
          id: string
          is_active: boolean | null
          last_measured_at: string | null
          measurement_frequency: string | null
          metadata: Json | null
          metric_type: string | null
          name: string
          organization_id: string
          owner_id: string
          priority: string | null
          status: string | null
          tags: string[] | null
          target_max: number | null
          target_min: number | null
          target_value: number | null
          unit: string | null
          updated_at: string
          visibility: string | null
        }
        Insert: {
          aligned_goal_id?: string | null
          auto_update_enabled?: boolean | null
          baseline_value?: number | null
          category?: string | null
          created_at?: string
          current_value?: number | null
          data_source?: string | null
          deleted_at?: string | null
          department?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_measured_at?: string | null
          measurement_frequency?: string | null
          metadata?: Json | null
          metric_type?: string | null
          name: string
          organization_id: string
          owner_id: string
          priority?: string | null
          status?: string | null
          tags?: string[] | null
          target_max?: number | null
          target_min?: number | null
          target_value?: number | null
          unit?: string | null
          updated_at?: string
          visibility?: string | null
        }
        Update: {
          aligned_goal_id?: string | null
          auto_update_enabled?: boolean | null
          baseline_value?: number | null
          category?: string | null
          created_at?: string
          current_value?: number | null
          data_source?: string | null
          deleted_at?: string | null
          department?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_measured_at?: string | null
          measurement_frequency?: string | null
          metadata?: Json | null
          metric_type?: string | null
          name?: string
          organization_id?: string
          owner_id?: string
          priority?: string | null
          status?: string | null
          tags?: string[] | null
          target_max?: number | null
          target_min?: number | null
          target_value?: number | null
          unit?: string | null
          updated_at?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kpis_aligned_goal_id_fkey"
            columns: ["aligned_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpis_aligned_goal_id_fkey"
            columns: ["aligned_goal_id"]
            isOneToOne: false
            referencedRelation: "mv_goals_with_progress"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpis_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "kpis_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "kpis_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpis_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notices: {
        Row: {
          author_id: string
          content: string
          created_at: string
          department: string | null
          expires_at: string | null
          id: string
          organization_id: string
          priority: string
          search_vector: unknown
          title: string
          type: string
          updated_at: string
          views: number
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          department?: string | null
          expires_at?: string | null
          id?: string
          organization_id: string
          priority?: string
          search_vector?: unknown
          title: string
          type: string
          updated_at?: string
          views?: number
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          department?: string | null
          expires_at?: string | null
          id?: string
          organization_id?: string
          priority?: string
          search_vector?: unknown
          title?: string
          type?: string
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "notices_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "notices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "notices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_digests: {
        Row: {
          created_at: string
          digest_type: string
          error_message: string | null
          id: string
          notification_ids: string[]
          organization_id: string
          scheduled_for: string
          sent_at: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          digest_type: string
          error_message?: string | null
          id?: string
          notification_ids?: string[]
          organization_id: string
          scheduled_for: string
          sent_at?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          digest_type?: string
          error_message?: string | null
          id?: string
          notification_ids?: string[]
          organization_id?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_digests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "notification_digests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "notification_digests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_digests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          created_at: string
          default_priority: string | null
          email_body_template: string | null
          email_subject_template: string | null
          enable_email: boolean | null
          enable_in_app: boolean | null
          enable_slack: boolean | null
          enable_teams: boolean | null
          id: string
          is_active: boolean | null
          message_template: string
          notification_type: string
          organization_id: string | null
          template_key: string
          title_template: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_priority?: string | null
          email_body_template?: string | null
          email_subject_template?: string | null
          enable_email?: boolean | null
          enable_in_app?: boolean | null
          enable_slack?: boolean | null
          enable_teams?: boolean | null
          id?: string
          is_active?: boolean | null
          message_template: string
          notification_type: string
          organization_id?: string | null
          template_key: string
          title_template: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_priority?: string | null
          email_body_template?: string | null
          email_subject_template?: string | null
          enable_email?: boolean | null
          enable_in_app?: boolean | null
          enable_slack?: boolean | null
          enable_teams?: boolean | null
          id?: string
          is_active?: boolean | null
          message_template?: string
          notification_type?: string
          organization_id?: string | null
          template_key?: string
          title_template?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "notification_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "notification_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          actor_id: string | null
          archived_at: string | null
          created_at: string
          email_error: string | null
          email_sent: boolean | null
          email_sent_at: string | null
          expires_at: string | null
          id: string
          is_archived: boolean | null
          is_read: boolean | null
          message: string
          metadata: Json | null
          organization_id: string
          priority: string | null
          read_at: string | null
          recipient_id: string
          resource_id: string | null
          resource_type: string | null
          slack_sent: boolean | null
          slack_sent_at: string | null
          teams_sent: boolean | null
          teams_sent_at: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          action_url?: string | null
          actor_id?: string | null
          archived_at?: string | null
          created_at?: string
          email_error?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          expires_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          organization_id: string
          priority?: string | null
          read_at?: string | null
          recipient_id: string
          resource_id?: string | null
          resource_type?: string | null
          slack_sent?: boolean | null
          slack_sent_at?: string | null
          teams_sent?: boolean | null
          teams_sent_at?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          action_url?: string | null
          actor_id?: string | null
          archived_at?: string | null
          created_at?: string
          email_error?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          expires_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          organization_id?: string
          priority?: string | null
          read_at?: string | null
          recipient_id?: string
          resource_id?: string | null
          resource_type?: string | null
          slack_sent?: boolean | null
          slack_sent_at?: string | null
          teams_sent?: boolean | null
          teams_sent_at?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_settings: {
        Row: {
          advanced_settings: Json | null
          ai_api_key_encrypted: string | null
          ai_career_recommendations_enabled: boolean | null
          ai_cv_scoring_enabled: boolean | null
          ai_enabled: boolean | null
          ai_max_tokens: number | null
          ai_model: string | null
          ai_performance_synthesis_enabled: boolean | null
          ai_provider: string | null
          ai_temperature: number | null
          allowed_email_domains: string[] | null
          anonymize_candidate_data: boolean | null
          asana_enabled: boolean | null
          auto_archive_completed_goals_days: number | null
          brand_accent_color: string | null
          brand_logo_url: string | null
          brand_primary_color: string | null
          brand_secondary_color: string | null
          company_tagline: string | null
          created_at: string
          custom_domain: string | null
          data_processing_region: string | null
          default_currency: string | null
          default_date_format: string | null
          default_language: string | null
          default_timezone: string | null
          email_notifications_enabled: boolean | null
          enforce_2fa: boolean | null
          features_analytics_enabled: boolean | null
          features_career_dev_enabled: boolean | null
          features_goals_enabled: boolean | null
          features_performance_enabled: boolean | null
          features_recruitment_enabled: boolean | null
          gdpr_enabled: boolean | null
          github_enabled: boolean | null
          gitlab_enabled: boolean | null
          id: string
          integrations_enabled: boolean | null
          ip_whitelist: string[] | null
          jira_enabled: boolean | null
          microsoft365_enabled: boolean | null
          notification_channels: Json | null
          notify_goal_completion: boolean | null
          notify_goal_update: boolean | null
          notify_interview_scheduled: boolean | null
          notify_new_candidate: boolean | null
          notify_new_goal: boolean | null
          notify_performance_review_due: boolean | null
          notify_performance_review_submitted: boolean | null
          notify_team_member_joined: boolean | null
          notion_enabled: boolean | null
          organization_id: string
          password_expiry_days: number | null
          password_min_length: number | null
          password_require_lowercase: boolean | null
          password_require_numbers: boolean | null
          password_require_special_chars: boolean | null
          password_require_uppercase: boolean | null
          retention_audit_logs_days: number | null
          retention_candidate_data_days: number | null
          retention_deleted_records_days: number | null
          session_timeout_minutes: number | null
          slack_enabled: boolean | null
          slack_notifications_enabled: boolean | null
          teams_enabled: boolean | null
          teams_notifications_enabled: boolean | null
          updated_at: string
        }
        Insert: {
          advanced_settings?: Json | null
          ai_api_key_encrypted?: string | null
          ai_career_recommendations_enabled?: boolean | null
          ai_cv_scoring_enabled?: boolean | null
          ai_enabled?: boolean | null
          ai_max_tokens?: number | null
          ai_model?: string | null
          ai_performance_synthesis_enabled?: boolean | null
          ai_provider?: string | null
          ai_temperature?: number | null
          allowed_email_domains?: string[] | null
          anonymize_candidate_data?: boolean | null
          asana_enabled?: boolean | null
          auto_archive_completed_goals_days?: number | null
          brand_accent_color?: string | null
          brand_logo_url?: string | null
          brand_primary_color?: string | null
          brand_secondary_color?: string | null
          company_tagline?: string | null
          created_at?: string
          custom_domain?: string | null
          data_processing_region?: string | null
          default_currency?: string | null
          default_date_format?: string | null
          default_language?: string | null
          default_timezone?: string | null
          email_notifications_enabled?: boolean | null
          enforce_2fa?: boolean | null
          features_analytics_enabled?: boolean | null
          features_career_dev_enabled?: boolean | null
          features_goals_enabled?: boolean | null
          features_performance_enabled?: boolean | null
          features_recruitment_enabled?: boolean | null
          gdpr_enabled?: boolean | null
          github_enabled?: boolean | null
          gitlab_enabled?: boolean | null
          id?: string
          integrations_enabled?: boolean | null
          ip_whitelist?: string[] | null
          jira_enabled?: boolean | null
          microsoft365_enabled?: boolean | null
          notification_channels?: Json | null
          notify_goal_completion?: boolean | null
          notify_goal_update?: boolean | null
          notify_interview_scheduled?: boolean | null
          notify_new_candidate?: boolean | null
          notify_new_goal?: boolean | null
          notify_performance_review_due?: boolean | null
          notify_performance_review_submitted?: boolean | null
          notify_team_member_joined?: boolean | null
          notion_enabled?: boolean | null
          organization_id: string
          password_expiry_days?: number | null
          password_min_length?: number | null
          password_require_lowercase?: boolean | null
          password_require_numbers?: boolean | null
          password_require_special_chars?: boolean | null
          password_require_uppercase?: boolean | null
          retention_audit_logs_days?: number | null
          retention_candidate_data_days?: number | null
          retention_deleted_records_days?: number | null
          session_timeout_minutes?: number | null
          slack_enabled?: boolean | null
          slack_notifications_enabled?: boolean | null
          teams_enabled?: boolean | null
          teams_notifications_enabled?: boolean | null
          updated_at?: string
        }
        Update: {
          advanced_settings?: Json | null
          ai_api_key_encrypted?: string | null
          ai_career_recommendations_enabled?: boolean | null
          ai_cv_scoring_enabled?: boolean | null
          ai_enabled?: boolean | null
          ai_max_tokens?: number | null
          ai_model?: string | null
          ai_performance_synthesis_enabled?: boolean | null
          ai_provider?: string | null
          ai_temperature?: number | null
          allowed_email_domains?: string[] | null
          anonymize_candidate_data?: boolean | null
          asana_enabled?: boolean | null
          auto_archive_completed_goals_days?: number | null
          brand_accent_color?: string | null
          brand_logo_url?: string | null
          brand_primary_color?: string | null
          brand_secondary_color?: string | null
          company_tagline?: string | null
          created_at?: string
          custom_domain?: string | null
          data_processing_region?: string | null
          default_currency?: string | null
          default_date_format?: string | null
          default_language?: string | null
          default_timezone?: string | null
          email_notifications_enabled?: boolean | null
          enforce_2fa?: boolean | null
          features_analytics_enabled?: boolean | null
          features_career_dev_enabled?: boolean | null
          features_goals_enabled?: boolean | null
          features_performance_enabled?: boolean | null
          features_recruitment_enabled?: boolean | null
          gdpr_enabled?: boolean | null
          github_enabled?: boolean | null
          gitlab_enabled?: boolean | null
          id?: string
          integrations_enabled?: boolean | null
          ip_whitelist?: string[] | null
          jira_enabled?: boolean | null
          microsoft365_enabled?: boolean | null
          notification_channels?: Json | null
          notify_goal_completion?: boolean | null
          notify_goal_update?: boolean | null
          notify_interview_scheduled?: boolean | null
          notify_new_candidate?: boolean | null
          notify_new_goal?: boolean | null
          notify_performance_review_due?: boolean | null
          notify_performance_review_submitted?: boolean | null
          notify_team_member_joined?: boolean | null
          notion_enabled?: boolean | null
          organization_id?: string
          password_expiry_days?: number | null
          password_min_length?: number | null
          password_require_lowercase?: boolean | null
          password_require_numbers?: boolean | null
          password_require_special_chars?: boolean | null
          password_require_uppercase?: boolean | null
          retention_audit_logs_days?: number | null
          retention_candidate_data_days?: number | null
          retention_deleted_records_days?: number | null
          session_timeout_minutes?: number | null
          slack_enabled?: boolean | null
          slack_notifications_enabled?: boolean | null
          teams_enabled?: boolean | null
          teams_notifications_enabled?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          domain: string | null
          id: string
          logo_url: string | null
          name: string
          settings: Json | null
          slug: string
          subscription_status: string | null
          subscription_tier: string | null
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: string
          logo_url?: string | null
          name: string
          settings?: Json | null
          slug: string
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          settings?: Json | null
          slug?: string
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      peer_feedback: {
        Row: {
          created_at: string
          feedback_text: string
          id: string
          is_anonymous: boolean | null
          organization_id: string
          review_id: string
          reviewer_id: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          feedback_text: string
          id?: string
          is_anonymous?: boolean | null
          organization_id: string
          review_id: string
          reviewer_id: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          feedback_text?: string
          id?: string
          is_anonymous?: boolean | null
          organization_id?: string
          review_id?: string
          reviewer_id?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "peer_feedback_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "peer_feedback_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "peer_feedback_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_feedback_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "performance_review_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_feedback_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "performance_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_feedback_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_criteria: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          updated_at: string
          weight: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          updated_at?: string
          weight?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_criteria_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "performance_criteria_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "performance_criteria_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_goals: {
        Row: {
          achievement_percentage: number | null
          created_at: string
          goal_description: string
          id: string
          notes: string | null
          organization_id: string
          review_id: string
          status: string | null
          target_completion_date: string | null
          updated_at: string
        }
        Insert: {
          achievement_percentage?: number | null
          created_at?: string
          goal_description: string
          id?: string
          notes?: string | null
          organization_id: string
          review_id: string
          status?: string | null
          target_completion_date?: string | null
          updated_at?: string
        }
        Update: {
          achievement_percentage?: number | null
          created_at?: string
          goal_description?: string
          id?: string
          notes?: string | null
          organization_id?: string
          review_id?: string
          status?: string | null
          target_completion_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_goals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "performance_goals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "performance_goals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_goals_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "performance_review_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_goals_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "performance_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_ratings: {
        Row: {
          comments: string | null
          created_at: string
          criteria_id: string
          id: string
          organization_id: string
          rating: number
          review_id: string
          updated_at: string
        }
        Insert: {
          comments?: string | null
          created_at?: string
          criteria_id: string
          id?: string
          organization_id: string
          rating: number
          review_id: string
          updated_at?: string
        }
        Update: {
          comments?: string | null
          created_at?: string
          criteria_id?: string
          id?: string
          organization_id?: string
          rating?: number
          review_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_ratings_criteria_id_fkey"
            columns: ["criteria_id"]
            isOneToOne: false
            referencedRelation: "performance_criteria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_ratings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "performance_ratings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "performance_ratings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_ratings_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "performance_review_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_ratings_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "performance_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_reviews: {
        Row: {
          areas_for_improvement: string | null
          completed_at: string | null
          created_at: string
          goals_for_next_period: string | null
          id: string
          manager_comments: string | null
          organization_id: string
          overall_rating: number | null
          review_period_end: string
          review_period_start: string
          review_type: string | null
          reviewee_comments: string | null
          reviewee_id: string
          reviewer_comments: string | null
          reviewer_id: string
          status: string | null
          strengths: string | null
          submitted_at: string | null
          summary: string | null
          updated_at: string
        }
        Insert: {
          areas_for_improvement?: string | null
          completed_at?: string | null
          created_at?: string
          goals_for_next_period?: string | null
          id?: string
          manager_comments?: string | null
          organization_id: string
          overall_rating?: number | null
          review_period_end: string
          review_period_start: string
          review_type?: string | null
          reviewee_comments?: string | null
          reviewee_id: string
          reviewer_comments?: string | null
          reviewer_id: string
          status?: string | null
          strengths?: string | null
          submitted_at?: string | null
          summary?: string | null
          updated_at?: string
        }
        Update: {
          areas_for_improvement?: string | null
          completed_at?: string | null
          created_at?: string
          goals_for_next_period?: string | null
          id?: string
          manager_comments?: string | null
          organization_id?: string
          overall_rating?: number | null
          review_period_end?: string
          review_period_start?: string
          review_type?: string | null
          reviewee_comments?: string | null
          reviewee_id?: string
          reviewer_comments?: string | null
          reviewer_id?: string
          status?: string | null
          strengths?: string | null
          submitted_at?: string | null
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_reviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "performance_reviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "performance_reviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_resources: {
        Row: {
          author_id: string
          category: string
          created_at: string
          description: string
          downloads: number
          featured: boolean
          file_path: string | null
          id: string
          organization_id: string
          published_at: string
          search_vector: unknown
          title: string
          type: string
          updated_at: string
          url: string | null
          views: number
        }
        Insert: {
          author_id: string
          category: string
          created_at?: string
          description: string
          downloads?: number
          featured?: boolean
          file_path?: string | null
          id?: string
          organization_id: string
          published_at?: string
          search_vector?: unknown
          title: string
          type: string
          updated_at?: string
          url?: string | null
          views?: number
        }
        Update: {
          author_id?: string
          category?: string
          created_at?: string
          description?: string
          downloads?: number
          featured?: boolean
          file_path?: string | null
          id?: string
          organization_id?: string
          published_at?: string
          search_vector?: unknown
          title?: string
          type?: string
          updated_at?: string
          url?: string | null
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "portal_resources_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_resources_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "portal_resources_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "portal_resources_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          department: string | null
          email: string
          employment_status: string | null
          first_name: string | null
          full_name: string | null
          hire_date: string | null
          id: string
          job_title: string | null
          last_name: string | null
          location: string | null
          manager_id: string | null
          metadata: Json | null
          organization_id: string
          phone: string | null
          role: string | null
          skills: string[] | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          department?: string | null
          email: string
          employment_status?: string | null
          first_name?: string | null
          full_name?: string | null
          hire_date?: string | null
          id: string
          job_title?: string | null
          last_name?: string | null
          location?: string | null
          manager_id?: string | null
          metadata?: Json | null
          organization_id: string
          phone?: string | null
          role?: string | null
          skills?: string[] | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          department?: string | null
          email?: string
          employment_status?: string | null
          first_name?: string | null
          full_name?: string | null
          hire_date?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          location?: string | null
          manager_id?: string | null
          metadata?: Json | null
          organization_id?: string
          phone?: string | null
          role?: string | null
          skills?: string[] | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      registry_builds: {
        Row: {
          build_number: number
          build_output: Json | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          error_message: string | null
          id: string
          registry_version: string
          started_at: string
          status: string | null
          total_components: number
        }
        Insert: {
          build_number: number
          build_output?: Json | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          registry_version: string
          started_at?: string
          status?: string | null
          total_components?: number
        }
        Update: {
          build_number?: number
          build_output?: Json | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          registry_version?: string
          started_at?: string
          status?: string | null
          total_components?: number
        }
        Relationships: [
          {
            foreignKeyName: "registry_builds_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      registry_components: {
        Row: {
          accessibility_level: string | null
          bundle_size_kb: number | null
          category: string
          component_id: string
          created_at: string
          dependencies: Json | null
          deprecated_at: string | null
          description: string | null
          documentation_path: string | null
          file_path: string
          has_aria_support: boolean | null
          has_focus_trap: boolean | null
          has_keyboard_nav: boolean | null
          id: string
          is_published: boolean | null
          metadata: Json | null
          name: string
          organization_id: string | null
          published_at: string | null
          tags: string[] | null
          test_coverage_percentage: number | null
          updated_at: string
          version: string
        }
        Insert: {
          accessibility_level?: string | null
          bundle_size_kb?: number | null
          category: string
          component_id: string
          created_at?: string
          dependencies?: Json | null
          deprecated_at?: string | null
          description?: string | null
          documentation_path?: string | null
          file_path: string
          has_aria_support?: boolean | null
          has_focus_trap?: boolean | null
          has_keyboard_nav?: boolean | null
          id?: string
          is_published?: boolean | null
          metadata?: Json | null
          name: string
          organization_id?: string | null
          published_at?: string | null
          tags?: string[] | null
          test_coverage_percentage?: number | null
          updated_at?: string
          version?: string
        }
        Update: {
          accessibility_level?: string | null
          bundle_size_kb?: number | null
          category?: string
          component_id?: string
          created_at?: string
          dependencies?: Json | null
          deprecated_at?: string | null
          description?: string | null
          documentation_path?: string | null
          file_path?: string
          has_aria_support?: boolean | null
          has_focus_trap?: boolean | null
          has_keyboard_nav?: boolean | null
          id?: string
          is_published?: boolean | null
          metadata?: Json | null
          name?: string
          organization_id?: string | null
          published_at?: string | null
          tags?: string[] | null
          test_coverage_percentage?: number | null
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "registry_components_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "registry_components_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "registry_components_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      registry_examples: {
        Row: {
          code_snippet: string | null
          component_id: string
          created_at: string
          description: string | null
          file_path: string
          id: string
          is_interactive: boolean | null
          name: string
          order_index: number | null
          updated_at: string
        }
        Insert: {
          code_snippet?: string | null
          component_id: string
          created_at?: string
          description?: string | null
          file_path: string
          id?: string
          is_interactive?: boolean | null
          name: string
          order_index?: number | null
          updated_at?: string
        }
        Update: {
          code_snippet?: string | null
          component_id?: string
          created_at?: string
          description?: string | null
          file_path?: string
          id?: string
          is_interactive?: boolean | null
          name?: string
          order_index?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "registry_examples_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "registry_components"
            referencedColumns: ["id"]
          },
        ]
      }
      registry_publications: {
        Row: {
          build_id: string | null
          changelog: string | null
          created_at: string
          created_by: string | null
          github_published: boolean | null
          github_release_url: string | null
          id: string
          npm_published: boolean | null
          npm_url: string | null
          published_at: string
          vercel_deployed: boolean | null
          vercel_url: string | null
          version: string
        }
        Insert: {
          build_id?: string | null
          changelog?: string | null
          created_at?: string
          created_by?: string | null
          github_published?: boolean | null
          github_release_url?: string | null
          id?: string
          npm_published?: boolean | null
          npm_url?: string | null
          published_at?: string
          vercel_deployed?: boolean | null
          vercel_url?: string | null
          version: string
        }
        Update: {
          build_id?: string | null
          changelog?: string | null
          created_at?: string
          created_by?: string | null
          github_published?: boolean | null
          github_release_url?: string | null
          id?: string
          npm_published?: boolean | null
          npm_url?: string | null
          published_at?: string
          vercel_deployed?: boolean | null
          vercel_url?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "registry_publications_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "registry_builds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registry_publications_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "registry_latest_build"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registry_publications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      search_analytics: {
        Row: {
          created_at: string
          id: string
          module: string | null
          organization_id: string
          results_count: number | null
          search_term: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          module?: string | null
          organization_id: string
          results_count?: number | null
          search_term: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          module?: string | null
          organization_id?: string
          results_count?: number | null
          search_term?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_analytics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "search_analytics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "search_analytics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      security_events: {
        Row: {
          created_at: string
          description: string
          id: string
          ip_address: string | null
          location: string | null
          metadata: Json | null
          organization_id: string
          status: string
          timestamp: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          ip_address?: string | null
          location?: string | null
          metadata?: Json | null
          organization_id: string
          status: string
          timestamp?: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          ip_address?: string | null
          location?: string | null
          metadata?: Json | null
          organization_id?: string
          status?: string
          timestamp?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "security_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "security_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to_id: string | null
          category: string
          created_at: string
          description: string
          id: string
          organization_id: string
          priority: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to_id?: string | null
          category: string
          created_at?: string
          description: string
          id?: string
          organization_id: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to_id?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          organization_id?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_id_fkey"
            columns: ["assigned_to_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "support_tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "support_tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          accessibility_font_size: string | null
          accessibility_high_contrast: boolean | null
          accessibility_keyboard_shortcuts: boolean | null
          accessibility_reduce_motion: boolean | null
          accessibility_screen_reader_mode: boolean | null
          advanced_preferences: Json | null
          allow_analytics_tracking: boolean | null
          created_at: string
          dashboard_layout: string | null
          dashboard_widgets: Json | null
          date_format: string | null
          email_digest_frequency: string | null
          email_notifications_enabled: boolean | null
          id: string
          language: string | null
          notify_assigned_as_collaborator: boolean | null
          notify_direct_report_update: boolean | null
          notify_feedback_received: boolean | null
          notify_goal_comment: boolean | null
          notify_goal_completion: boolean | null
          notify_goal_update: boolean | null
          notify_interview_reminder: boolean | null
          notify_interview_scheduled: boolean | null
          notify_mentioned_in_comment: boolean | null
          notify_new_candidate: boolean | null
          notify_new_goal: boolean | null
          notify_performance_review_due: boolean | null
          notify_performance_review_submitted: boolean | null
          notify_team_member_joined: boolean | null
          organization_id: string
          out_of_office_enabled: boolean | null
          out_of_office_end_date: string | null
          out_of_office_message: string | null
          out_of_office_start_date: string | null
          profile_visibility: string | null
          show_email: boolean | null
          show_location: boolean | null
          show_onboarding_hints: boolean | null
          show_phone: boolean | null
          sidebar_collapsed: boolean | null
          slack_notifications_enabled: boolean | null
          slack_user_id: string | null
          teams_notifications_enabled: boolean | null
          teams_user_id: string | null
          theme: string | null
          theme_custom_colors: Json | null
          time_format: string | null
          timezone: string | null
          updated_at: string
          user_id: string
          working_days: number[] | null
          working_hours_end: string | null
          working_hours_start: string | null
        }
        Insert: {
          accessibility_font_size?: string | null
          accessibility_high_contrast?: boolean | null
          accessibility_keyboard_shortcuts?: boolean | null
          accessibility_reduce_motion?: boolean | null
          accessibility_screen_reader_mode?: boolean | null
          advanced_preferences?: Json | null
          allow_analytics_tracking?: boolean | null
          created_at?: string
          dashboard_layout?: string | null
          dashboard_widgets?: Json | null
          date_format?: string | null
          email_digest_frequency?: string | null
          email_notifications_enabled?: boolean | null
          id?: string
          language?: string | null
          notify_assigned_as_collaborator?: boolean | null
          notify_direct_report_update?: boolean | null
          notify_feedback_received?: boolean | null
          notify_goal_comment?: boolean | null
          notify_goal_completion?: boolean | null
          notify_goal_update?: boolean | null
          notify_interview_reminder?: boolean | null
          notify_interview_scheduled?: boolean | null
          notify_mentioned_in_comment?: boolean | null
          notify_new_candidate?: boolean | null
          notify_new_goal?: boolean | null
          notify_performance_review_due?: boolean | null
          notify_performance_review_submitted?: boolean | null
          notify_team_member_joined?: boolean | null
          organization_id: string
          out_of_office_enabled?: boolean | null
          out_of_office_end_date?: string | null
          out_of_office_message?: string | null
          out_of_office_start_date?: string | null
          profile_visibility?: string | null
          show_email?: boolean | null
          show_location?: boolean | null
          show_onboarding_hints?: boolean | null
          show_phone?: boolean | null
          sidebar_collapsed?: boolean | null
          slack_notifications_enabled?: boolean | null
          slack_user_id?: string | null
          teams_notifications_enabled?: boolean | null
          teams_user_id?: string | null
          theme?: string | null
          theme_custom_colors?: Json | null
          time_format?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
          working_days?: number[] | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Update: {
          accessibility_font_size?: string | null
          accessibility_high_contrast?: boolean | null
          accessibility_keyboard_shortcuts?: boolean | null
          accessibility_reduce_motion?: boolean | null
          accessibility_screen_reader_mode?: boolean | null
          advanced_preferences?: Json | null
          allow_analytics_tracking?: boolean | null
          created_at?: string
          dashboard_layout?: string | null
          dashboard_widgets?: Json | null
          date_format?: string | null
          email_digest_frequency?: string | null
          email_notifications_enabled?: boolean | null
          id?: string
          language?: string | null
          notify_assigned_as_collaborator?: boolean | null
          notify_direct_report_update?: boolean | null
          notify_feedback_received?: boolean | null
          notify_goal_comment?: boolean | null
          notify_goal_completion?: boolean | null
          notify_goal_update?: boolean | null
          notify_interview_reminder?: boolean | null
          notify_interview_scheduled?: boolean | null
          notify_mentioned_in_comment?: boolean | null
          notify_new_candidate?: boolean | null
          notify_new_goal?: boolean | null
          notify_performance_review_due?: boolean | null
          notify_performance_review_submitted?: boolean | null
          notify_team_member_joined?: boolean | null
          organization_id?: string
          out_of_office_enabled?: boolean | null
          out_of_office_end_date?: string | null
          out_of_office_message?: string | null
          out_of_office_start_date?: string | null
          profile_visibility?: string | null
          show_email?: boolean | null
          show_location?: boolean | null
          show_onboarding_hints?: boolean | null
          show_phone?: boolean | null
          sidebar_collapsed?: boolean | null
          slack_notifications_enabled?: boolean | null
          slack_user_id?: string | null
          teams_notifications_enabled?: boolean | null
          teams_user_id?: string | null
          theme?: string | null
          theme_custom_colors?: Json | null
          time_format?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
          working_days?: number[] | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "user_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "user_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      agent_activity_summary: {
        Row: {
          agent_type: string | null
          avg_duration_seconds: number | null
          blocked_tasks: number | null
          completed_tasks: number | null
          failed_tasks: number | null
          in_progress_tasks: number | null
          last_activity_at: string | null
          total_tasks: number | null
        }
        Relationships: []
      }
      candidates_with_details: {
        Row: {
          ai_cv_recommendation: string | null
          ai_cv_score: number | null
          ai_cv_summary: string | null
          ai_scored_at: string | null
          applied_at: string | null
          avg_interview_rating: number | null
          completed_interviews: number | null
          cover_letter: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          github_url: string | null
          id: string | null
          job_department: string | null
          job_posting_id: string | null
          job_title: string | null
          last_interview_date: string | null
          last_name: string | null
          linkedin_url: string | null
          organization_id: string | null
          phone: string | null
          portfolio_url: string | null
          rating: number | null
          resume_url: string | null
          source: string | null
          status: string | null
          tags: string[] | null
          total_interviews: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "candidates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "candidates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings_with_stats: {
        Row: {
          applied_count: number | null
          avg_candidate_score: number | null
          benefits: string[] | null
          closes_at: string | null
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          department: string | null
          description: string | null
          employment_type: string | null
          experience_level: string | null
          hired_count: number | null
          hiring_manager_id: string | null
          hiring_manager_name: string | null
          id: string | null
          interview_count: number | null
          location: string | null
          offer_count: number | null
          organization_id: string | null
          published_at: string | null
          rejected_count: number | null
          remote_allowed: boolean | null
          requirements: string[] | null
          responsibilities: string[] | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          screening_count: number | null
          status: string | null
          title: string | null
          total_candidates: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_postings_hiring_manager_id_fkey"
            columns: ["hiring_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_postings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "job_postings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "job_postings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_performance_trends: {
        Row: {
          avg_value: number | null
          category: string | null
          first_measurement_date: string | null
          kpi_id: string | null
          last_measurement_date: string | null
          max_value: number | null
          min_value: number | null
          name: string | null
          organization_id: string | null
          owner_id: string | null
          stddev_value: number | null
          total_measurements: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kpis_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "kpis_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "kpis_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpis_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kpis_with_latest_measurement: {
        Row: {
          aligned_goal_id: string | null
          auto_update_enabled: boolean | null
          baseline_value: number | null
          calculated_status: string | null
          category: string | null
          created_at: string | null
          current_value: number | null
          data_source: string | null
          deleted_at: string | null
          department: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          last_measured_at: string | null
          latest_measured_at: string | null
          latest_measured_by: string | null
          latest_measured_value: number | null
          measurement_frequency: string | null
          metadata: Json | null
          metric_type: string | null
          name: string | null
          organization_id: string | null
          owner_id: string | null
          priority: string | null
          progress_percentage: number | null
          status: string | null
          tags: string[] | null
          target_max: number | null
          target_min: number | null
          target_value: number | null
          unit: string | null
          updated_at: string | null
          visibility: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kpi_measurements_measured_by_fkey"
            columns: ["latest_measured_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpis_aligned_goal_id_fkey"
            columns: ["aligned_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpis_aligned_goal_id_fkey"
            columns: ["aligned_goal_id"]
            isOneToOne: false
            referencedRelation: "mv_goals_with_progress"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpis_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "kpis_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "kpis_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpis_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mv_goals_with_progress: {
        Row: {
          alignment_level: string | null
          calculated_progress: number | null
          completed_key_results: number | null
          created_at: string | null
          days_remaining: number | null
          description: string | null
          end_date: string | null
          health_status: string | null
          id: string | null
          organization_id: string | null
          owner_avatar: string | null
          owner_email: string | null
          owner_id: string | null
          owner_name: string | null
          parent_goal_id: string | null
          period: string | null
          priority: string | null
          progress_percentage: number | null
          start_date: string | null
          status: string | null
          tags: string[] | null
          title: string | null
          total_key_results: number | null
          updated_at: string | null
          visibility: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "goals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "goals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_parent_goal_id_fkey"
            columns: ["parent_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_parent_goal_id_fkey"
            columns: ["parent_goal_id"]
            isOneToOne: false
            referencedRelation: "mv_goals_with_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      mv_organization_metrics: {
        Row: {
          active_employees: number | null
          active_goals: number | null
          avg_goal_progress: number | null
          avg_performance_rating: number | null
          completed_reviews: number | null
          last_refreshed: string | null
          open_positions: number | null
          organization_id: string | null
          organization_name: string | null
          total_candidates: number | null
          total_employees: number | null
          total_goals: number | null
          total_job_postings: number | null
          total_reviews: number | null
        }
        Relationships: []
      }
      organization_dashboard: {
        Row: {
          active_employees: number | null
          active_goals: number | null
          avg_goal_progress: number | null
          avg_performance_rating: number | null
          completed_reviews: number | null
          open_positions: number | null
          organization_id: string | null
          organization_name: string | null
          published_components: number | null
          subscription_tier: string | null
          total_candidates: number | null
          total_components: number | null
          total_employees: number | null
          total_goals: number | null
          total_job_postings: number | null
          total_managers: number | null
          total_reviews: number | null
        }
        Relationships: []
      }
      performance_review_summary: {
        Row: {
          areas_for_improvement: string | null
          avg_criteria_rating: number | null
          completed_at: string | null
          created_at: string | null
          goals_for_next_period: string | null
          id: string | null
          manager_comments: string | null
          organization_id: string | null
          overall_rating: number | null
          peer_feedback_count: number | null
          performance_goals_count: number | null
          review_period_end: string | null
          review_period_start: string | null
          review_type: string | null
          reviewee_avatar: string | null
          reviewee_comments: string | null
          reviewee_department: string | null
          reviewee_id: string | null
          reviewee_name: string | null
          reviewee_title: string | null
          reviewer_comments: string | null
          reviewer_id: string | null
          reviewer_name: string | null
          status: string | null
          strengths: string | null
          submitted_at: string | null
          summary: string | null
          total_criteria_rated: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_reviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "mv_organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "performance_reviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "performance_reviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      realtime_configuration: {
        Row: {
          enabled_operations: string[] | null
          estimated_row_count: number | null
          realtime_priority: string | null
          schemaname: unknown
          table_size: string | null
          tablename: unknown
        }
        Relationships: []
      }
      registry_component_stats: {
        Row: {
          aa_components: number | null
          aaa_components: number | null
          aria_supported: number | null
          avg_bundle_size: number | null
          avg_test_coverage: number | null
          category: string | null
          deprecated_components: number | null
          keyboard_nav_supported: number | null
          published_components: number | null
          total_components: number | null
        }
        Relationships: []
      }
      registry_latest_build: {
        Row: {
          build_number: number | null
          build_output: Json | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          error_message: string | null
          id: string | null
          publication_count: number | null
          registry_version: string | null
          started_at: string | null
          status: string | null
          total_components: number | null
        }
        Relationships: [
          {
            foreignKeyName: "registry_builds_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      archive_expired_notices: { Args: { org_id: string }; Returns: number }
      archive_old_notifications: {
        Args: { p_days_old?: number; p_user_id: string }
        Returns: {
          archived_count: number
        }[]
      }
      archive_old_sync_logs: {
        Args: { p_days_to_keep?: number }
        Returns: number
      }
      batch_create_sync_logs: {
        Args: {
          p_logs: Database["public"]["CompositeTypes"]["sync_log_entry"][]
        }
        Returns: number
      }
      bulk_update_employee_status: {
        Args: { employee_ids: string[]; new_status: string; org_id: string }
        Returns: number
      }
      calculate_kpi_status: {
        Args: {
          current_val: number
          target_max_val: number
          target_min_val: number
        }
        Returns: string
      }
      calculate_okr_health_score: { Args: { goal_id: string }; Returns: number }
      can_access_candidate: { Args: { cid: string }; Returns: boolean }
      can_request_ai_analysis: { Args: never; Returns: boolean }
      can_view_candidate_ai: {
        Args: { candidate_id: string }
        Returns: boolean
      }
      check_integration_system_health: {
        Args: never
        Returns: {
          metric: string
          status: string
          threshold: number
          value: number
        }[]
      }
      cleanup_expired_oauth_states: { Args: never; Returns: undefined }
      cleanup_old_notifications: {
        Args: { days_to_keep?: number }
        Returns: number
      }
      cleanup_orphaned_oauth_states: { Args: never; Returns: number }
      create_notification: {
        Args: {
          p_action_url?: string
          p_actor_id?: string
          p_message: string
          p_metadata?: Json
          p_organization_id: string
          p_priority?: string
          p_recipient_id: string
          p_resource_id?: string
          p_resource_type?: string
          p_title: string
          p_type: string
        }
        Returns: string
      }
      create_test_integrations: {
        Args: { p_count?: number; p_organization_id?: string }
        Returns: number
      }
      get_active_providers_for_cache: {
        Args: never
        Returns: {
          authorization_endpoint: string | null
          created_at: string
          default_scopes: string[] | null
          description: string | null
          display_name: string
          documentation_url: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          oauth_version: string | null
          rate_limit_per_hour: number | null
          revocation_endpoint: string | null
          scopes_available: string[] | null
          token_endpoint: string | null
          updated_at: string
          webhook_support: boolean | null
        }[]
        SetofOptions: {
          from: "*"
          to: "integration_providers"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_agent_performance: {
        Args: { agent?: string; days?: number }
        Returns: {
          agent_type: string
          avg_duration_seconds: number
          completed_tasks: number
          failed_tasks: number
          success_rate: number
          total_tasks: number
        }[]
      }
      get_candidates_cursor: {
        Args: {
          p_cursor?: string
          p_cursor_id?: string
          p_job_posting_id?: string
          p_organization_id: string
          p_page_size?: number
          p_status?: string
        }
        Returns: {
          candidates: Json
          has_more: boolean
          next_cursor: string
          next_cursor_id: string
        }[]
      }
      get_employee_stats: { Args: { org_id: string }; Returns: Json }
      get_integration_performance_summary: {
        Args: { p_hours?: number }
        Returns: {
          avg_duration_ms: number
          consecutive_failures: number
          failed_syncs: number
          health_status: string
          integration_id: string
          organization_id: string
          provider_id: string
          provider_name: string
          successful_syncs: number
          total_syncs: number
          total_webhooks: number
          webhook_failure_rate: number
        }[]
      }
      get_integration_sync_stats: {
        Args: { p_days?: number; p_integration_id: string }
        Returns: {
          avg_duration_ms: number
          failed_syncs: number
          success_rate: number
          successful_syncs: number
          total_records_processed: number
          total_syncs: number
        }[]
      }
      get_integrations_needing_refresh: {
        Args: { p_expires_within_minutes?: number }
        Returns: {
          credentials_id: string
          expires_at: string
          integration_id: string
          organization_id: string
          provider_id: string
        }[]
      }
      get_job_postings_cursor: {
        Args: {
          p_cursor?: string
          p_cursor_id?: string
          p_department?: string
          p_organization_id: string
          p_page_size?: number
          p_status?: string
        }
        Returns: {
          has_more: boolean
          job_postings: Json
          next_cursor: string
          next_cursor_id: string
        }[]
      }
      get_notice_stats: { Args: { org_id: string }; Returns: Json }
      get_notification_preferences: {
        Args: { p_notification_type: string; p_user_id: string }
        Returns: {
          digest_frequency: string
          email_enabled: boolean
          slack_enabled: boolean
          teams_enabled: boolean
        }[]
      }
      get_notification_stats_optimized: {
        Args: { p_user_id: string }
        Returns: {
          archived: number
          by_priority: Json
          by_type: Json
          read: number
          total: number
          unread: number
        }[]
      }
      get_notifications_cursor: {
        Args: {
          p_cursor?: string
          p_cursor_id?: string
          p_is_archived?: boolean
          p_is_read?: boolean
          p_page_size?: number
          p_type?: string
          p_user_id: string
        }
        Returns: {
          has_more: boolean
          next_cursor: string
          next_cursor_id: string
          notifications: Json
        }[]
      }
      get_organization_settings: {
        Args: { org_id: string }
        Returns: {
          advanced_settings: Json | null
          ai_api_key_encrypted: string | null
          ai_career_recommendations_enabled: boolean | null
          ai_cv_scoring_enabled: boolean | null
          ai_enabled: boolean | null
          ai_max_tokens: number | null
          ai_model: string | null
          ai_performance_synthesis_enabled: boolean | null
          ai_provider: string | null
          ai_temperature: number | null
          allowed_email_domains: string[] | null
          anonymize_candidate_data: boolean | null
          asana_enabled: boolean | null
          auto_archive_completed_goals_days: number | null
          brand_accent_color: string | null
          brand_logo_url: string | null
          brand_primary_color: string | null
          brand_secondary_color: string | null
          company_tagline: string | null
          created_at: string
          custom_domain: string | null
          data_processing_region: string | null
          default_currency: string | null
          default_date_format: string | null
          default_language: string | null
          default_timezone: string | null
          email_notifications_enabled: boolean | null
          enforce_2fa: boolean | null
          features_analytics_enabled: boolean | null
          features_career_dev_enabled: boolean | null
          features_goals_enabled: boolean | null
          features_performance_enabled: boolean | null
          features_recruitment_enabled: boolean | null
          gdpr_enabled: boolean | null
          github_enabled: boolean | null
          gitlab_enabled: boolean | null
          id: string
          integrations_enabled: boolean | null
          ip_whitelist: string[] | null
          jira_enabled: boolean | null
          microsoft365_enabled: boolean | null
          notification_channels: Json | null
          notify_goal_completion: boolean | null
          notify_goal_update: boolean | null
          notify_interview_scheduled: boolean | null
          notify_new_candidate: boolean | null
          notify_new_goal: boolean | null
          notify_performance_review_due: boolean | null
          notify_performance_review_submitted: boolean | null
          notify_team_member_joined: boolean | null
          notion_enabled: boolean | null
          organization_id: string
          password_expiry_days: number | null
          password_min_length: number | null
          password_require_lowercase: boolean | null
          password_require_numbers: boolean | null
          password_require_special_chars: boolean | null
          password_require_uppercase: boolean | null
          retention_audit_logs_days: number | null
          retention_candidate_data_days: number | null
          retention_deleted_records_days: number | null
          session_timeout_minutes: number | null
          slack_enabled: boolean | null
          slack_notifications_enabled: boolean | null
          teams_enabled: boolean | null
          teams_notifications_enabled: boolean | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "organization_settings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_recruitment_funnel: {
        Args: { job_id?: string; org_id?: string }
        Returns: {
          candidate_count: number
          conversion_rate: number
          stage: string
        }[]
      }
      get_resource_stats: { Args: { org_id: string }; Returns: Json }
      get_slow_integration_queries: {
        Args: { p_min_duration_ms?: number }
        Returns: {
          avg_duration_ms: number
          integration_id: string
          max_duration_ms: number
          p95_duration_ms: number
          resource_type: string
          sync_type: string
          total_calls: number
        }[]
      }
      get_team_performance_trend: {
        Args: { months?: number; team_id: string }
        Returns: {
          avg_rating: number
          month: string
          review_count: number
        }[]
      }
      get_urgent_notices: {
        Args: { org_id: string; result_limit?: number }
        Returns: {
          author_id: string
          content: string
          created_at: string
          department: string
          expires_at: string
          id: string
          priority: string
          title: string
          type: string
          views: number
        }[]
      }
      get_user_organization_id: { Args: never; Returns: string }
      get_user_realtime_tables: {
        Args: never
        Returns: {
          operations: string[]
          table_name: string
        }[]
      }
      get_user_settings: {
        Args: { p_user_id: string }
        Returns: {
          accessibility_font_size: string | null
          accessibility_high_contrast: boolean | null
          accessibility_keyboard_shortcuts: boolean | null
          accessibility_reduce_motion: boolean | null
          accessibility_screen_reader_mode: boolean | null
          advanced_preferences: Json | null
          allow_analytics_tracking: boolean | null
          created_at: string
          dashboard_layout: string | null
          dashboard_widgets: Json | null
          date_format: string | null
          email_digest_frequency: string | null
          email_notifications_enabled: boolean | null
          id: string
          language: string | null
          notify_assigned_as_collaborator: boolean | null
          notify_direct_report_update: boolean | null
          notify_feedback_received: boolean | null
          notify_goal_comment: boolean | null
          notify_goal_completion: boolean | null
          notify_goal_update: boolean | null
          notify_interview_reminder: boolean | null
          notify_interview_scheduled: boolean | null
          notify_mentioned_in_comment: boolean | null
          notify_new_candidate: boolean | null
          notify_new_goal: boolean | null
          notify_performance_review_due: boolean | null
          notify_performance_review_submitted: boolean | null
          notify_team_member_joined: boolean | null
          organization_id: string
          out_of_office_enabled: boolean | null
          out_of_office_end_date: string | null
          out_of_office_message: string | null
          out_of_office_start_date: string | null
          profile_visibility: string | null
          show_email: boolean | null
          show_location: boolean | null
          show_onboarding_hints: boolean | null
          show_phone: boolean | null
          sidebar_collapsed: boolean | null
          slack_notifications_enabled: boolean | null
          slack_user_id: string | null
          teams_notifications_enabled: boolean | null
          teams_user_id: string | null
          theme: string | null
          theme_custom_colors: Json | null
          time_format: string | null
          timezone: string | null
          updated_at: string
          user_id: string
          working_days: number[] | null
          working_hours_end: string | null
          working_hours_start: string | null
        }
        SetofOptions: {
          from: "*"
          to: "user_settings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      global_search: {
        Args: { p_limit?: number; p_organization_id: string; p_query: string }
        Returns: {
          description: string
          rank: number
          resource_id: string
          resource_type: string
          title: string
        }[]
      }
      has_any_role: { Args: { required_roles: string[] }; Returns: boolean }
      has_role: { Args: { required_role: string }; Returns: boolean }
      immutable_array_to_string: {
        Args: { arr: string[]; sep: string }
        Returns: string
      }
      increment_faq_helpful: { Args: { faq_id: string }; Returns: undefined }
      increment_notice_views: {
        Args: { notice_id: string }
        Returns: undefined
      }
      increment_webhook_stats: {
        Args: {
          p_failed: number
          p_last_received_at: string
          p_received: number
          p_webhook_id: string
        }
        Returns: undefined
      }
      initialize_organization_settings: {
        Args: { org_id: string }
        Returns: {
          advanced_settings: Json | null
          ai_api_key_encrypted: string | null
          ai_career_recommendations_enabled: boolean | null
          ai_cv_scoring_enabled: boolean | null
          ai_enabled: boolean | null
          ai_max_tokens: number | null
          ai_model: string | null
          ai_performance_synthesis_enabled: boolean | null
          ai_provider: string | null
          ai_temperature: number | null
          allowed_email_domains: string[] | null
          anonymize_candidate_data: boolean | null
          asana_enabled: boolean | null
          auto_archive_completed_goals_days: number | null
          brand_accent_color: string | null
          brand_logo_url: string | null
          brand_primary_color: string | null
          brand_secondary_color: string | null
          company_tagline: string | null
          created_at: string
          custom_domain: string | null
          data_processing_region: string | null
          default_currency: string | null
          default_date_format: string | null
          default_language: string | null
          default_timezone: string | null
          email_notifications_enabled: boolean | null
          enforce_2fa: boolean | null
          features_analytics_enabled: boolean | null
          features_career_dev_enabled: boolean | null
          features_goals_enabled: boolean | null
          features_performance_enabled: boolean | null
          features_recruitment_enabled: boolean | null
          gdpr_enabled: boolean | null
          github_enabled: boolean | null
          gitlab_enabled: boolean | null
          id: string
          integrations_enabled: boolean | null
          ip_whitelist: string[] | null
          jira_enabled: boolean | null
          microsoft365_enabled: boolean | null
          notification_channels: Json | null
          notify_goal_completion: boolean | null
          notify_goal_update: boolean | null
          notify_interview_scheduled: boolean | null
          notify_new_candidate: boolean | null
          notify_new_goal: boolean | null
          notify_performance_review_due: boolean | null
          notify_performance_review_submitted: boolean | null
          notify_team_member_joined: boolean | null
          notion_enabled: boolean | null
          organization_id: string
          password_expiry_days: number | null
          password_min_length: number | null
          password_require_lowercase: boolean | null
          password_require_numbers: boolean | null
          password_require_special_chars: boolean | null
          password_require_uppercase: boolean | null
          retention_audit_logs_days: number | null
          retention_candidate_data_days: number | null
          retention_deleted_records_days: number | null
          session_timeout_minutes: number | null
          slack_enabled: boolean | null
          slack_notifications_enabled: boolean | null
          teams_enabled: boolean | null
          teams_notifications_enabled: boolean | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "organization_settings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      initialize_user_settings: {
        Args: { org_id: string; p_user_id: string }
        Returns: {
          accessibility_font_size: string | null
          accessibility_high_contrast: boolean | null
          accessibility_keyboard_shortcuts: boolean | null
          accessibility_reduce_motion: boolean | null
          accessibility_screen_reader_mode: boolean | null
          advanced_preferences: Json | null
          allow_analytics_tracking: boolean | null
          created_at: string
          dashboard_layout: string | null
          dashboard_widgets: Json | null
          date_format: string | null
          email_digest_frequency: string | null
          email_notifications_enabled: boolean | null
          id: string
          language: string | null
          notify_assigned_as_collaborator: boolean | null
          notify_direct_report_update: boolean | null
          notify_feedback_received: boolean | null
          notify_goal_comment: boolean | null
          notify_goal_completion: boolean | null
          notify_goal_update: boolean | null
          notify_interview_reminder: boolean | null
          notify_interview_scheduled: boolean | null
          notify_mentioned_in_comment: boolean | null
          notify_new_candidate: boolean | null
          notify_new_goal: boolean | null
          notify_performance_review_due: boolean | null
          notify_performance_review_submitted: boolean | null
          notify_team_member_joined: boolean | null
          organization_id: string
          out_of_office_enabled: boolean | null
          out_of_office_end_date: string | null
          out_of_office_message: string | null
          out_of_office_start_date: string | null
          profile_visibility: string | null
          show_email: boolean | null
          show_location: boolean | null
          show_onboarding_hints: boolean | null
          show_phone: boolean | null
          sidebar_collapsed: boolean | null
          slack_notifications_enabled: boolean | null
          slack_user_id: string | null
          teams_notifications_enabled: boolean | null
          teams_user_id: string | null
          theme: string | null
          theme_custom_colors: Json | null
          time_format: string | null
          timezone: string | null
          updated_at: string
          user_id: string
          working_days: number[] | null
          working_hours_end: string | null
          working_hours_start: string | null
        }
        SetofOptions: {
          from: "*"
          to: "user_settings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      is_component_accessible: { Args: { comp_id: string }; Returns: boolean }
      is_manager_of: { Args: { employee_id: string }; Returns: boolean }
      is_realtime_enabled: {
        Args: { table_name_input: string }
        Returns: boolean
      }
      is_same_department: { Args: { employee_id: string }; Returns: boolean }
      log_search: {
        Args: {
          module_name?: string
          org_id: string
          results?: number
          term: string
          uid?: string
        }
        Returns: undefined
      }
      mark_all_notifications_read: {
        Args: { p_user_id: string }
        Returns: {
          updated_count: number
        }[]
      }
      refresh_all_materialized_views: { Args: never; Returns: undefined }
      refresh_materialized_views: { Args: never; Returns: undefined }
      search_all_fts: {
        Args: { org_id: string; result_limit?: number; search_term: string }
        Returns: {
          created_at: string
          id: string
          module: string
          rank: number
          snippet: string
          title: string
        }[]
      }
      search_candidates: {
        Args: {
          p_job_posting_id?: string
          p_limit?: number
          p_organization_id: string
          p_query: string
        }
        Returns: {
          ai_cv_score: number
          created_at: string
          email: string
          full_name: string
          id: string
          job_posting_id: string
          phone: string
          rank: number
          status: string
        }[]
      }
      search_employees: {
        Args: {
          org_id: string
          result_limit?: number
          result_offset?: number
          search_term: string
        }
        Returns: {
          department: string
          email: string
          first_name: string
          id: string
          last_name: string
          role: string
          similarity: number
          status: string
        }[]
      }
      search_employees_fts: {
        Args: {
          org_id: string
          result_limit?: number
          result_offset?: number
          search_term: string
        }
        Returns: {
          avatar_url: string
          department: string
          email: string
          first_name: string
          hire_date: string
          id: string
          last_name: string
          location: string
          phone: string
          rank: number
          role: string
          status: string
        }[]
      }
      search_goals: {
        Args: {
          p_limit?: number
          p_organization_id: string
          p_owner_id?: string
          p_query: string
        }
        Returns: {
          created_at: string
          description: string
          id: string
          owner_id: string
          period: string
          progress_percentage: number
          rank: number
          status: string
          title: string
        }[]
      }
      search_job_postings: {
        Args: { p_limit?: number; p_organization_id: string; p_query: string }
        Returns: {
          created_at: string
          department: string
          description: string
          employment_type: string
          id: string
          location: string
          rank: number
          status: string
          title: string
        }[]
      }
      search_notices_fts: {
        Args: {
          org_id: string
          result_limit?: number
          result_offset?: number
          search_term: string
        }
        Returns: {
          author_id: string
          content: string
          created_at: string
          department: string
          expires_at: string
          id: string
          priority: string
          rank: number
          title: string
          type: string
          views: number
        }[]
      }
      search_portal_resources_fts: {
        Args: {
          org_id: string
          result_limit?: number
          result_offset?: number
          search_term: string
        }
        Returns: {
          category: string
          description: string
          featured: boolean
          id: string
          published_at: string
          rank: number
          thumbnail_url: string
          title: string
          type: string
          url: string
          views: number
        }[]
      }
      search_suggestions: {
        Args: { org_id: string; result_limit?: number; search_term: string }
        Returns: {
          module: string
          suggestion: string
        }[]
      }
      should_send_notification: {
        Args: {
          p_notification_type: string
          p_organization_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      update_integration_credentials_and_health: {
        Args: {
          p_access_token: string
          p_expires_at: string
          p_integration_id: string
          p_refresh_token: string
        }
        Returns: undefined
      }
      update_integration_health: {
        Args: { p_integration_id: string; p_success: boolean }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      sync_log_entry: {
        integration_id: string | null
        sync_type: string | null
        direction: string | null
        status: string | null
        resource_type: string | null
        resource_count: number | null
        started_at: string | null
        completed_at: string | null
        duration_ms: number | null
        records_processed: number | null
        records_created: number | null
        records_failed: number | null
        error_message: string | null
        metadata: Json | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

