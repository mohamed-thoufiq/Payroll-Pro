import express from "express";
import {
  requestLeave,
  getMyLeave,
  updateLeaveStatus,
  getAllLeaveRequests
} from "../controller/leaveRequest.controller.js";

import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

/* Employee */
router.post(
  "/request",
  authenticate, 
  requestLeave
);

router.get(
  "/mine",
  authenticate, 
  getMyLeave
);

/* HR / SDE */
router.get(
  "/all-requests",
  authenticate,
  authorize("HR Admin", "Super Admin"),
  getAllLeaveRequests
);

router.put(
  "/:id/status",
  authenticate,
authorize("HR Admin", "Super Admin"),
  updateLeaveStatus
);

export default router;
