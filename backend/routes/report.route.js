import express from "express";
import { authenticate } from "../middleware/auth.js";
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

router.get("/salary-register", authenticate, salaryRegister);
router.get("/statutory", authenticate, statutoryReport);
router.get("/department-cost", authenticate, departmentCost);
router.get("/professional-tax", authenticate, professionalTaxReport);
router.get("/bank-advice", authenticate, bankAdvice);
router.get("/audit-logs", authenticate, auditLogs);
router.get("/download", authenticate, downloadReport);

export default router;
