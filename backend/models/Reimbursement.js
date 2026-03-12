import mongoose from "mongoose";

const ReimbursementSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  employeeId: {
    type: mongoose.Schema.Types.String,
    required: true
  },

  category: {
    type: String,
    enum: ["TRAVEL", "FOOD", "HOTEL", "MARKETING","MEETING", "OTHER"],
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  description: String,

  expenseDate: Date,

  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED", "PROCESSED","PAID"],
    default: "PENDING"
  },

  payrollRunId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },

  approvedBy: mongoose.Schema.Types.ObjectId,
  approvedAt: Date

}, { timestamps: true });

export default mongoose.model("Reimbursement", ReimbursementSchema);
