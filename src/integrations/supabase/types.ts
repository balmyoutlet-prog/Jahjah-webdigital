export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addons: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          key: string
          name: string
          price_cents: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          key: string
          name: string
          price_cents: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          name?: string
          price_cents?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          path: string | null
          properties: Json
          referrer: string | null
          session_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          path?: string | null
          properties?: Json
          referrer?: string | null
          session_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          path?: string | null
          properties?: Json
          referrer?: string | null
          session_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          actor_id: string | null
          created_at: string
          event: string
          id: string
          metadata: Json
          project_id: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event: string
          id?: string
          metadata?: Json
          project_id?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event?: string
          id?: string
          metadata?: Json
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      case_studies: {
        Row: {
          created_at: string
          id: string
          live_url: string | null
          public: boolean
          public_slug: string
          sort_order: number
          summary: string | null
          title: string
          updated_at: string
          verified: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          live_url?: string | null
          public?: boolean
          public_slug: string
          sort_order?: number
          summary?: string | null
          title: string
          updated_at?: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          live_url?: string | null
          public?: boolean
          public_slug?: string
          sort_order?: number
          summary?: string | null
          title?: string
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
      }
      case_study_metrics: {
        Row: {
          case_study_id: string
          comparison_value: number | null
          created_at: string
          id: string
          metric_name: string
          metric_unit: string | null
          metric_value: number
          period_end: string | null
          period_start: string | null
          public: boolean
          source: string | null
          updated_at: string
          verified: boolean
        }
        Insert: {
          case_study_id: string
          comparison_value?: number | null
          created_at?: string
          id?: string
          metric_name: string
          metric_unit?: string | null
          metric_value: number
          period_end?: string | null
          period_start?: string | null
          public?: boolean
          source?: string | null
          updated_at?: string
          verified?: boolean
        }
        Update: {
          case_study_id?: string
          comparison_value?: number | null
          created_at?: string
          id?: string
          metric_name?: string
          metric_unit?: string | null
          metric_value?: number
          period_end?: string | null
          period_start?: string | null
          public?: boolean
          source?: string | null
          updated_at?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "case_study_metrics_case_study_id_fkey"
            columns: ["case_study_id"]
            isOneToOne: false
            referencedRelation: "case_studies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          accent_color: string | null
          address: string | null
          category: string
          city: string | null
          contact_email: string
          country: string
          created_at: string
          description: string
          existing_website: string | null
          font_style: string | null
          id: string
          identity_completed: boolean
          instagram_url: string | null
          logo_url: string | null
          maps_url: string | null
          name: string
          opening_hours: string | null
          owner_id: string
          owner_name: string
          phone: string
          photo_urls: string[]
          preferred_language: string | null
          primary_color: string | null
          referral_code: string | null
          referred_by_code: string | null
          requirements: string[]
          updated_at: string
          visual_direction: string | null
          whatsapp: string | null
        }
        Insert: {
          accent_color?: string | null
          address?: string | null
          category: string
          city?: string | null
          contact_email: string
          country: string
          created_at?: string
          description: string
          existing_website?: string | null
          font_style?: string | null
          id?: string
          identity_completed?: boolean
          instagram_url?: string | null
          logo_url?: string | null
          maps_url?: string | null
          name: string
          opening_hours?: string | null
          owner_id: string
          owner_name: string
          phone: string
          photo_urls?: string[]
          preferred_language?: string | null
          primary_color?: string | null
          referral_code?: string | null
          referred_by_code?: string | null
          requirements?: string[]
          updated_at?: string
          visual_direction?: string | null
          whatsapp?: string | null
        }
        Update: {
          accent_color?: string | null
          address?: string | null
          category?: string
          city?: string | null
          contact_email?: string
          country?: string
          created_at?: string
          description?: string
          existing_website?: string | null
          font_style?: string | null
          id?: string
          identity_completed?: boolean
          instagram_url?: string | null
          logo_url?: string | null
          maps_url?: string | null
          name?: string
          opening_hours?: string | null
          owner_id?: string
          owner_name?: string
          phone?: string
          photo_urls?: string[]
          preferred_language?: string | null
          primary_color?: string | null
          referral_code?: string | null
          referred_by_code?: string | null
          requirements?: string[]
          updated_at?: string
          visual_direction?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      domain_requests: {
        Row: {
          checked_at: string | null
          created_at: string
          dns_checked_at: string | null
          domain: string
          failure_reason: string | null
          id: string
          last_check_result: Json | null
          live_checked_at: string | null
          owner_id: string
          project_id: string
          provider: string | null
          provider_response: Json | null
          status: Database["public"]["Enums"]["domain_status"]
          tls_checked_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          checked_at?: string | null
          created_at?: string
          dns_checked_at?: string | null
          domain: string
          failure_reason?: string | null
          id?: string
          last_check_result?: Json | null
          live_checked_at?: string | null
          owner_id: string
          project_id: string
          provider?: string | null
          provider_response?: Json | null
          status?: Database["public"]["Enums"]["domain_status"]
          tls_checked_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          checked_at?: string | null
          created_at?: string
          dns_checked_at?: string | null
          domain?: string
          failure_reason?: string | null
          id?: string
          last_check_result?: Json | null
          live_checked_at?: string | null
          owner_id?: string
          project_id?: string
          provider?: string | null
          provider_response?: Json | null
          status?: Database["public"]["Enums"]["domain_status"]
          tls_checked_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "domain_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      engagement_scoring_config: {
        Row: {
          direction_selected_pts: number
          growth_study_completed_pts: number
          id: string
          payment_started_pts: number
          preview_opened_pts: number
          return_visit_pts: number
          updated_at: string
          viewed_both_directions_pts: number
          viewed_pricing_pts: number
        }
        Insert: {
          direction_selected_pts?: number
          growth_study_completed_pts?: number
          id?: string
          payment_started_pts?: number
          preview_opened_pts?: number
          return_visit_pts?: number
          updated_at?: string
          viewed_both_directions_pts?: number
          viewed_pricing_pts?: number
        }
        Update: {
          direction_selected_pts?: number
          growth_study_completed_pts?: number
          id?: string
          payment_started_pts?: number
          preview_opened_pts?: number
          return_visit_pts?: number
          updated_at?: string
          viewed_both_directions_pts?: number
          viewed_pricing_pts?: number
        }
        Relationships: []
      }
      generations: {
        Row: {
          billable: boolean
          created_at: string
          direction_key: string
          id: string
          owner_id: string
          project_id: string
          spec: Json
          status: Database["public"]["Enums"]["generation_status"]
          tier: Database["public"]["Enums"]["package_tier"]
          trial_number: number
        }
        Insert: {
          billable?: boolean
          created_at?: string
          direction_key: string
          id?: string
          owner_id: string
          project_id: string
          spec?: Json
          status?: Database["public"]["Enums"]["generation_status"]
          tier: Database["public"]["Enums"]["package_tier"]
          trial_number: number
        }
        Update: {
          billable?: boolean
          created_at?: string
          direction_key?: string
          id?: string
          owner_id?: string
          project_id?: string
          spec?: Json
          status?: Database["public"]["Enums"]["generation_status"]
          tier?: Database["public"]["Enums"]["package_tier"]
          trial_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "generations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_playbooks: {
        Row: {
          conservative_pct: number
          created_at: string
          default_tier: Database["public"]["Enums"]["package_tier"]
          expected_pct: number
          high_pct: number
          id: string
          key: string
          label: string
          messaging_angle: string | null
          recommended_features: string[]
          sort_order: number
          updated_at: string
        }
        Insert: {
          conservative_pct?: number
          created_at?: string
          default_tier?: Database["public"]["Enums"]["package_tier"]
          expected_pct?: number
          high_pct?: number
          id?: string
          key: string
          label: string
          messaging_angle?: string | null
          recommended_features?: string[]
          sort_order?: number
          updated_at?: string
        }
        Update: {
          conservative_pct?: number
          created_at?: string
          default_tier?: Database["public"]["Enums"]["package_tier"]
          expected_pct?: number
          high_pct?: number
          id?: string
          key?: string
          label?: string
          messaging_angle?: string | null
          recommended_features?: string[]
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          admin_notes: string | null
          budget_range: string | null
          company: string
          country: string
          created_at: string
          current_website: string | null
          details: string
          email: string
          heard_about: string | null
          id: string
          industry: string | null
          landing_page: string | null
          launch_timing: string | null
          name: string
          need: string
          phone: string | null
          referrer: string | null
          session_id: string | null
          source: string
          status: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          admin_notes?: string | null
          budget_range?: string | null
          company: string
          country: string
          created_at?: string
          current_website?: string | null
          details: string
          email: string
          heard_about?: string | null
          id?: string
          industry?: string | null
          landing_page?: string | null
          launch_timing?: string | null
          name: string
          need: string
          phone?: string | null
          referrer?: string | null
          session_id?: string | null
          source?: string
          status?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          admin_notes?: string | null
          budget_range?: string | null
          company?: string
          country?: string
          created_at?: string
          current_website?: string | null
          details?: string
          email?: string
          heard_about?: string | null
          id?: string
          industry?: string | null
          landing_page?: string | null
          launch_timing?: string | null
          name?: string
          need?: string
          phone?: string | null
          referrer?: string | null
          session_id?: string | null
          source?: string
          status?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      order_addons: {
        Row: {
          addon_key: string
          created_at: string
          id: string
          name: string
          order_id: string
          price_cents: number
        }
        Insert: {
          addon_key: string
          created_at?: string
          id?: string
          name: string
          order_id: string
          price_cents: number
        }
        Update: {
          addon_key?: string
          created_at?: string
          id?: string
          name?: string
          order_id?: string
          price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_addons_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          description: string
          id: string
          kind: Database["public"]["Enums"]["order_kind"]
          owner_id: string
          paid_at: string | null
          project_id: string | null
          provider: string | null
          provider_reference: string | null
          status: Database["public"]["Enums"]["order_status"]
          tier: Database["public"]["Enums"]["package_tier"] | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          description: string
          id?: string
          kind: Database["public"]["Enums"]["order_kind"]
          owner_id: string
          paid_at?: string | null
          project_id?: string | null
          provider?: string | null
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          tier?: Database["public"]["Enums"]["package_tier"] | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          description?: string
          id?: string
          kind?: Database["public"]["Enums"]["order_kind"]
          owner_id?: string
          paid_at?: string | null
          project_id?: string | null
          provider?: string | null
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          tier?: Database["public"]["Enums"]["package_tier"] | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_events: {
        Row: {
          actor_id: string | null
          channel: string | null
          created_at: string
          event_type: string
          from_status: string | null
          id: string
          note: string | null
          prospect_id: string
          to_status: string | null
        }
        Insert: {
          actor_id?: string | null
          channel?: string | null
          created_at?: string
          event_type: string
          from_status?: string | null
          id?: string
          note?: string | null
          prospect_id: string
          to_status?: string | null
        }
        Update: {
          actor_id?: string | null
          channel?: string | null
          created_at?: string
          event_type?: string
          from_status?: string | null
          id?: string
          note?: string | null
          prospect_id?: string
          to_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outreach_events_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_records: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          consequence: string | null
          contact_role: string | null
          contact_route: string | null
          contact_route_type: string | null
          contact_verified: boolean
          created_at: string
          cta: string
          dm_first: string | null
          dm_follow_up: string | null
          email_first: string | null
          email_follow_up: string | null
          follow_up_count: number
          follow_up_eligible_at: string | null
          id: string
          last_channel: string | null
          last_contacted_at: string | null
          observation: string | null
          observation_verified: boolean
          opted_in: boolean
          preferred_channel: string | null
          proof_slug: string | null
          prospect_id: string
          replied_at: string | null
          reply_classification: string | null
          signal_date: string | null
          signal_summary: string | null
          signal_type: string | null
          solution_angle: string | null
          source_urls: string[]
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          consequence?: string | null
          contact_role?: string | null
          contact_route?: string | null
          contact_route_type?: string | null
          contact_verified?: boolean
          created_at?: string
          cta?: string
          dm_first?: string | null
          dm_follow_up?: string | null
          email_first?: string | null
          email_follow_up?: string | null
          follow_up_count?: number
          follow_up_eligible_at?: string | null
          id?: string
          last_channel?: string | null
          last_contacted_at?: string | null
          observation?: string | null
          observation_verified?: boolean
          opted_in?: boolean
          preferred_channel?: string | null
          proof_slug?: string | null
          prospect_id: string
          replied_at?: string | null
          reply_classification?: string | null
          signal_date?: string | null
          signal_summary?: string | null
          signal_type?: string | null
          solution_angle?: string | null
          source_urls?: string[]
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          consequence?: string | null
          contact_role?: string | null
          contact_route?: string | null
          contact_route_type?: string | null
          contact_verified?: boolean
          created_at?: string
          cta?: string
          dm_first?: string | null
          dm_follow_up?: string | null
          email_first?: string | null
          email_follow_up?: string | null
          follow_up_count?: number
          follow_up_eligible_at?: string | null
          id?: string
          last_channel?: string | null
          last_contacted_at?: string | null
          observation?: string | null
          observation_verified?: boolean
          opted_in?: boolean
          preferred_channel?: string | null
          proof_slug?: string | null
          prospect_id?: string
          replied_at?: string | null
          reply_classification?: string | null
          signal_date?: string | null
          signal_summary?: string | null
          signal_type?: string | null
          solution_angle?: string | null
          source_urls?: string[]
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outreach_records_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: true
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_settings: {
        Row: {
          dkim_status: string
          dmarc_status: string
          domain_verified: boolean
          id: boolean
          inbound_tested: boolean
          last_test_at: string | null
          last_test_result: string | null
          readiness_confirmed: boolean
          reply_to: string | null
          reply_to_configured: boolean
          sender_address: string | null
          sending_domain: string | null
          spf_status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          dkim_status?: string
          dmarc_status?: string
          domain_verified?: boolean
          id?: boolean
          inbound_tested?: boolean
          last_test_at?: string | null
          last_test_result?: string | null
          readiness_confirmed?: boolean
          reply_to?: string | null
          reply_to_configured?: boolean
          sender_address?: string | null
          sending_domain?: string | null
          spf_status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          dkim_status?: string
          dmarc_status?: string
          domain_verified?: boolean
          id?: boolean
          inbound_tested?: boolean
          last_test_at?: string | null
          last_test_result?: string | null
          readiness_confirmed?: boolean
          reply_to?: string | null
          reply_to_configured?: boolean
          sender_address?: string | null
          sending_domain?: string | null
          spf_status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      packages: {
        Row: {
          features: Json
          included_trials: number
          max_pages: number
          max_sections: number
          name: string
          price_cents: number
          sort_order: number
          tagline: string
          tier: Database["public"]["Enums"]["package_tier"]
        }
        Insert: {
          features?: Json
          included_trials?: number
          max_pages: number
          max_sections: number
          name: string
          price_cents: number
          sort_order?: number
          tagline: string
          tier: Database["public"]["Enums"]["package_tier"]
        }
        Update: {
          features?: Json
          included_trials?: number
          max_pages?: number
          max_sections?: number
          name?: string
          price_cents?: number
          sort_order?: number
          tagline?: string
          tier?: Database["public"]["Enums"]["package_tier"]
        }
        Relationships: []
      }
      payment_submissions: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          method: string
          order_id: string
          owner_id: string
          payer_name: string
          payer_phone: string
          receipt_path: string | null
          reference: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["payment_submission_status"]
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          method?: string
          order_id: string
          owner_id: string
          payer_name: string
          payer_phone: string
          receipt_path?: string | null
          reference?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["payment_submission_status"]
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          method?: string
          order_id?: string
          owner_id?: string
          payer_name?: string
          payer_phone?: string
          receipt_path?: string | null
          reference?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["payment_submission_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payment_submissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          company_id: string
          created_at: string
          extra_trials_purchased: number
          id: string
          owner_id: string
          paid: boolean
          published_at: string | null
          published_domain: string | null
          selected_addons: string[]
          selected_generation_id: string | null
          source_prospect_id: string | null
          status: Database["public"]["Enums"]["project_status"]
          tier: Database["public"]["Enums"]["package_tier"]
          trials_used: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          extra_trials_purchased?: number
          id?: string
          owner_id: string
          paid?: boolean
          published_at?: string | null
          published_domain?: string | null
          selected_addons?: string[]
          selected_generation_id?: string | null
          source_prospect_id?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          tier?: Database["public"]["Enums"]["package_tier"]
          trials_used?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          extra_trials_purchased?: number
          id?: string
          owner_id?: string
          paid?: boolean
          published_at?: string | null
          published_domain?: string | null
          selected_addons?: string[]
          selected_generation_id?: string | null
          source_prospect_id?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          tier?: Database["public"]["Enums"]["package_tier"]
          trials_used?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_source_prospect_id_fkey"
            columns: ["source_prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_activities: {
        Row: {
          activity_type: string
          actor_id: string | null
          created_at: string
          id: string
          message: string | null
          metadata: Json
          prospect_id: string
        }
        Insert: {
          activity_type: string
          actor_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json
          prospect_id: string
        }
        Update: {
          activity_type?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json
          prospect_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prospect_activities_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      prospects: {
        Row: {
          audit_result: Json | null
          audited_at: string | null
          avg_order_value: number | null
          brand_colors: Json
          brand_verified: boolean
          business_name: string
          category: string | null
          city: string | null
          concept_data: Json | null
          concept_generated_at: string | null
          country: string
          created_at: string
          created_by: string | null
          description: string | null
          direction_selected: string | null
          discovered_at: string
          edit_request_note: string | null
          edit_request_types: string[]
          email: string | null
          engagement_score: number
          google_maps_url: string | null
          google_rating: number | null
          google_reviews_count: number | null
          gross_margin_pct: number | null
          id: string
          identified_gap: string | null
          instagram_followers: number | null
          instagram_url: string | null
          lead_source: string
          linked_owner_id: string | null
          logo_url: string | null
          monthly_sales_exact: number | null
          monthly_sales_range: string | null
          monthly_volume: number | null
          next_follow_up_date: string | null
          notes: string | null
          opportunity_score: number
          owner_attention_reason: string | null
          owner_attention_required: boolean
          phone: string | null
          preview_auto_extended: boolean
          preview_expires_at: string | null
          preview_extended_count: number
          primary_goal: string | null
          public_token: string
          recommendation_viewed_at: string | null
          recommended_features: string[]
          recommended_reasoning: string | null
          recommended_tier: Database["public"]["Enums"]["package_tier"] | null
          referral_code: string | null
          referred_by_code: string | null
          scenario_assumptions: Json
          scenario_conservative_monthly: number | null
          scenario_expected_monthly: number | null
          scenario_high_monthly: number | null
          scenario_is_range: boolean
          score_breakdown: Json
          snapshot_submitted_at: string | null
          stage: Database["public"]["Enums"]["prospect_stage"]
          study_opened_at: string | null
          updated_at: string
          website_status: Database["public"]["Enums"]["website_status"]
          website_url: string | null
          whatsapp: string | null
        }
        Insert: {
          audit_result?: Json | null
          audited_at?: string | null
          avg_order_value?: number | null
          brand_colors?: Json
          brand_verified?: boolean
          business_name: string
          category?: string | null
          city?: string | null
          concept_data?: Json | null
          concept_generated_at?: string | null
          country?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction_selected?: string | null
          discovered_at?: string
          edit_request_note?: string | null
          edit_request_types?: string[]
          email?: string | null
          engagement_score?: number
          google_maps_url?: string | null
          google_rating?: number | null
          google_reviews_count?: number | null
          gross_margin_pct?: number | null
          id?: string
          identified_gap?: string | null
          instagram_followers?: number | null
          instagram_url?: string | null
          lead_source?: string
          linked_owner_id?: string | null
          logo_url?: string | null
          monthly_sales_exact?: number | null
          monthly_sales_range?: string | null
          monthly_volume?: number | null
          next_follow_up_date?: string | null
          notes?: string | null
          opportunity_score?: number
          owner_attention_reason?: string | null
          owner_attention_required?: boolean
          phone?: string | null
          preview_auto_extended?: boolean
          preview_expires_at?: string | null
          preview_extended_count?: number
          primary_goal?: string | null
          public_token?: string
          recommendation_viewed_at?: string | null
          recommended_features?: string[]
          recommended_reasoning?: string | null
          recommended_tier?: Database["public"]["Enums"]["package_tier"] | null
          referral_code?: string | null
          referred_by_code?: string | null
          scenario_assumptions?: Json
          scenario_conservative_monthly?: number | null
          scenario_expected_monthly?: number | null
          scenario_high_monthly?: number | null
          scenario_is_range?: boolean
          score_breakdown?: Json
          snapshot_submitted_at?: string | null
          stage?: Database["public"]["Enums"]["prospect_stage"]
          study_opened_at?: string | null
          updated_at?: string
          website_status?: Database["public"]["Enums"]["website_status"]
          website_url?: string | null
          whatsapp?: string | null
        }
        Update: {
          audit_result?: Json | null
          audited_at?: string | null
          avg_order_value?: number | null
          brand_colors?: Json
          brand_verified?: boolean
          business_name?: string
          category?: string | null
          city?: string | null
          concept_data?: Json | null
          concept_generated_at?: string | null
          country?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction_selected?: string | null
          discovered_at?: string
          edit_request_note?: string | null
          edit_request_types?: string[]
          email?: string | null
          engagement_score?: number
          google_maps_url?: string | null
          google_rating?: number | null
          google_reviews_count?: number | null
          gross_margin_pct?: number | null
          id?: string
          identified_gap?: string | null
          instagram_followers?: number | null
          instagram_url?: string | null
          lead_source?: string
          linked_owner_id?: string | null
          logo_url?: string | null
          monthly_sales_exact?: number | null
          monthly_sales_range?: string | null
          monthly_volume?: number | null
          next_follow_up_date?: string | null
          notes?: string | null
          opportunity_score?: number
          owner_attention_reason?: string | null
          owner_attention_required?: boolean
          phone?: string | null
          preview_auto_extended?: boolean
          preview_expires_at?: string | null
          preview_extended_count?: number
          primary_goal?: string | null
          public_token?: string
          recommendation_viewed_at?: string | null
          recommended_features?: string[]
          recommended_reasoning?: string | null
          recommended_tier?: Database["public"]["Enums"]["package_tier"] | null
          referral_code?: string | null
          referred_by_code?: string | null
          scenario_assumptions?: Json
          scenario_conservative_monthly?: number | null
          scenario_expected_monthly?: number | null
          scenario_high_monthly?: number | null
          scenario_is_range?: boolean
          score_breakdown?: Json
          snapshot_submitted_at?: string | null
          stage?: Database["public"]["Enums"]["prospect_stage"]
          study_opened_at?: string | null
          updated_at?: string
          website_status?: Database["public"]["Enums"]["website_status"]
          website_url?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          count: number
          key: string
          window_start: string
        }
        Insert: {
          count?: number
          key: string
          window_start?: string
        }
        Update: {
          count?: number
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      restaurant_applications: {
        Row: {
          admin_notes: string | null
          business_name: string
          city: string | null
          contact_name: string
          country: string
          created_at: string
          current_website: string | null
          email: string
          extras: string[]
          extras_total_cents: number
          google_maps_url: string | null
          id: string
          instagram_url: string | null
          notes: string | null
          package_key: string
          package_price_cents: number
          phone: string
          reference: string
          referrer: string | null
          session_id: string | null
          status: string
          total_cents: number
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          admin_notes?: string | null
          business_name: string
          city?: string | null
          contact_name: string
          country: string
          created_at?: string
          current_website?: string | null
          email: string
          extras?: string[]
          extras_total_cents?: number
          google_maps_url?: string | null
          id?: string
          instagram_url?: string | null
          notes?: string | null
          package_key: string
          package_price_cents: number
          phone: string
          reference: string
          referrer?: string | null
          session_id?: string | null
          status?: string
          total_cents: number
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          admin_notes?: string | null
          business_name?: string
          city?: string | null
          contact_name?: string
          country?: string
          created_at?: string
          current_website?: string | null
          email?: string
          extras?: string[]
          extras_total_cents?: number
          google_maps_url?: string | null
          id?: string
          instagram_url?: string | null
          notes?: string | null
          package_key?: string
          package_price_cents?: number
          phone?: string
          reference?: string
          referrer?: string | null
          session_id?: string | null
          status?: string
          total_cents?: number
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      trust_milestones: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          key: string
          label: string
          sort_order: number
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          key: string
          label: string
          sort_order?: number
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: { p_key: string; p_limit: number; p_window_seconds: number }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "customer"
      domain_status:
        | "unchecked"
        | "provider_not_connected"
        | "available"
        | "unavailable"
        | "selected"
        | "requested"
        | "verified"
        | "dns_pending"
        | "dns_configured"
        | "tls_active"
        | "live"
        | "failed"
      generation_status: "queued" | "completed" | "failed"
      order_kind: "package" | "upgrade" | "extra_trial"
      order_status:
        | "awaiting_payment_integration"
        | "pending"
        | "paid"
        | "failed"
        | "cancelled"
      package_tier: "basic" | "medium" | "high"
      payment_submission_status:
        | "pending"
        | "verified"
        | "rejected"
        | "clarification_requested"
      project_status:
        | "draft"
        | "awaiting_payment"
        | "active"
        | "published"
        | "launch_requested"
      prospect_stage:
        | "new_lead"
        | "qualified"
        | "ready_for_outreach"
        | "contacted"
        | "replied"
        | "interested"
        | "form_submitted"
        | "package_selected"
        | "payment_pending"
        | "payment_submitted"
        | "payment_verified"
        | "website_in_production"
        | "client_review"
        | "published"
        | "lost"
      website_status: "no_website" | "weak_website" | "good_website" | "unknown"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "customer"],
      domain_status: [
        "unchecked",
        "provider_not_connected",
        "available",
        "unavailable",
        "selected",
        "requested",
        "verified",
        "dns_pending",
        "dns_configured",
        "tls_active",
        "live",
        "failed",
      ],
      generation_status: ["queued", "completed", "failed"],
      order_kind: ["package", "upgrade", "extra_trial"],
      order_status: [
        "awaiting_payment_integration",
        "pending",
        "paid",
        "failed",
        "cancelled",
      ],
      package_tier: ["basic", "medium", "high"],
      payment_submission_status: [
        "pending",
        "verified",
        "rejected",
        "clarification_requested",
      ],
      project_status: [
        "draft",
        "awaiting_payment",
        "active",
        "published",
        "launch_requested",
      ],
      prospect_stage: [
        "new_lead",
        "qualified",
        "ready_for_outreach",
        "contacted",
        "replied",
        "interested",
        "form_submitted",
        "package_selected",
        "payment_pending",
        "payment_submitted",
        "payment_verified",
        "website_in_production",
        "client_review",
        "published",
        "lost",
      ],
      website_status: ["no_website", "weak_website", "good_website", "unknown"],
    },
  },
} as const
