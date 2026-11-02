import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import EmployeeProtectedRoute from "./components/employeeProtectedRoute";


import Register from "./pages/Register";
import Login from "./pages/Login";
import EmployeeLogin from "./pages/employeelogin";


import Onboarding from "./pages/Onboarding";
import Unauthorized from "./pages/Unauthorized";


import SuperAdminLayout from "./super_admin_component/layout/SuperAdminLayout"; 
import EmployeeLayout from "./employee_component/layout/EmployeeLayout"; 
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/employeelogin" element={<EmployeeLogin />} />
          <Route path="/employeeLogin" element={<Navigate to="/employeelogin" replace />} />
          <Route path="/payroll/employee" element={<Navigate to="/employee" replace />} />
          
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Super Admin Onboarding */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute allowedRoles={["Super Admin"]}>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          {/* Employee Dashboard */}
          <Route
            path="/employee/*"
            element={
              <EmployeeProtectedRoute>
                <EmployeeLayout />
              </EmployeeProtectedRoute>
            }
          />

          {/* Super Admin Portal */}
          <Route
            path="/payroll/:role"
            element={
              <ProtectedRoute allowedRoles={["Super Admin","HR Admin","Payroll Admin","Finance"]}>
                <SuperAdminLayout />
              </ProtectedRoute>
            }
          />

           
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
