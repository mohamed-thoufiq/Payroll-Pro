import express from "express";
import mongoose from "mongoose";
import { authenticate, authorize } from "../middleware/auth.js";
import PayrollRun from "../models/PayrollRun.js";
import PayrollEmployee from "../models/PayrollEmployee.js";
import User from "../models/Usermodel.js";

const router = express.Router();

const ROLES = ["Super Admin", "HR Admin", "Payroll Admin", "Finance"];

router.get(
  "/dashboardsummary",
  authenticate,
  authorize(...ROLES),
  async (req, res) => {
    try {
      const orgId = new mongoose.Types.ObjectId(req.user.organizationId);

      // ===============================
      // 1. LATEST PAYROLL RUN
      // ===============================
      const latestRun = await PayrollRun.findOne({ organizationId: orgId })
        .sort({ createdAt: -1 })
        .lean();

      let overview = {
        totalEmployees: 0,
        gross: 0,
        deductions: 0,
        netPay: 0,
        avgSalary: 0,
        status: "NOT_STARTED"
      };

      if (latestRun) {
        overview = {
          totalEmployees: latestRun.totals?.totalEmployees || 0,
          gross: Math.round(latestRun.totals?.gross || 0),
          deductions: Math.round(latestRun.totals?.deductions || 0),
          netPay: Math.round(latestRun.totals?.netPay || 0),
          avgSalary:
            latestRun.totals?.totalEmployees > 0
              ? Math.round(
                  latestRun.totals.netPay /
                    latestRun.totals.totalEmployees
                )
              : 0,
          status: latestRun.status
        };
      }

      // ===============================
      // 2. PAYROLL TREND (LAST 6 RUNS)
      // ===============================
      const payrollTrend = await PayrollRun.aggregate([
        { $match: { organizationId: orgId } },
        { $sort: { month: -1 } },
        { $limit: 6 },
        {
          $project: {
            _id: 0,
            month: 1,
            netPay: "$totals.netPay"
          }
        },
        { $sort: { month: 1 } }
      ]);

      // ===============================
      // 3. DEPARTMENT DISTRIBUTION
      // ===============================
      let departmentStats = [];

      if (latestRun) {
        departmentStats = await PayrollEmployee.aggregate([
          {
            $match: {
              payrollRunId: latestRun._id
            }
          },
          {
            $group: {
              _id: "$employeeSnapshot.department",
              count: { $sum: 1 }
            }
          },
          {
            $project: {
              _id: 0,
              name: { $ifNull: ["$_id", "Unassigned"] },
              value: "$count"
            }
          }
        ]);
      }

      // ===============================
      // 4. ACTIVE EMPLOYEE COUNT (ORG)
      // ===============================
      const activeEmployees = await User.countDocuments({
        organizationId: orgId,
        status: "Active",
        role: "Employee"
      });

      // ===============================
      // 5. RESPONSE
      // ===============================
      res.json({
        overview,
        payrollTrend: payrollTrend.map((p) => ({
          month: p.month,
          payroll: Math.round(p.netPay || 0)
        })),
        departmentStats,
        meta: {
          activeEmployees,
          payrollRunExists: Boolean(latestRun)
        }
      });
    } catch (err) {
      console.error("Payroll dashboard error:", err);
      res.status(500).json({
        message: "Failed to load payroll dashboard",
        error: err.message
      });
    }
  }
);

export default router;
