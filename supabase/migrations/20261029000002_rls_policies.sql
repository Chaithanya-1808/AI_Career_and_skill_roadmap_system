-- ====================================================================
-- AI Career & Smart Roadmap System - Row Level Security (RLS)
-- Migration: 20261029000002_rls_policies.sql
-- ====================================================================

-- Enable RLS on all relevant tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_skill_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_integrity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: is_admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: is_mentor_of(student_id)
CREATE OR REPLACE FUNCTION auth.is_mentor_of(target_student_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM mentor_shares
    WHERE student_id = target_student_id
      AND (mentor_id = auth.uid() OR mentor_email = (SELECT email FROM profiles WHERE id = auth.uid()))
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles Policies
CREATE POLICY "Public profiles are viewable by self and admins"
    ON profiles FOR SELECT
    USING (auth.uid() = id OR auth.is_admin());

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- 2. User Roles Policies (Read-only for users, writable only by admin)
CREATE POLICY "Users can read their own role"
    ON user_roles FOR SELECT
    USING (auth.uid() = user_id OR auth.is_admin());

-- 3. Public catalogs (Careers, Skills, Requirements, Learning Resources, Projects)
CREATE POLICY "Catalog is publicly readable"
    ON career_profiles FOR SELECT
    USING (true);

CREATE POLICY "Skills are publicly readable"
    ON skills FOR SELECT
    USING (true);

CREATE POLICY "Career skill requirements are publicly readable"
    ON career_skill_requirements FOR SELECT
    USING (true);

CREATE POLICY "Resources are publicly readable"
    ON learning_resources FOR SELECT
    USING (true);

CREATE POLICY "Projects are publicly readable"
    ON projects FOR SELECT
    USING (true);

-- 4. Assessment Questions (Server reads correct answer, client cannot read correct_option_id directly via standard select if restricted, or via backend view)
CREATE POLICY "Assessment questions readable by authenticated users"
    ON assessment_questions FOR SELECT
    USING (auth.role() = 'authenticated');

-- 5. Assessment Attempts & Answers
CREATE POLICY "Students can read their own attempts"
    ON assessment_attempts FOR SELECT
    USING (auth.uid() = user_id OR auth.is_mentor_of(user_id) OR auth.is_admin());

CREATE POLICY "Students can insert their own attempts"
    ON assessment_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update their own in_progress attempts"
    ON assessment_attempts FOR UPDATE
    USING (auth.uid() = user_id AND status = 'in_progress');

CREATE POLICY "Students can read their own answers"
    ON assessment_answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM assessment_attempts a
            WHERE a.id = attempt_id AND a.user_id = auth.uid()
        )
    );

CREATE POLICY "Students can insert answers to their active attempts"
    ON assessment_answers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM assessment_attempts a
            WHERE a.id = attempt_id AND a.user_id = auth.uid() AND a.status = 'in_progress'
        )
    );

-- 6. Skill Assessments
CREATE POLICY "Students manage their skill assessments"
    ON skill_assessments FOR SELECT
    USING (auth.uid() = user_id OR auth.is_mentor_of(user_id) OR auth.is_admin());

CREATE POLICY "Students insert/update their skill assessments"
    ON skill_assessments FOR ALL
    USING (auth.uid() = user_id);

-- 7. Roadmaps & Roadmap Tasks
CREATE POLICY "Students can read their roadmaps"
    ON roadmaps FOR SELECT
    USING (auth.uid() = user_id OR auth.is_mentor_of(user_id) OR auth.is_admin());

CREATE POLICY "Students can manage their own roadmaps"
    ON roadmaps FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Students can read their roadmap tasks"
    ON roadmap_tasks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM roadmaps r
            WHERE r.id = roadmap_id AND (r.user_id = auth.uid() OR auth.is_mentor_of(r.user_id) OR auth.is_admin())
        )
    );

CREATE POLICY "Students can update their roadmap tasks"
    ON roadmap_tasks FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM roadmaps r
            WHERE r.id = roadmap_id AND r.user_id = auth.uid()
        )
    );

-- 8. Project Submissions
CREATE POLICY "Students view their submissions and mentors review"
    ON project_submissions FOR SELECT
    USING (auth.uid() = user_id OR auth.is_mentor_of(user_id) OR auth.is_admin());

CREATE POLICY "Students can submit projects"
    ON project_submissions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Mentors or admins can update review status"
    ON project_submissions FOR UPDATE
    USING (auth.is_mentor_of(user_id) OR auth.is_admin());

-- 9. Assessment Integrity Events
CREATE POLICY "Students insert their integrity logs"
    ON assessment_integrity_events FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM assessment_attempts a
            WHERE a.id = attempt_id AND a.user_id = auth.uid()
        )
    );

CREATE POLICY "Integrity events viewable by admin and mentors"
    ON assessment_integrity_events FOR SELECT
    USING (
        auth.is_admin() OR EXISTS (
            SELECT 1 FROM assessment_attempts a
            WHERE a.id = attempt_id AND (a.user_id = auth.uid() OR auth.is_mentor_of(a.user_id))
        )
    );

-- 10. Certificates (Public verification allowed by certificate_id!)
CREATE POLICY "Certificates are publicly verifiable"
    ON certificates FOR SELECT
    USING (true);

-- 11. Mentor Shares
CREATE POLICY "Students manage their mentor shares"
    ON mentor_shares FOR ALL
    USING (auth.uid() = student_id OR mentor_email = (SELECT email FROM profiles WHERE id = auth.uid()) OR auth.is_admin());

-- 12. Audit Logs (Admin only)
CREATE POLICY "Admin view audit logs"
    ON audit_logs FOR SELECT
    USING (auth.is_admin());
