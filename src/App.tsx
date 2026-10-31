import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { RequireProfile } from '@/components/layout/AppLayout';
import { Toaster } from '@/components/ui/Toaster';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { LandingPage } from '@/pages/LandingPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const SubjectsPage = lazy(() => import('@/pages/SubjectsPage'));
const SubjectDetailPage = lazy(() => import('@/pages/SubjectDetailPage'));
const AssessmentOverviewPage = lazy(() => import('@/pages/AssessmentOverviewPage'));
const TakeAssessmentPage = lazy(() => import('@/pages/TakeAssessmentPage'));
const PerformancePage = lazy(() => import('@/pages/PerformancePage'));
const RecommendationsPage = lazy(() => import('@/pages/RecommendationsPage'));
const LearningPathPage = lazy(() => import('@/pages/LearningPathPage'));
const ResourcesPage = lazy(() => import('@/pages/ResourcesPage'));
const SchedulePage = lazy(() => import('@/pages/SchedulePage'));
const ProgressPage = lazy(() => import('@/pages/ProgressPage'));
const ExperimentsPage = lazy(() => import('@/pages/ExperimentsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading page">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700" />
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<RequireProfile />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/subjects/:id" element={<SubjectDetailPage />} />
            <Route path="/assessment" element={<AssessmentOverviewPage />} />
            <Route path="/assessment/:id" element={<TakeAssessmentPage />} />
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/learning-path" element={<LearningPathPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/experiments" element={<ExperimentsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Toaster />
    </ErrorBoundary>
  );
}
