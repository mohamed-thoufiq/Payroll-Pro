import mongoose from "mongoose";
const PayrollRunSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  month: { type: String, required: true }, // Format: "2026-01"
  status: { 
    type: String, 
    enum: ['DRAFT', 'LOCKED'], 
    default: 'DRAFT' 
  },
  totals: {
    totalEmployees: { type: Number, default: 0 },
    gross: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netPay: { type: Number, default: 0 }
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('PayrollRun', PayrollRunSchema);