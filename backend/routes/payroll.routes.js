import express from "express";
import {
  getPayrollDetails,
  runPayroll,
  toggleEmployeeApproval,
  lockPayroll,
  getPayrollStatus
} from "../controller/payroll.controller.js";
import { authenticate } from "../middleware/auth.js";
import PayrollRun from "../models/PayrollRun.js";

const router = express.Router();
router.get('/history', async (req, res) => {
  try {
    // Fetch all payroll runs, sorted by newest first
    const history = await PayrollRun.find()
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payroll history", error: error.message });
  }
});
router.get("/details", authenticate, getPayrollDetails); // Fetch Dashboard
router.get("/payroll-status", authenticate, getPayrollStatus);        //payroll status
router.post("/run", authenticate, runPayroll);           // Calculate/Re-calc
router.post("/toggle-approval", authenticate, toggleEmployeeApproval); // Approve single
router.post("/lock", authenticate, lockPayroll);         // Finalize Approved

export default router;