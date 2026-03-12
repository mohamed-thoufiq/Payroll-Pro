import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getMyPayslips,
  getPayslipById
} from "../controller/payslip.controller.js";

const router = express.Router();

// Employee: list payslips
router.get("/my-payslips", authenticate, getMyPayslips);

// Employee: view single payslip
router.get("/:id", authenticate, getPayslipById);

export default router;
