import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';

import { LandingPage } from './pages/LandingPage';
import { OverviewPage } from './pages/OverviewPage';
import { CareerExplorerPage } from './pages/CareerExplorerPage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { SkillGapPage } from './pages/SkillGapPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { PlannerPage } from './pages/PlannerPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { CertificatesPage } from './pages/CertificatesPage';
import { VerifyCertificatePage } from './pages/VerifyCertificatePage';
import { IntegrityPage } from './pages/IntegrityPage';
import { ProfilePage } from './pages/ProfilePage';
import { MentorPage } from './pages/MentorPage';
import { AdminPage } from './pages/AdminPage';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-xs">
        Loading session...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const RoleRoute: React.FC<{ children: React.ReactElement; allowedRoles: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  const hasRole = user.roles.some((r) => allowedRoles.includes(r));
  if (!hasRole) return <Navigate to="/overview" replace />;
  return children;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Auth */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Certificate Verification */}
          <Route path="/verify-certificate" element={<VerifyCertificatePage />} />
          <Route path="/verify-certificate/:certificateId" element={<VerifyCertificatePage />} />

          {/* Protected Dashboard Routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/careers" element={<CareerExplorerPage />} />
            <Route path="/assessments" element={<AssessmentsPage />} />
            <Route path="/skill-gap" element={<SkillGapPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/certificates" element={<CertificatesPage />} />
            <Route path="/integrity" element={<IntegrityPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Role-specific Routes */}
            <Route
              path="/mentor"
              element={
                <RoleRoute allowedRoles={['mentor', 'admin']}>
                  <MentorPage />
                </RoleRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <AdminPage />
                </RoleRoute>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
