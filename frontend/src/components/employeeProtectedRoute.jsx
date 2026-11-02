import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const EmployeeProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  /* 1️⃣ Loading */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  /* 2️⃣ Not logged in */
  if (!user) {
    return (
      <Navigate
        to="/employeelogin"
        replace
        state={{ from: location }}
      />
    );
  }

  /* 3️⃣ Not an employee */
  if (user.portal !== "employee" && user.role !== "Employee") {
    return <Navigate to="/unauthorized" replace />;
  }

  /* 4️⃣ Allowed */
  return children;
};

export default EmployeeProtectedRoute;
