import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    date: {
      type: String, // YYYY-MM-DD
      required: true
    },

    checkIn: String,
    checkOut: String,

    reason: String,

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    approvedAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("LeaveRequest", attendanceSchema);
