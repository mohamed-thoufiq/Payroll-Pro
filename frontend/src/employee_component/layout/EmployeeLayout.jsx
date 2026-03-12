import { useSearchParams } from "react-router-dom";
import EmpSidebar from "../components/EmpSidebar";
import Header from "../components/Header";
import { useState } from "react";
// Pages
import Dashboard from "../pages/employee/Dashboard";
import Payslips from "../pages/employee/Payslips";
import SalaryStructure from "../pages/employee/SalaryStructure"; 
import Notifications from "../../pages/notificationPage";
import Profile from "../pages/employee/Profile"; 
import EmployeeReimbursementForm from "../pages/employee/reimbursementFormPage";
import MyReimbursements from "../pages/employee/myreimburese";
import AttendanceRequest from "../pages/employee/EmployeeAttendanceRequest";


export default function EmployeeLayout() {
  const [searchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile state
  const section = searchParams.get("section") || "dashboard";

  const renderPage = () => {
    switch (section) {
      case "payslips": return <Payslips />;
      case "salary": return <SalaryStructure />; 
      case "notifications": return <Notifications />;
      case "profile": return <Profile />;
      case "reimbursement": return <EmployeeReimbursementForm />;
      case "myreimbursement": return <MyReimbursements />;
      case "attendence": return <AttendanceRequest />;
      default: return <Dashboard />;
    }
  };

  const titleMap = {
    dashboard: "Dashboard",
    payslips: "My Payslips",
    salary: "Salary Structure",
    reimbursement: "Reimbursement",
    myreimbursement: "Myreimbursement",
    notifications: "Notifications",
    profile: "Profile",
    attendence: "Leave Request",
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* 1. SIDEBAR: Now receives state props */}
      <EmpSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* 2. MAIN CONTENT AREA */}
      {/* lg:ml-64 ensures desktop view has space, while mobile is full-width */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-300">
        <Header 
          title={titleMap[section]} 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}