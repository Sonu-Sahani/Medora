import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/public/LandingPage.jsx";
import LoginPage from "../pages/public/LoginPage.jsx";
import RegisterPage from "../pages/public/RegisterPage.jsx";
import NotFoundPage from "../pages/public/NotFoundPage.jsx";
import VerifyEmailPage from "../pages/public/VerifyEmailPage.jsx";
import ForgotPasswordPage from "../pages/public/ForgotPasswordPage.jsx";

import PatientDashboard from "../pages/patient/PatientDashboard.jsx";
import SpecialtiesPage from "../pages/patient/SpecialtiesPage.jsx";
import DoctorsListPage from "../pages/patient/DoctorsListPage.jsx";
import DoctorDetailsPage from "../pages/patient/DoctorDetailsPage.jsx";
import BookingPage from "../pages/patient/BookingPage.jsx";
import MyAppointmentsPage from "../pages/patient/MyAppointmentsPage.jsx";
import ProfilePage from "../pages/patient/ProfilePage.jsx";
import MyReportsPage from "../pages/patient/MyReportsPage.jsx";

import DoctorDashboard from "../pages/doctor/DoctorDashboard.jsx";
import DoctorAppointmentsPage from "../pages/doctor/DoctorAppointmentsPage.jsx";
import DoctorProfileSettings from "../pages/doctor/DoctorProfileSettings.jsx";
import CreateReportPage from "../pages/doctor/CreateReportPage.jsx";
import TemplateManagerPage from "../pages/doctor/TemplateManagerPage.jsx";

import AdminDashboard from "../pages/admin/AdminDashboard.jsx";

import ProtectedRoute from "./ProtectedRoute.jsx";
import RoleBasedRoute from "./RoleBasedRoute.jsx";

import ManageDoctorsPage from "../pages/admin/ManageDoctorsPage.jsx";
import ManagePatientsPage from "../pages/admin/ManagePatientsPage.jsx";
import ManageAppointmentsPage from "../pages/admin/ManageAppointmentsPage.jsx";

const PatientRoute = ({ children }) => (
  <ProtectedRoute>
    <RoleBasedRoute allowedRoles={["patient"]}>{children}</RoleBasedRoute>
  </ProtectedRoute>
);

const DoctorRoute = ({ children }) => (
  <ProtectedRoute>
    <RoleBasedRoute allowedRoles={["doctor"]}>{children}</RoleBasedRoute>
  </ProtectedRoute>
);

const AdminRoute = ({ children }) => (
  <ProtectedRoute>
    <RoleBasedRoute allowedRoles={["admin"]}>{children}</RoleBasedRoute>
  </ProtectedRoute>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Patient Routes */}
      <Route path="/patient/dashboard" element={<PatientRoute><PatientDashboard /></PatientRoute>} />
      <Route path="/patient/specialties" element={<PatientRoute><SpecialtiesPage /></PatientRoute>} />
      <Route path="/patient/doctors" element={<PatientRoute><DoctorsListPage /></PatientRoute>} />
      <Route path="/patient/doctors/:id" element={<PatientRoute><DoctorDetailsPage /></PatientRoute>} />
      <Route path="/patient/book/:doctorId" element={<PatientRoute><BookingPage /></PatientRoute>} />
      <Route path="/patient/appointments" element={<PatientRoute><MyAppointmentsPage /></PatientRoute>} />
      <Route path="/patient/reports" element={<PatientRoute><MyReportsPage /></PatientRoute>} />
      <Route path="/patient/profile" element={<PatientRoute><ProfilePage /></PatientRoute>} />

      {/* Doctor Routes */}
      <Route path="/doctor/dashboard" element={<DoctorRoute><DoctorDashboard /></DoctorRoute>} />
      <Route path="/doctor/appointments" element={<DoctorRoute><DoctorAppointmentsPage /></DoctorRoute>} />
      <Route path="/doctor/profile" element={<DoctorRoute><DoctorProfileSettings /></DoctorRoute>} />
      <Route path="/doctor/reports/create" element={<DoctorRoute><CreateReportPage /></DoctorRoute>} />
      <Route path="/doctor/templates" element={<DoctorRoute><TemplateManagerPage /></DoctorRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

      <Route path="/admin/doctors" element={<AdminRoute><ManageDoctorsPage /></AdminRoute>} />
<Route path="/admin/patients" element={<AdminRoute><ManagePatientsPage /></AdminRoute>} />
<Route path="/admin/appointments" element={<AdminRoute><ManageAppointmentsPage /></AdminRoute>} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;