import PayrollRun from "../models/PayrollRun.js";
import PayrollEmployee from "../models/PayrollEmployee.js";
import Payslip from "../models/Payslip.js";
import User from "../models/Usermodel.js"; 
import Organization from "../models/Organization.js";
import { calculatePayroll } from "../utils/payrollCalculator.js";
import Reimbursement from "../models/Reimbursement.js";
import Attendance from '../models/LeaveRequest.js'
import { sendNotification } from "../utils/createNotification.js";

/**
 * 1. INITIATE / RE-CALCULATE PAYROLL
 * - Idempotent: Can be run multiple times. Updates existing drafts.
 * - Skips employees who are already "COMPLETED" (Paid).
 */
export const runPayroll = async (req, res) => {
  try {
    const { month } = req.body; // e.g., "2026-04"
    const orgId = req.user.organizationId;

    // Determine total days in the month (e.g., April has 30)
    const [year, monthNum] = month.split("-").map(Number);
    const daysInMonth = new Date(year, monthNum, 0).getDate();

    const org = await Organization.findById(orgId);
    if (!org) return res.status(404).json({ message: "Org not found" });

    let payrollRun = await PayrollRun.findOne({ organizationId: orgId, month });
    if (payrollRun?.status === "LOCKED") {
      return res.status(400).json({ message: "Payroll is locked for this month." });
    }

    if (!payrollRun) {
      payrollRun = await PayrollRun.create({
        organizationId: orgId,
        month,
        createdBy: req.user._id
      });
    }

    const employees = await User.find({
      organizationId: orgId,
      status: "Active",
      role: { $ne: "Super Admin" }
    });

    let totals = { gross: 0, deductions: 0, netPay: 0, count: 0 };

    for (const emp of employees) {
      if (!emp.employeeDetails?.salary?.ctc) continue; 
      
      const empInternalId = emp.employeeDetails?.basic?.employeeId;

      // 1. FETCH APPROVED LEAVES (LOP DAYS)
      // Searching your attendance collection where date matches the month string
      const approvedLeaves = await Attendance.find({
        organizationId: orgId,
        employeeId: empInternalId,
        status: "APPROVED",
        date: { $regex: `^${month}` } // Matches dates starting with "2026-04"
      });

      const lopDays = approvedLeaves.length;

      // 2. FETCH REIMBURSEMENTS
      const reimbursements = await Reimbursement.find({
        organizationId: orgId,
        employeeId: empInternalId,
        status: "APPROVED",
        payrollRunId: { $in: [null, payrollRun._id] }
      });
      const reimbursementTotal = reimbursements.reduce((sum, r) => sum + r.amount, 0);

      // 3. CALCULATE PAYROLL
      const calc = calculatePayroll(emp, org, lopDays, daysInMonth); 

      const payload = {
        payrollRunId: payrollRun._id,
        organizationId: orgId,
        employeeId: empInternalId, 
        month: month,
        employeeSnapshot: {
          name: emp.name,
          employeeId: empInternalId,
          role: emp.role,
          department: emp.employeeDetails?.basic?.department || "General",
          location: emp.employeeDetails?.personal?.state || "NA",
          bankName: emp.employeeDetails?.payment?.details?.bankName || "",
          accountNumber: emp.employeeDetails?.payment?.details?.accountNumber || "",
          ifsc: emp.employeeDetails?.payment?.details?.ifsc || ""
        },
        earnings: calc.earnings,
        deductions: calc.deductions,
        statutorySnapshot: {
          employerPF: calc.employerContributions.pf,
          employerESI: calc.employerContributions.esi,
          employeePF: calc.deductions.pf,
          employeeESI: calc.deductions.esi,
          professionalTax: calc.deductions.pt
        },
        reimbursements: {
          total: reimbursementTotal,
          items: reimbursements.map(r => ({ category: r.category, amount: r.amount }))
        },
        netPay: calc.netPay + reimbursementTotal,
        status: "DRAFT",
        lopDays:calc.lopDays
      };

      await PayrollEmployee.findOneAndUpdate(
        { payrollRunId: payrollRun._id, employeeId: empInternalId },
        payload,
        { upsert: true }
      );
      
      totals.gross += calc.earnings.gross;
      totals.deductions += calc.deductions.total;   
      totals.netPay += (calc.netPay + reimbursementTotal);
      totals.count++;
    }

    payrollRun.totals = {
      totalEmployees: totals.count,
      gross: totals.gross,
      deductions: totals.deductions,
      netPay: totals.netPay
    };
    payrollRun.status = "DRAFT";
    await payrollRun.save();
    const admins = await User.find({
      organizationId: orgId,
      role: { $in: ["HR Admin", "Payroll Admin", "Finance","Super Admin"] }
    });  
    
    for (const admin of admins) {
      await sendNotification(
        admin._id,
        orgId,
        "Payroll Calculated",
        `Payroll for ${month} has been calculated for ${totals.count} employees.`,
        "PAYROLL_CALCULATED",
        "/payroll"
      );
    }

    res.json({ success: true, payrollRun });

  } catch (err) {
    console.error("RUN PAYROLL ERROR:", err);
    res.status(500).json({ message: "Payroll calculation failed" });
  }
};

