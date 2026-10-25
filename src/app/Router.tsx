import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { ProtectedRoute } from './RouteGuards';

// Public Pages
import { LandingPage } from '../features/auth/LandingPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { VerifyEmailPage } from '../features/auth/VerifyEmailPage';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage';
import { Forbidden403Page } from '../features/auth/Forbidden403Page';
import { NotFound404Page } from '../features/auth/NotFound404Page';

// Citizen Pages
import { CitizenDashboard } from '../features/citizen/CitizenDashboard';
import { CitizenComplaintList } from '../features/citizen/CitizenComplaintList';
import { ComplaintSubmitForm } from '../features/citizen/ComplaintSubmitForm';
import { CitizenComplaintDetail } from '../features/citizen/CitizenComplaintDetail';

// Officer Pages
import { OfficerDashboard } from '../features/officer/OfficerDashboard';
import { OfficerComplaintList } from '../features/officer/OfficerComplaintList';
import { OfficerInvestigationDetail } from '../features/officer/OfficerInvestigationDetail';

// Admin Pages
import { AdminOverview } from '../features/admin/AdminOverview';
import { AdminComplaintList } from '../features/admin/AdminComplaintList';
import { UnassignedQueue } from '../features/admin/UnassignedQueue';
import { AdminComplaintDetail } from '../features/admin/AdminComplaintDetail';
import { ResolutionReviews } from '../features/admin/ResolutionReviews';
import { ResolutionReviewDetail } from '../features/admin/ResolutionReviewDetail';
import { UsersList } from '../features/admin/UsersList';
import { OfficersList } from '../features/admin/OfficersList';
import { DepartmentsManagement } from '../features/admin/DepartmentsManagement';
import { ZonesManagement } from '../features/admin/ZonesManagement';
import { MappingsManagement } from '../features/admin/MappingsManagement';
import { AdminAnalytics } from '../features/analytics/AdminAnalytics';
import { AdminAuditLog } from '../features/admin/AdminAuditLog';
import { AdminSettings } from '../features/admin/AdminSettings';

// Shared Authenticated Pages
import { NotificationsPage } from '../features/notifications/NotificationsPage';
import { UserProfilePage } from '../features/profile/UserProfilePage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - The Login Page is the Homepage per Phase 3 */}
        <Route path={ROUTES.HOME} element={<LoginPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
        <Route path={ROUTES.FORBIDDEN} element={<Forbidden403Page />} />

        {/* Citizen Routes */}
        <Route
          path={ROUTES.CITIZEN_DASHBOARD}
          element={
            <ProtectedRoute allowedRoles={['CITIZEN']}>
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CITIZEN_COMPLAINTS}
          element={
            <ProtectedRoute allowedRoles={['CITIZEN']}>
              <CitizenComplaintList />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CITIZEN_NEW_COMPLAINT}
          element={
            <ProtectedRoute allowedRoles={['CITIZEN']}>
              <ComplaintSubmitForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/complaints/:id"
          element={
            <ProtectedRoute allowedRoles={['CITIZEN']}>
              <CitizenComplaintDetail />
            </ProtectedRoute>
          }
        />

        {/* Officer Routes */}
        <Route
          path={ROUTES.OFFICER_DASHBOARD}
          element={
            <ProtectedRoute allowedRoles={['OFFICER']}>
              <OfficerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.OFFICER_COMPLAINTS}
          element={
            <ProtectedRoute allowedRoles={['OFFICER']}>
              <OfficerComplaintList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/complaints/:id"
          element={
            <ProtectedRoute allowedRoles={['OFFICER']}>
              <OfficerInvestigationDetail />
            </ProtectedRoute>
          }
        />

        {/* Administrator Routes */}
        <Route
          path={ROUTES.ADMIN_DASHBOARD}
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminOverview />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_COMPLAINTS}
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminComplaintList />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_UNASSIGNED}
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UnassignedQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/complaints/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminComplaintDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_REVIEWS}
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ResolutionReviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reviews/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ResolutionReviewDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_USERS}
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UsersList />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_OFFICERS}
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <OfficersList />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_DEPARTMENTS}
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DepartmentsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_ZONES}
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ZonesManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_MAPPINGS}
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <MappingsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_ANALYTICS}
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_AUDIT}
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminAuditLog />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_SETTINGS}
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminSettings />
            </ProtectedRoute>
          }
        />

        {/* Shared Authenticated Routes */}
        <Route
          path={ROUTES.NOTIFICATIONS}
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PROFILE}
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound404Page />} />
      </Routes>
    </BrowserRouter>
  );
}
