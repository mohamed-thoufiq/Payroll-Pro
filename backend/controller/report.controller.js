import PayrollEmployee from "../models/PayrollEmployee.js";
import PayrollRun from "../models/PayrollRun.js";
import ExcelJS from "exceljs";
import mongoose from "mongoose";
/* ----------------- Helper to send Excel ----------------- */
const sendExcel = async (res, workbook, filename) => {
  const buffer = await workbook.xlsx.writeBuffer();

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`
  );
  res.setHeader("Content-Length", buffer.length);

  return res.end(buffer);
};

/* ----------------- 1. Monthly Salary Register ----------------- */
export const salaryRegister = async (req, res) => {
  try {
    const { month } = req.query;
    const orgId = req.user.organizationId;

    console.log(`📥 Salary Register requested for month: ${month}, org: ${orgId}`);

    const data = await PayrollEmployee.find({
      organizationId: orgId,
      month,
      status: "COMPLETED"
    });

    console.log(`📊 Records found: ${data.length}`);
    if (!data.length) return res.status(404).json({ message: "No payroll data found" });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Salary Register");

    sheet.columns = [
      { header: "Employee ID", key: "empId", width: 15 },
      { header: "Name", key: "name", width: 25 },
      { header: "Department", key: "dept", width: 18 },
      { header: "Gross", key: "gross", width: 15 },
      { header: "Total Deductions", key: "ded", width: 18 },
      { header: "Net Pay", key: "net", width: 15 }
    ];
    sheet.getRow(1).font = { bold: true };

    data.forEach(e => {
      sheet.addRow({
        empId: e.employeeSnapshot.employeeId,
        name: e.employeeSnapshot.name,
        dept: e.employeeSnapshot.department,
        gross: e.earnings.gross,
        ded: e.deductions.total,
        net: e.netPay
      });
    });

    await sendExcel(res, workbook, `Salary_Register_${month}.xlsx`);
  } catch (err) {
    console.error("❌ salaryRegister ERROR:", err);
    res.status(500).json({ message: "Salary register failed", error: err.message });
  }
};

/* ----------------- 2. Statutory PF & ESI ----------------- */
export const statutoryReport = async (req, res) => {
  try {
    const { month } = req.query;
    const orgId = req.user.organizationId;

    console.log(`📥 Statutory PF & ESI requested for month: ${month}, org: ${orgId}`);

    const data = await PayrollEmployee.find({
      organizationId: orgId,
      month,
      status: "COMPLETED"
    });

    if (!data.length) return res.status(404).json({ message: "No payroll data found" });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("PF & ESI");

    sheet.columns = [
      { header: "Employee ID", key: "eid", width: 15 },
      { header: "Name", key: "name", width: 25 },
      { header: "Emp PF", key: "epf", width: 12 },
      { header: "Er PF", key: "erpf", width: 12 },
      { header: "Emp ESI", key: "eesi", width: 12 },
      { header: "Er ESI", key: "eresi", width: 12 }
    ];
    sheet.getRow(1).font = { bold: true };

    data.forEach(e => {
      sheet.addRow({
        eid: e.employeeSnapshot.employeeId,
        name: e.employeeSnapshot.name,
        epf: e.statutorySnapshot.employeePF,
        erpf: e.statutorySnapshot.employerPF,
        eesi: e.statutorySnapshot.employeeESI,
        eresi: e.statutorySnapshot.employerESI
      });
    });

    await sendExcel(res, workbook, `Statutory_PF_ESI_${month}.xlsx`);
  } catch (err) {
    console.error("❌ statutoryReport ERROR:", err);
    res.status(500).json({ message: "Statutory report failed", error: err.message });
  }
};


export const departmentCost = async (req, res) => {
  try {
    const { month } = req.query;
    const orgId = new mongoose.Types.ObjectId(req.user.organizationId);

    const result = await PayrollEmployee.aggregate([
      { 
        $match: { 
          organizationId: orgId, 
          status: "COMPLETED" 
        } 
      },
      {
        $lookup: {
          from: "payrollruns",
          localField: "payrollRunId",
          foreignField: "_id",
          as: "payrollRun"
        }
      },
      { $unwind: "$payrollRun" },
      { $match: { "payrollRun.month": month } },
      {
        $group: {
          _id: "$employeeSnapshot.department",
          headcount: { $sum: 1 },
          // Using Gross Earnings + Employer PF for true Company Cost
          totalCost: { 
            $sum: { 
              $add: ["$earnings.gross", { $ifNull: ["$statutorySnapshot.employerPF", 0] }] 
            } 
          }
        }
      },
      { $sort: { totalCost: -1 } } // Sort by highest cost first
    ]);

    if (!result.length) {
      return res.status(404).json({ message: `No data found for ${month}` });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Department Cost");

    sheet.columns = [
      { header: "Department", key: "dept", width: 25 },
      { header: "Employees", key: "emp", width: 15 },
      { header: "Total Company Cost", key: "cost", width: 20 }
    ];

    // Header Styling
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    result.forEach(d => {
      sheet.addRow({ 
        dept: d._id || "Unassigned", 
        emp: d.headcount, 
        cost: d.totalCost 
      });
    });

    // Formatting the cost column as currency
    sheet.getColumn('cost').numFmt = '#,##0.00';

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="Dept_Cost_${month}.xlsx"`);
    return res.send(buffer);

  } catch (err) {
    console.error("❌ departmentCost ERROR:", err);
    res.status(500).json({ message: "Analysis failed", error: err.message });
  }
};

