import Payslip from "../models/Payslip.js";

// GET all payslips for the logged-in employee
export const getMyPayslips = async (req, res) => {
  try {
    // req.user should contain the data from your User JSON
    // Note: Use the employeeId '120' stored in your user profile
    const empId = req.user.employeeDetails?.basic?.employeeId || req.user.employeeId;
    const orgId = req.user.organizationId;
    console.log(`${empId}   ${orgId}`);

    
    if (!empId) {
      return res.status(400).json({ message: "Employee ID not found in user profile" });
    }

    const payslips = await Payslip.find({ 
      employeeId: empId,
      organizationId: orgId 
    }).sort({ month: -1 }); // Newest first

    res.status(200).json(payslips);
  } catch (err) {
    console.error("❌ getMyPayslips Error:", err);
    res.status(500).json({ message: "Failed to fetch payslips", error: err.message });
  }
};

// GET a specific payslip by its MongoDB _id
export const getPayslipById = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.organizationId;

    const payslip = await Payslip.findOne({ 
      _id: id, 
      organizationId: orgId 
    });

    if (!payslip) {
      return res.status(404).json({ message: "Payslip not found" });
    }

    // Security check: Ensure the employee is only viewing their own payslip
    const empId = req.user.employeeDetails?.basic?.employeeId || req.user.employeeId;
    if (payslip.employeeId !== empId && req.user.role !== 'Admin') {
      return res.status(403).json({ message: "Unauthorized access to this payslip" });
    }

    res.status(200).json(payslip);
  } catch (err) {
    console.error("❌ getPayslipById Error:", err);
    res.status(500).json({ message: "Error fetching payslip details" });
  }
};