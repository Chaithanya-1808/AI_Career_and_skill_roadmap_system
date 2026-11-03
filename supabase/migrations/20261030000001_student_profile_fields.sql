-- ====================================================================
-- AI Career & Smart Roadmap System - Supabase PostgreSQL Schema
-- Migration: 20261030000001_student_profile_fields.sql
-- Module 2: Student Academic Profile Management Fields
-- ====================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS education_level TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS degree TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS academic_year TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS graduation_year TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS technical_skills JSONB DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS study_hours_per_day INTEGER DEFAULT 2;