export const professionalTaxReport = async (req, res) => {
  try {
    const { month } = req.query;
    const orgId = new mongoose.Types.ObjectId(req.user.organizationId);

    const result = await PayrollEmployee.aggregate([
      { $match: { organizationId: orgId, status: "COMPLETED" } },
      {
        $lookup: {
          from: "payrollruns",
          localField: "payrollRunId",
          foreignField: "_id",
          as: "payrollRun"
        }
      },
      { $unwind: "$payrollRun" },
      { $match: { "payrollRun.month": month } },
      {
        $group: {
          _id: "$employeeSnapshot.location",
          totalPT: { $sum: "$statutorySnapshot.professionalTax" },
          employeeCount: { $sum: 1 }
        }
      }
    ]);
    console.log(result);
    
    if (!result.length) {
      return res.status(404).json({ message: "No PT data found for this month" });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("PT Report");

    sheet.columns = [
      { header: "State/Location", key: "state", width: 25 },
      { header: "Employee Count", key: "count", width: 15 },
      { header: "Total Professional Tax", key: "pt", width: 25 }
    ];

    sheet.getRow(1).font = { bold: true };

    result.forEach(r => {
      sheet.addRow({ 
        state: r._id || "Other", 
        count: r.employeeCount,
        pt: r.totalPT 
      });
    });

    sheet.getColumn('pt').numFmt = '#,##0.00';

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="PT_Report_${month}.xlsx"`);
    return res.send(buffer);

  } catch (err) {
    console.error("❌ professionalTaxReport ERROR:", err);
    res.status(500).json({ message: "PT Report failed", error: err.message });
  }
};


/* ----------------- 5. Bank Disbursement Advice ----------------- */
export const bankAdvice = async (req, res) => {
  try {
    const { month } = req.query;
    const orgId = req.user.organizationId;

    console.log(`📥 Bank Disbursement Advice requested for month: ${month}, org: ${orgId}`);

    const data = await PayrollEmployee.find({
      organizationId: orgId,
      month,
      status: "COMPLETED"
    });

    if (!data.length) return res.status(404).json({ message: "No payroll data found" });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Bank Advice");

    sheet.columns = [
      { header: "Employee Name", key: "name", width: 25 },
      { header: "Account Number", key: "acc", width: 20 },
      { header: "IFSC", key: "ifsc", width: 15 },
      { header: "Bank", key: "bank", width: 20 },
      { header: "Amount", key: "amt", width: 15 }
    ];
    sheet.getRow(1).font = { bold: true };

    data.forEach(e => {
      sheet.addRow({
        name: e.employeeSnapshot.name,
        acc: e.employeeSnapshot.accountNumber,
        ifsc: e.employeeSnapshot.ifsc,
        bank: e.employeeSnapshot.bankName,
        amt: e.netPay
      });
    });

    await sendExcel(res, workbook, `Bank_Advice_${month}.xlsx`);
  } catch (err) {
    console.error("❌ bankAdvice ERROR:", err);
    res.status(500).json({ message: "Bank advice report failed", error: err.message });
  }
};

/* ----------------- 6. Audit Logs ----------------- */
export const auditLogs = async (req, res) => {
  try {
    const orgId = req.user.organizationId;

    console.log(`📥 Audit logs requested for org: ${orgId}`);

    const runs = await PayrollRun.find({ organizationId: orgId })
      .populate("createdBy", "name")
      .populate("approvedBy", "name")
      .sort({ createdAt: -1 });

    res.json(runs.map(r => ({
      month: r.month,
      status: r.status,
      createdBy: r.createdBy?.name,
      approvedBy: r.approvedBy?.name,
      approvedAt: r.approvedAt
    })));
  } catch (err) {
    console.error("❌ auditLogs ERROR:", err);
    res.status(500).json({ message: "Audit logs failed", error: err.message });
  }
};
export const downloadReport = async (req, res) => {
  try {
    const { month, type } = req.query;

    // 1. Create workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(type || "Report");

    // 2. Define columns
    sheet.columns = [
      { header: "Employee ID", key: "employeeId", width: 20 },
      { header: "Name", key: "name", width: 25 },
      { header: "Department", key: "department", width: 20 },
      { header: "Gross Pay", key: "gross", width: 15 },
      { header: "Deductions", key: "deductions", width: 15 },
      { header: "Net Pay", key: "netPay", width: 15 }
    ];

    // 3. Add rows (EXAMPLE DATA)
    sheet.addRow({
      employeeId: "EMP120",
      name: "John Doe",
      department: "IT",
      gross: 45000,
      deductions: 3500,
      netPay: 41500
    });

    // 4. Generate Excel buffer (IMPORTANT)
    const buffer = await workbook.xlsx.writeBuffer();

    // 5. Set headers (CRITICAL)
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${type || "report"}_${month}.xlsx"`
    );
    res.setHeader("Content-Length", buffer.length);

    // 6. Send file
    return res.end(buffer);
  } catch (error) {
    console.error("DOWNLOAD REPORT ERROR:", error);
    return res.status(500).json({ message: "Report download failed" });
  }
};