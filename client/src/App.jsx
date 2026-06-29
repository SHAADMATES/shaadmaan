import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import VerifyCertificate from './pages/VerifyCertificate';
import ChangePassword from './pages/ChangePassword';

// Super Admin Pages
import SuperDashboard from './pages/superadmin/Dashboard';
import ManageUsers from './pages/superadmin/ManageUsers';
import Backups from './pages/superadmin/Backups';
import AuditLogs from './pages/superadmin/AuditLogs';
import SuperBulkUpload from './pages/superadmin/BulkUpload';

// Treasurer Pages
import TreasurerDashboard from './pages/treasurer/Dashboard';
import Transactions from './pages/treasurer/Transactions';
import FinanceReports from './pages/treasurer/FinanceReports';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageStudents from './pages/admin/ManageStudents';
import Wings from './pages/admin/Wings';
import AllUsers from './pages/admin/AllUsers';
import FormsManagement from './pages/admin/FormsManagement';
import ManageOutreach from './pages/admin/ManageOutreach';
import ManagePrograms from './pages/admin/ManagePrograms';
import AdminSchedule from './pages/admin/Schedule';
import AddResults from './pages/admin/AddResults';
import Reports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';
import ManageCertificates from './pages/admin/ManageCertificates';

// Wing Manager Pages (Wing Chairman)
import ManagerDashboard from './pages/manager/Dashboard';
import AddProgram from './pages/manager/AddProgram';
import MyPrograms from './pages/manager/MyPrograms';
import RegisteredStudents from './pages/manager/RegisteredStudents';
import ManagerSchedule from './pages/manager/Schedule';
import ManagerResults from './pages/manager/Results';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import AvailablePrograms from './pages/student/AvailablePrograms';
import MyRegistrations from './pages/student/MyRegistrations';
import StudentSchedule from './pages/student/Schedule';
import StudentResults from './pages/student/MyResults';
import StudentProfile from './pages/student/Profile';
import StudentCertificates from './pages/student/Certificates';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-certificate" element={<VerifyCertificate />} />

          {/* Super Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
            <Route element={<Layout />}>
              <Route path="/super/dashboard" element={<SuperDashboard />} />
              <Route path="/super/users" element={<ManageUsers />} />
              <Route path="/super/backups" element={<Backups />} />
              <Route path="/super/audit-logs" element={<AuditLogs />} />
              <Route path="/super/bulk-upload" element={<SuperBulkUpload />} />
            </Route>
          </Route>

          {/* Treasurer Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['treasurer']} />}>
            <Route element={<Layout />}>
              <Route path="/treasurer/dashboard" element={<TreasurerDashboard />} />
              <Route path="/treasurer/transactions" element={<Transactions />} />
              <Route path="/treasurer/reports" element={<FinanceReports />} />
            </Route>
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<Layout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<ManageStudents />} />
              <Route path="/admin/wings" element={<Wings />} />
              <Route path="/admin/users" element={<AllUsers />} />
              <Route path="/admin/forms" element={<FormsManagement />} />
              <Route path="/admin/outreach" element={<ManageOutreach />} />
              <Route path="/admin/programs" element={<ManagePrograms />} />
              <Route path="/admin/schedule" element={<AdminSchedule />} />
              <Route path="/admin/results" element={<AddResults />} />
              <Route path="/admin/certificates" element={<ManageCertificates />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>
          </Route>

          {/* Wing Chairman Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['wing_chairman']} />}>
            <Route element={<Layout />}>
              <Route path="/chairman/dashboard" element={<ManagerDashboard />} />
              <Route path="/chairman/add-program" element={<AddProgram />} />
              <Route path="/chairman/programs" element={<MyPrograms />} />
              <Route path="/chairman/students" element={<RegisteredStudents />} />
              <Route path="/chairman/schedule" element={<ManagerSchedule />} />
              <Route path="/chairman/results" element={<ManagerResults />} />
            </Route>
          </Route>

          {/* Redirect old manager links to chairman */}
          <Route path="/manager/*" element={<Navigate to="/chairman/dashboard" replace />} />

          {/* Student Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route element={<Layout />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/available-programs" element={<AvailablePrograms />} />
              <Route path="/student/my-registrations" element={<MyRegistrations />} />
              <Route path="/student/schedule" element={<StudentSchedule />} />
              <Route path="/student/my-results" element={<StudentResults />} />
              <Route path="/student/certificates" element={<StudentCertificates />} />
              <Route path="/student/profile" element={<StudentProfile />} />
            </Route>
          </Route>

          {/* Shared: Change Password — accessible to all logged-in roles */}
          <Route element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'wing_chairman', 'treasurer', 'student']} />}>
            <Route element={<Layout />}>
              <Route path="/account/change-password" element={<ChangePassword />} />
            </Route>
          </Route>

          {/* Redirect all unmatched routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
