import mongoose from "mongoose";
const reimbursementItemSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["TRAVEL", "FOOD", "HOTEL", "MARKETING", "MEETING", "OTHER"],
      required: true
    },
    amount: {
      type: Number,
      min: 0,
      required: true
    },
    description: {
      type: String,
      default: null
    }
  },
  { _id: false }
);

const payrollEmployeeSchema = new mongoose.Schema({
  reimbursements: {
    total: {
      type: Number,
      default: 0,
      min: 0
    },
    items: {
      type: [reimbursementItemSchema],
      default: []
    }
  }
});

const PayrollEmployeeSchema = new mongoose.Schema({
  payrollRunId: { type: mongoose.Schema.Types.ObjectId, ref: 'PayrollRun', required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  employeeId: { type: mongoose.Schema.Types.String, ref: 'User', required: true },
  month: { type: String, required: true } ,
  // 📸 snapshots: Crucial for historical reports
  employeeSnapshot: {
    name: String,
    employeeId: String, // Company ID (e.g., EMP101)
    role: String,
    department: String, // For "Departmental Cost Analysis"
    location: String,   // For "Professional Tax Summary" (State-wise)
    bankName: String,   // For "Bank Disbursement Advice"
    accountNumber: String,
    ifsc: String
  },

  earnings: {
    basic: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    specialAllowance: { type: Number, default: 0 },
    gross: { type: Number, default: 0 } // Gross Pay
  },

  deductions: {
    pf: { type: Number, default: 0 },
    esi: { type: Number, default: 0 },
    pt: { type: Number, default: 0 },
    lop: { type: Number, default: 0 },
    incomeTax: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  reimbursements: {
    total: {
      type: Number,
      default: 0,
      min: 0
    },
    items: {
      type: [reimbursementItemSchema],
      default: []
    }
  },

  // 🏛️ statutorySnapshot: Stores what the COMPANY pays (Employer share)
  // Needed for "Statutory PF & ESI" report
  statutorySnapshot: {
    employerPF: { type: Number, default: 0 },
    employerESI: { type: Number, default: 0 },
    employeePF: { type: Number, default: 0 },
    employeeESI: { type: Number, default: 0 },
    professionalTax: { type: Number, default: 0 }
  },

  netPay: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['DRAFT', 'APPROVED', 'COMPLETED'], 
    default: 'DRAFT' 
  },
  lopDays:{type :Number, default: 0}
}, { timestamps: true });

export default mongoose.model('PayrollEmployee', PayrollEmployeeSchema);