/**
 * 2. GET DASHBOARD DETAILS
 */
export const getPayrollDetails = async (req, res) => {
  const { month } = req.query;
  const orgId = req.user.organizationId;

  const payrollRun = await PayrollRun.findOne({ organizationId: orgId, month });
  
  if (!payrollRun) return res.json({ status: "NOT_STARTED", employees: [] });

  const employees = await PayrollEmployee.find({ payrollRunId: payrollRun._id });

  res.json({ 
    run: payrollRun, 
    employees 
  });
};

/**
 * 3. TOGGLE APPROVAL (Draft <-> Approved)
 */
export const toggleEmployeeApproval = async (req, res) => {
  const { payrollEmployeeId, status } = req.body; // status: 'APPROVED' or 'DRAFT'
  await PayrollEmployee.findByIdAndUpdate(payrollEmployeeId, { status });
  res.json({ success: true });
};

/**
 * 4. LOCK & PROCESS PAYSLIPS
 */
export const lockPayroll = async (req, res) => {
  try {
    const { payrollRunId } = req.body;
    const orgId = req.user.organizationId;

    // 1. Fetch the Run
    const payroll = await PayrollRun.findById(payrollRunId);
    if (!payroll) return res.status(404).json({ message: "Payroll run not found" });
    if (payroll.status === "LOCKED") return res.status(400).json({ message: "Payroll already locked" });

    // 2. Identify ONLY Approved Employees
    const approvedEmployees = await PayrollEmployee.find({
      payrollRunId,
      status: "APPROVED"
    });

    if (approvedEmployees.length === 0) {
      return res.status(400).json({ message: "No approved employees found to process" });
    }
    
    // 3. Atomic Processing Loop
    for (const emp of approvedEmployees) { 
      
      await Payslip.create({
        payrollEmployeeId: emp._id,
        employeeId: emp.employeeId,
        organizationId: emp.organizationId,
        month: payroll.month,
        reimbursements: emp.reimbursements,
        payslipNumber: `PAY/${payroll.month.replace("-", "")}/${emp.employeeSnapshot.employeeId}`,
        employeeSnapshot: emp.employeeSnapshot,
        earnings: emp.earnings,
        deductions: emp.deductions,
        employerContributions: emp.statutorySnapshot,
        gross: emp.earnings.gross,
        netPay: emp.netPay,
        lopDays:emp.lopDays,
        generatedAt: new Date()
      });

      // Update Reimbursement Status to PAID (Crucial Step)
      // This prevents approved claims from being pulled into future payroll runs
      await Reimbursement.updateMany(
        { payrollRunId: payroll._id, employeeId: emp.employeeId },
        { status: "PAID" } 
      );

      // Mark employee record as COMPLETED
      emp.status = "COMPLETED";
      await emp.save();
      await sendNotification(
        emp._id,               
        emp.organizationId,
        "Payroll Locked",
        `Hey ${emp.employeeSnapshot?.name} Your payroll for ${payroll.month} has been locked.\nPayslip is now available.`,
        "PAYROLL_LOCKED",
        "/payslips"
      );
    }
    const admins = await User.find({
      organizationId: orgId,
      role: { $in: ["HR Admin", "Payroll Admin", "Finance",] }
    });  
    
    for (const admin of admins) {
       await sendNotification(
        admin._id,               
        orgId,
        "Payroll Locked",
        `Hey ${admin.name} Your payroll for ${payroll.month} has been locked.\nPayslip is now available.`,
        "PAYROLL_LOCKED",
        "/payslips"
      );
    }
    // 4. Finalize the Payroll Run
    payroll.status = "LOCKED";
    payroll.approvedBy = req.user._id;
    payroll.approvedAt = new Date();
    await payroll.save();
    
    res.json({
      success: true,
      message: `Success: ${approvedEmployees.length} payslips generated and reimbursements marked as paid.`
    });

  } catch (err) {
    console.error("LOCK PAYROLL ERROR:", err);
    res.status(500).json({ message: "Failed to lock payroll", error: err.message });
  }
};
// Add this to your payroll routes
export const getPayrollStatus = async (req, res) => {
  try {
    const { month } = req.query;
    const orgId = req.user.organizationId;

    const run = await PayrollRun.findOne({ organizationId: orgId, month : month }); 
    
    if (!run) {
      return res.json({ status: "NOT_FOUND" });
    }

    // Returns "DRAFT", "COMPLETED", etc.
    res.json({ status: run.status });
  } catch (err) {
    res.status(500).json({ message: "Error checking status" });
  }
};