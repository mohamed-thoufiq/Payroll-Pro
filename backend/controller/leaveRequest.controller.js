import LeaveRequest from "../models/LeaveRequest.js";

/* =====================================================
   EMPLOYEE → REQUEST ATTENDANCE
===================================================== */
export const requestLeave = async (req, res) => {
  console.log("🟡 [POST] LeaveRequest request");

  try {
    const {
      date,
      checkIn,
      checkOut,
      reason
    } = req.body;

    console.log("📥 Request body:", req.body);
    console.log("👤 Employee:", req.user.employeeId);

    const attendance = await LeaveRequest.create({
      employeeId: req.user.employeeId,
      organizationId: req.user.organizationId,
      date,
      checkIn,
      checkOut,
      reason
    });

    console.log("✅ LeaveRequest requested:", attendance._id);

    res.status(201).json({
      message: "LeaveRequest request submitted",
      attendance
    });

  } catch (err) {
    console.error("❌ requestAttendance:", err);
    res.status(500).json({ message: "Failed to request attendance" });
  }
};

/* =====================================================
   EMPLOYEE → VIEW MY ATTENDANCE
===================================================== */
export const getMyLeave = async (req, res) => {
  try {
    const records = await LeaveRequest.find({
      employeeId: req.user.employeeId,
      organizationId: req.user.organizationId
    }).sort({ date: -1 });

    res.json(records);
  } catch (err) {
    console.error("❌ getMyAttendance:", err);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};

/* =====================================================
   HR / SDE → VIEW PENDING REQUESTS
===================================================== */
/**
 * FETCH ALL ATTENDANCE REQUESTS (For Admin Tabbed View)
 * Returns Pending, Approved, and Rejected requests for the organization.
 */
export const getAllLeaveRequests = async (req, res) => {
  console.log("🔵 [HR] Fetching all attendance requests (History + Pending)");

  try {
    const orgId = req.user.organizationId;

    // Find all records for the organization, regardless of status
    const records = await LeaveRequest.find({
      organizationId: orgId
    })
    .sort({ createdAt: -1 }) // Keep newest requests at the top
    .limit(200); // Safety limit to keep response times fast

    res.status(200).json(records);
  } catch (err) {
    console.error("❌ getAllAttendanceRequests Error:", err);
    res.status(500).json({ 
      message: "Failed to fetch attendance history", 
      error: err.message 
    });
  }
};

/* =====================================================
   HR / SDE → APPROVE / REJECT
===================================================== */
export const updateLeaveStatus = async (req, res) => {
  const { status } = req.body;

  console.log("🟢 [HR] Updating attendance:", req.params.id, status);

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const attendance = await LeaveRequest.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: "LeaveRequest not found" });
    }

    attendance.status = status;
    attendance.approvedBy = req.user.userId;
    attendance.approvedAt = new Date();

    await attendance.save();

    console.log("✅ LeaveRequest updated:", attendance._id);

    res.json({
      message: `LeaveRequest ${status.toLowerCase()}`,
      attendance
    });

  } catch (err) {
    console.error("❌ updateAttendanceStatus:", err);
    res.status(500).json({ message: "Failed to update attendance" });
  }
};
