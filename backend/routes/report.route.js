import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  salaryRegister,
  statutoryReport,
  departmentCost,
  professionalTaxReport,
  bankAdvice,
  auditLogs,
  downloadReport
} from "../controller/report.controller.js";

const router = express.Router();
const reportRoles = ["Super Admin", "Finance", "Payroll Admin", "HR Admin"];

router.get("/salary-register", authenticate, authorize(...reportRoles), salaryRegister);
router.get("/statutory", authenticate, authorize(...reportRoles), statutoryReport);
router.get("/department-cost", authenticate, authorize(...reportRoles), departmentCost);
router.get("/professional-tax", authenticate, authorize(...reportRoles), professionalTaxReport);
router.get("/bank-advice", authenticate, authorize(...reportRoles), bankAdvice);
router.get("/audit-logs", authenticate, authorize(...reportRoles), auditLogs);
router.get("/download", authenticate, authorize(...reportRoles), downloadReport);

export default router;
