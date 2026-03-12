import mongoose from "mongoose";

const PayslipSchema = new mongoose.Schema({
  payrollEmployeeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  employeeId: {
    type: String,
    required: true
  },

  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  month: {
    type: String,
    required: true
  },

  payslipNumber: {
    type: String,
    required: true
  },

  // ===== SNAPSHOTS =====
  employeeSnapshot: {
    name: String,
    employeeId: String,
    department: String,
    role: String
  },

  earnings: {
    basic: Number,
    hra: Number,
    specialAllowance: Number,
    gross: Number
  },
  reimbursements: {
    total: Number,
    items: [
      {
        category: String,
        amount: Number
      }
    ]
  },
  deductions: {
    pf: Number,
    esi: Number,
    pt: Number,
    lop:Number,
    total: Number
  },

  employerContributions: {
    pf: Number,
    esi: Number
  },

  gross: Number,
  netPay: Number,
  lopDays:Number,
  pdfUrl: String,

  generatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model("Payslip", PayslipSchema);
