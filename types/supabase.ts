export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity: {
        Row: {
          active: string | null
          activeenddate: string | null
          activestartdate: string | null
          activitycompletiontimestamp: string | null
          activitystarttimestamp: string | null
          address: string | null
          coin_id: string | null
          contract_id: string | null
          created_at: string | null
          detail: string | null
          enteractive: string | null
          id: string
          imageurl: string | null
          productids: string[] | null
          products: string[] | null
          state: string | null
          status: string | null
          type: string | null
          updated_at: string | null
          user_id: string
          videourl: string | null
        }
        Insert: {
          active?: string | null
          activeenddate?: string | null
          activestartdate?: string | null
          activitycompletiontimestamp?: string | null
          activitystarttimestamp?: string | null
          address?: string | null
          coin_id?: string | null
          contract_id?: string | null
          created_at?: string | null
          detail?: string | null
          enteractive?: string | null
          id?: string
          imageurl?: string | null
          productids?: string[] | null
          products?: string[] | null
          state?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id: string
          videourl?: string | null
        }
        Update: {
          active?: string | null
          activeenddate?: string | null
          activestartdate?: string | null
          activitycompletiontimestamp?: string | null
          activitystarttimestamp?: string | null
          address?: string | null
          coin_id?: string | null
          contract_id?: string | null
          created_at?: string | null
          detail?: string | null
          enteractive?: string | null
          id?: string
          imageurl?: string | null
          productids?: string[] | null
          products?: string[] | null
          state?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string
          videourl?: string | null
        }
        Relationships: []
      }
      addons: {
        Row: {
          category: string | null
          compatibility: string[] | null
          description: string | null
          id: string
          metadata: Json | null
          name: string | null
          visual_asset_url: string | null
        }
        Insert: {
          category?: string | null
          compatibility?: string[] | null
          description?: string | null
          id: string
          metadata?: Json | null
          name?: string | null
          visual_asset_url?: string | null
        }
        Update: {
          category?: string | null
          compatibility?: string[] | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string | null
          visual_asset_url?: string | null
        }
        Relationships: []
      }
      agents: {
        Row: {
          created_at: string | null
          description: string | null
          funding: string | null
          id: string
          last_updated: string | null
          name: string
          source: string | null
          tags: Json | null
          vertical: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          funding?: string | null
          id?: string
          last_updated?: string | null
          name: string
          source?: string | null
          tags?: Json | null
          vertical?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          funding?: string | null
          id?: string
          last_updated?: string | null
          name?: string
          source?: string | null
          tags?: Json | null
          vertical?: string | null
          website?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          changed_at: string
          changed_by: string
          id: string
          new_data: Json | null
          old_data: Json | null
          operation: string
          record_id: string
          table_name: string
        }
        Insert: {
          changed_at?: string
          changed_by: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          record_id: string
          table_name: string
        }
        Update: {
          changed_at?: string
          changed_by?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      aura_coins: {
        Row: {
          active: boolean | null
          cap: number
          created_at: string
          dividend_eligible: boolean | null
          earnings_model: string | null
          emoji: string | null
          id: string
          img_Url: string | null
          is_featured: boolean | null
          name: string
          owner_name: string | null
          price: number
          projected_cap: number | null
          rarity: string | null
          scope: string[] | null
          symbol: string | null
          tagline: string | null
          type: string | null
          updated_at: string
          user_id: string
          visible: boolean | null
          vision: string | null
        }
        Insert: {
          active?: boolean | null
          cap?: number
          created_at?: string
          dividend_eligible?: boolean | null
          earnings_model?: string | null
          emoji?: string | null
          id?: string
          img_Url?: string | null
          is_featured?: boolean | null
          name: string
          owner_name?: string | null
          price?: number
          projected_cap?: number | null
          rarity?: string | null
          scope?: string[] | null
          symbol?: string | null
          tagline?: string | null
          type?: string | null
          updated_at?: string
          user_id: string
          visible?: boolean | null
          vision?: string | null
        }
        Update: {
          active?: boolean | null
          cap?: number
          created_at?: string
          dividend_eligible?: boolean | null
          earnings_model?: string | null
          emoji?: string | null
          id?: string
          img_Url?: string | null
          is_featured?: boolean | null
          name?: string
          owner_name?: string | null
          price?: number
          projected_cap?: number | null
          rarity?: string | null
          scope?: string[] | null
          symbol?: string | null
          tagline?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string
          visible?: boolean | null
          vision?: string | null
        }
        Relationships: []
      }
      business_profiles: {
        Row: {
          account_created: boolean
          art_role: string[] | null
          artgang: boolean
          business_name: string | null
          business_role: string | null
          created_at: string
          last_scan: string | null
          portfolio: string[] | null
          scan_results: Json | null
          updated_at: string
          user_id: string
          verification: boolean
          vulnerability_scans_active: boolean | null
          wallet_methods: string[] | null
        }
        Insert: {
          account_created?: boolean
          art_role?: string[] | null
          artgang?: boolean
          business_name?: string | null
          business_role?: string | null
          created_at?: string
          last_scan?: string | null
          portfolio?: string[] | null
          scan_results?: Json | null
          updated_at?: string
          user_id: string
          verification?: boolean
          vulnerability_scans_active?: boolean | null
          wallet_methods?: string[] | null
        }
        Update: {
          account_created?: boolean
          art_role?: string[] | null
          artgang?: boolean
          business_name?: string | null
          business_role?: string | null
          created_at?: string
          last_scan?: string | null
          portfolio?: string[] | null
          scan_results?: Json | null
          updated_at?: string
          user_id?: string
          verification?: boolean
          vulnerability_scans_active?: boolean | null
          wallet_methods?: string[] | null
        }
        Relationships: []
      }
      coin_activity: {
        Row: {
          amount: number
          coin_id: string | null
          created_at: string | null
          description: string | null
          id: string
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          coin_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          coin_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coin_activity_coin_id_fkey"
            columns: ["coin_id"]
            isOneToOne: false
            referencedRelation: "aura_coins"
            referencedColumns: ["id"]
          },
        ]
      }
      coin_shares: {
        Row: {
          coin_id: string | null
          id: string
          shares: number | null
          user_id: string
        }
        Insert: {
          coin_id?: string | null
          id?: string
          shares?: number | null
          user_id: string
        }
        Update: {
          coin_id?: string | null
          id?: string
          shares?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coin_shares_coin_id_fkey"
            columns: ["coin_id"]
            isOneToOne: false
            referencedRelation: "aura_coins"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          employees: string[]
          id: string
          name: string
        }
        Insert: {
          employees?: string[]
          id?: string
          name: string
        }
        Update: {
          employees?: string[]
          id?: string
          name?: string
        }
        Relationships: []
      }
      company_models: {
        Row: {
          company_id: string
          model_url: string | null
          variant: string
        }
        Insert: {
          company_id: string
          model_url?: string | null
          variant: string
        }
        Update: {
          company_id?: string
          model_url?: string | null
          variant?: string
        }
        Relationships: []
      }
      department_media: {
        Row: {
          department: string
          description: string | null
          id: string
          img_url: string | null
          link_url: string | null
          slot: number
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          department: string
          description?: string | null
          id?: string
          img_url?: string | null
          link_url?: string | null
          slot: number
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          department?: string
          description?: string | null
          id?: string
          img_url?: string | null
          link_url?: string | null
          slot?: number
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      fam_awards: {
        Row: {
          award_name: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          video_url: string | null
          winner_name: string
          year: number
        }
        Insert: {
          award_name: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          video_url?: string | null
          winner_name: string
          year: number
        }
        Update: {
          award_name?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          video_url?: string | null
          winner_name?: string
          year?: number
        }
        Relationships: []
      }
      halo_profiles: {
        Row: {
          address: string | null
          age: number | null
          archalogen_status: string | null
          birthday: string | null
          created_at: string | null
          display_media_url: string | null
          halo_id: string
          halo_range_id: string | null
          id: string
          parent_a_halo_id: string | null
          parent_z_halo_id: string | null
          sex: string | null
          shipping_address: string | null
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          address?: string | null
          age?: number | null
          archalogen_status?: string | null
          birthday?: string | null
          created_at?: string | null
          display_media_url?: string | null
          halo_id: string
          halo_range_id?: string | null
          id?: string
          parent_a_halo_id?: string | null
          parent_z_halo_id?: string | null
          sex?: string | null
          shipping_address?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          address?: string | null
          age?: number | null
          archalogen_status?: string | null
          birthday?: string | null
          created_at?: string | null
          display_media_url?: string | null
          halo_id?: string
          halo_range_id?: string | null
          id?: string
          parent_a_halo_id?: string | null
          parent_z_halo_id?: string | null
          sex?: string | null
          shipping_address?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "halo_profiles_halo_range_id_fkey"
            columns: ["halo_range_id"]
            isOneToOne: false
            referencedRelation: "halo_ranges"
            referencedColumns: ["id"]
          },
        ]
      }
      halo_ranges: {
        Row: {
          created_at: string | null
          description: string | null
          halo_ids: string[] | null
          id: string
          label: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          halo_ids?: string[] | null
          id?: string
          label?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          halo_ids?: string[] | null
          id?: string
          label?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      haloranges: {
        Row: {
          created_at: string | null
          created_by: string | null
          halo_ids: string[]
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          halo_ids: string[]
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          halo_ids?: string[]
          id?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "haloranges_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      halos: {
        Row: {
          color: string | null
          created_at: string | null
          head_size_cm: number | null
          id: string
          lat: number | null
          lng: number | null
          name: string
          selected_addons: string[] | null
          stage: Database["public"]["Enums"]["halo_stage"]
          user_id: string
          variant: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          head_size_cm?: number | null
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          selected_addons?: string[] | null
          stage?: Database["public"]["Enums"]["halo_stage"]
          user_id: string
          variant?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          head_size_cm?: number | null
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          selected_addons?: string[] | null
          stage?: Database["public"]["Enums"]["halo_stage"]
          user_id?: string
          variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "halos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ideaflight_messages: {
        Row: {
          created_at: string | null
          id: string
          ideaflight_id: string | null
          message: string | null
          sender_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ideaflight_id?: string | null
          message?: string | null
          sender_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ideaflight_id?: string | null
          message?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ideaflight_messages_ideaflight_id_fkey"
            columns: ["ideaflight_id"]
            isOneToOne: false
            referencedRelation: "ideaflights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ideaflight_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ideaflights: {
        Row: {
          created_at: string | null
          created_by: string | null
          employment_type: string | null
          geozone_id: string | null
          halorange_ids: string[]
          id: string
          owner_id: string | null
          pay_type: string | null
          project_end: string | null
          project_start: string | null
          recurring: boolean | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          employment_type?: string | null
          geozone_id?: string | null
          halorange_ids: string[]
          id?: string
          owner_id?: string | null
          pay_type?: string | null
          project_end?: string | null
          project_start?: string | null
          recurring?: boolean | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          employment_type?: string | null
          geozone_id?: string | null
          halorange_ids?: string[]
          id?: string
          owner_id?: string | null
          pay_type?: string | null
          project_end?: string | null
          project_start?: string | null
          recurring?: boolean | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ideaflights_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ideaflights_geozone_id_fkey"
            columns: ["geozone_id"]
            isOneToOne: false
            referencedRelation: "mmxxvisionboardgeozones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ideaflights_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      macros: {
        Row: {
          activity_number: string | null
          activity_status: string | null
          address: string | null
          created_at: string | null
          id: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          activity_number?: string | null
          activity_status?: string | null
          address?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          activity_number?: string | null
          activity_status?: string | null
          address?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "macros_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      manifests: {
        Row: {
          city: string | null
          created_at: string | null
          distance: number | null
          geozone_id: string | null
          id: string
          ideaflight_id: string | null
          manifest_date: string | null
          manifest_id: string | null
          micros: string[] | null
          progress: number | null
          state: string | null
          zipcode: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          distance?: number | null
          geozone_id?: string | null
          id?: string
          ideaflight_id?: string | null
          manifest_date?: string | null
          manifest_id?: string | null
          micros?: string[] | null
          progress?: number | null
          state?: string | null
          zipcode?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          distance?: number | null
          geozone_id?: string | null
          id?: string
          ideaflight_id?: string | null
          manifest_date?: string | null
          manifest_id?: string | null
          micros?: string[] | null
          progress?: number | null
          state?: string | null
          zipcode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manifests_geozone_id_fkey"
            columns: ["geozone_id"]
            isOneToOne: false
            referencedRelation: "mmxxvisionboardgeozones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manifests_ideaflight_id_fkey"
            columns: ["ideaflight_id"]
            isOneToOne: false
            referencedRelation: "ideaflights"
            referencedColumns: ["id"]
          },
        ]
      }
      micro_objects: {
        Row: {
          active_coords: Json | null
          carbon_kg: number | null
          created_at: string | null
          death_coord: number[] | null
          death_estimate: string | null
          delivery_coord: number[] | null
          energy_saved_kwh: number | null
          enter_micro_id: string | null
          id: string
          micro_id: string | null
          model_url: string | null
          nearest_landfill: string | null
          planet: string | null
          prompt: string | null
          rest_coord: number[] | null
          texture_url: string | null
          user_id: string | null
        }
        Insert: {
          active_coords?: Json | null
          carbon_kg?: number | null
          created_at?: string | null
          death_coord?: number[] | null
          death_estimate?: string | null
          delivery_coord?: number[] | null
          energy_saved_kwh?: number | null
          enter_micro_id?: string | null
          id?: string
          micro_id?: string | null
          model_url?: string | null
          nearest_landfill?: string | null
          planet?: string | null
          prompt?: string | null
          rest_coord?: number[] | null
          texture_url?: string | null
          user_id?: string | null
        }
        Update: {
          active_coords?: Json | null
          carbon_kg?: number | null
          created_at?: string | null
          death_coord?: number[] | null
          death_estimate?: string | null
          delivery_coord?: number[] | null
          energy_saved_kwh?: number | null
          enter_micro_id?: string | null
          id?: string
          micro_id?: string | null
          model_url?: string | null
          nearest_landfill?: string | null
          planet?: string | null
          prompt?: string | null
          rest_coord?: number[] | null
          texture_url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      micromanifests: {
        Row: {
          activity_id: string | null
          address: string | null
          complete: boolean | null
          created_at: string | null
          delivered_products: string[] | null
          delivery_note: string | null
          id: string
          manifest_id: string | null
          products: string[] | null
        }
        Insert: {
          activity_id?: string | null
          address?: string | null
          complete?: boolean | null
          created_at?: string | null
          delivered_products?: string[] | null
          delivery_note?: string | null
          id?: string
          manifest_id?: string | null
          products?: string[] | null
        }
        Update: {
          activity_id?: string | null
          address?: string | null
          complete?: boolean | null
          created_at?: string | null
          delivered_products?: string[] | null
          delivery_note?: string | null
          id?: string
          manifest_id?: string | null
          products?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "micromanifests_manifest_id_fkey"
            columns: ["manifest_id"]
            isOneToOne: false
            referencedRelation: "manifests"
            referencedColumns: ["id"]
          },
        ]
      }
      mmxxvisionboardgeozones: {
        Row: {
          city: string
          id: string
          state: string
          zipcode: string
        }
        Insert: {
          city: string
          id?: string
          state: string
          zipcode: string
        }
        Update: {
          city?: string
          id?: string
          state?: string
          zipcode?: string
        }
        Relationships: []
      }
      models: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          price: number | null
          thumbnail: string | null
          url: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          price?: number | null
          thumbnail?: string | null
          url: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          price?: number | null
          thumbnail?: string | null
          url?: string
        }
        Relationships: []
      }
      occupation_codes: {
        Row: {
          code: string
          description: string | null
          major_group: string | null
          title: string
        }
        Insert: {
          code: string
          description?: string | null
          major_group?: string | null
          title: string
        }
        Update: {
          code?: string
          description?: string | null
          major_group?: string | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          available: boolean | null
          display_name: string | null
          id: string
          job_code: string | null
          last_lat: number | null
          last_lng: number | null
          role: string | null
          skills: Json | null
          work_radius: number | null
        }
        Insert: {
          available?: boolean | null
          display_name?: string | null
          id: string
          job_code?: string | null
          last_lat?: number | null
          last_lng?: number | null
          role?: string | null
          skills?: Json | null
          work_radius?: number | null
        }
        Update: {
          available?: boolean | null
          display_name?: string | null
          id?: string
          job_code?: string | null
          last_lat?: number | null
          last_lng?: number | null
          role?: string | null
          skills?: Json | null
          work_radius?: number | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          buildings: Json | null
          created_at: string | null
          customer_id: string | null
          id: number
          lot_polygon: Json | null
          name: string | null
        }
        Insert: {
          address?: string | null
          buildings?: Json | null
          created_at?: string | null
          customer_id?: string | null
          id?: never
          lot_polygon?: Json | null
          name?: string | null
        }
        Update: {
          address?: string | null
          buildings?: Json | null
          created_at?: string | null
          customer_id?: string | null
          id?: never
          lot_polygon?: Json | null
          name?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          address: string | null
          contact: string | null
          created_at: string | null
          date: string | null
          details: Json | null
          id: number
          name: string | null
          photo_url: string | null
          services: string[] | null
          status: string | null
          time: string | null
          yard_size: number | null
        }
        Insert: {
          address?: string | null
          contact?: string | null
          created_at?: string | null
          date?: string | null
          details?: Json | null
          id?: never
          name?: string | null
          photo_url?: string | null
          services?: string[] | null
          status?: string | null
          time?: string | null
          yard_size?: number | null
        }
        Update: {
          address?: string | null
          contact?: string | null
          created_at?: string | null
          date?: string | null
          details?: Json | null
          id?: never
          name?: string | null
          photo_url?: string | null
          services?: string[] | null
          status?: string | null
          time?: string | null
          yard_size?: number | null
        }
        Relationships: []
      }
      scripts: {
        Row: {
          content: string | null
          created_at: string | null
          created_by: string | null
          id: string
          time_id: string | null
          version: number | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          time_id?: string | null
          version?: number | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          time_id?: string | null
          version?: number | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: number
          key: string
          value: string | null
        }
        Insert: {
          id?: number
          key: string
          value?: string | null
        }
        Update: {
          id?: number
          key?: string
          value?: string | null
        }
        Relationships: []
      }
      times: {
        Row: {
          address: string | null
          costume: string | null
          created_at: string | null
          date: string
          endtime: string | null
          id: string
          ideaflight_id: string | null
          name: string
          script: string | null
          starttime: string | null
        }
        Insert: {
          address?: string | null
          costume?: string | null
          created_at?: string | null
          date: string
          endtime?: string | null
          id?: string
          ideaflight_id?: string | null
          name: string
          script?: string | null
          starttime?: string | null
        }
        Update: {
          address?: string | null
          costume?: string | null
          created_at?: string | null
          date?: string
          endtime?: string | null
          id?: string
          ideaflight_id?: string | null
          name?: string
          script?: string | null
          starttime?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "times_ideaflight_id_fkey"
            columns: ["ideaflight_id"]
            isOneToOne: false
            referencedRelation: "ideaflights"
            referencedColumns: ["id"]
          },
        ]
      }
      user_designs: {
        Row: {
          awareness_map: Json | null
          created_at: string | null
          delivery: Json | null
          id: string
          prompt: string | null
          texture_url: string | null
          user_id: string | null
        }
        Insert: {
          awareness_map?: Json | null
          created_at?: string | null
          delivery?: Json | null
          id?: string
          prompt?: string | null
          texture_url?: string | null
          user_id?: string | null
        }
        Update: {
          awareness_map?: Json | null
          created_at?: string | null
          delivery?: Json | null
          id?: string
          prompt?: string | null
          texture_url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string | null
          stripe_customer_id: string | null
          username: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          role?: string | null
          stripe_customer_id?: string | null
          username?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          stripe_customer_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      halo_stage:
        | "generated"
        | "onboarding"
        | "active_on"
        | "active_off"
        | "disconnected"
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
  public: {
    Enums: {
      halo_stage: [
        "generated",
        "onboarding",
        "active_on",
        "active_off",
        "disconnected",
      ],
    },
  },
} as const
