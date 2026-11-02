import express from "express";
import {
  getPayrollDetails,
  runPayroll,
  toggleEmployeeApproval,
  lockPayroll,
  getPayrollStatus
} from "../controller/payroll.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import PayrollRun from "../models/PayrollRun.js";

const router = express.Router();

router.get(
  '/history',
  authenticate,
  authorize("Super Admin", "HR Admin", "Payroll Admin", "Finance"),
  async (req, res) => {
    try {
      const history = await PayrollRun.find({ organizationId: req.user.organizationId })
        .sort({ createdAt: -1 })
        .lean();

      res.status(200).json(history);
    } catch (error) {
      res.status(500).json({ message: "Error fetching payroll history", error: error.message });
    }
  }
);

router.get("/details", authenticate, authorize("Super Admin", "HR Admin", "Payroll Admin", "Finance"), getPayrollDetails);
router.get("/payroll-status", authenticate, authorize("Super Admin", "HR Admin", "Payroll Admin", "Finance"), getPayrollStatus);
router.post("/run", authenticate, authorize("Super Admin", "Payroll Admin"), runPayroll);
router.post("/toggle-approval", authenticate, authorize("Super Admin", "Payroll Admin", "HR Admin"), toggleEmployeeApproval);
router.post("/lock", authenticate, authorize("Super Admin", "Payroll Admin", "Finance"), lockPayroll);

export default router;