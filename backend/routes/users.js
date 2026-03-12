import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import User from '../models/Usermodel.js';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const router = express.Router();
const superadmin="Super Admin"
const hradmin="HR Admin"

const upload = multer({ dest: 'uploads/' });
/**
 * GET ALL USERS (Super Admin + HR Admin)
 */
router.get(
  '/',
  authenticate,
  authorize(superadmin, hradmin),
  async (req, res) => {
    try {
      const users = await User.find({
        organizationId: req.user.organizationId,
        role: { $ne: 'Super Admin' } // hide super admin from list
      })
        .select('-password')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        message: 'Users fetched successfully',
        data: users
      });
    } catch (err) {
      console.error('Get users error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  }
);

/**
 * ADD USER (Super Admin only)
 */ 
router.get("/check-existence", authenticate, authorize(superadmin, hradmin), async (req, res) => {
  const { email, employeeId } = req.query;

  const exists = await User.findOne({
    $or: [
      email ? { email } : null,
      employeeId ? { employeeId } : null
    ].filter(Boolean)
  });

  res.json({ exists: !!exists });
});
router.post(
  '/',
  authenticate,
  authorize(superadmin, hradmin),
  async (req, res) => {
    try {
      const { basic } = req.body;
      
      // Validation
      if (!basic.firstName || !basic.password || !basic.email || !basic.department ) {
        return res.status(400).json({
          success: false,
          message: 'First name, email, department (role) are required'
        });
      }

      // Combine names
      const fullName = [basic.firstName, basic.middleName, basic.lastName].filter(Boolean).join(' ');

      // Check if email or employeeId already exists
      const existingUser = await User.findOne({
        $or: [
          { email: basic.email },
          { 'employeeDetails.basic.employeeId': basic.employeeId }
        ]
      });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email or Employee ID already exists'
        });
      }

      // Create user
      const user = await User.create({
        name: fullName,
        email: basic.email,
        password: basic.password,
        role: basic.role, // mapping department as role
        profileImage:'',
        organizationId: req.user.organizationId,
        onboardingCompleted: true,
        employeeDetails: req.body
      });

      res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: user
      });
    } catch (err) {
      console.error('Add employee error:', err);
      res.status(500).json({
        success: false,
        message:`${err.message}` +' Failed to create employee'
      });
    }
  }
);


/**
 * UPDATE USER
 */
router.put(
  '/:userId',
  authenticate,
  authorize(superadmin, hradmin),
  async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findOne({
        _id: userId,
        organizationId: req.user.organizationId
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.role === 'Super Admin') {
        return res.status(403).json({
          success: false,
          message: 'Cannot modify Super Admin'
        });
      }

      Object.assign(user, req.body);
      await user.save();

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (err) {
      console.error('Update user error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }
  }
);
/**
 * UPDATE USER STATUS
 */
router.patch(
  "/:id/status",
  authenticate,
  authorize(superadmin, hradmin),
  async (req, res) => {
    try {
      const { status } = req.body;

      if (!["Active", "Inactive"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.json({ message: "Status updated", user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update status" });
    }
  }
);

/**
 * DELETE USER
 */
router.delete(
  '/:userId',
  authenticate,
  authorize(superadmin, hradmin),
  async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findOne({
        _id: userId,
        organizationId: req.user.organizationId
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.role === 'Super Admin') {
        return res.status(403).json({
          success: false,
          message: 'Cannot delete Super Admin'
        });
      }

      await user.deleteOne();

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (err) {
      console.error('Delete user error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }
  }
);



router.post(
  '/bulk-confirm',
  authenticate,
  authorize(superadmin, hradmin),
  async (req, res) => {
    try {
      const { users } = req.body;

      const createdUsers = await Promise.all(
        users.map((row) =>
          User.create({
            name: [row.firstName, row.middleName, row.lastName]
              .filter(Boolean)
              .join(' '),

            email: row.email,
            password: row.password, // 🔐 auto-hashed by schema
            role: row.role,
            organizationId: req.user.organizationId,
            onboardingCompleted: true,

            employeeDetails: {
              basic: {
                firstName: row.firstName,
                middleName: row.middleName,
                lastName: row.lastName,
                employeeId: row.employeeId,
                doj: row.doj,
                email: row.email,
                mobile: row.mobile,
                gender: row.gender,
                location: row.location,
                designation: row.designation,
                department: row.department,
              },
              salary: {
                ctc: Number(row.ctc) || 0,
                basicPercentage: Number(row.basicPercentage) || 50,
              },
              personal: {
                dob: row.dob,
                fatherName: row.fatherName,
                pan: row.pan,
                city: row.city,
                state: row.state,
                pincode: row.pincode,
              },
              payment: {
                mode: row.paymentMode || 'BANK',
                details: {
                  bankName: row.bankName,
                  accountNumber: row.accountNumber,
                  ifsc: row.ifsc,
                },
              },
            },
          })
        )
      );

      res.status(201).json({
        success: true,
        message: `${createdUsers.length} employees imported successfully.`,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: 'Final insertion failed',
      });
    }
  }
);




/**
 * BULK IMPORT USERS (CSV)
 * Authorize: Super Admin, HR Admin
 */
router.post(
  '/bulk-import',
  authenticate,
  authorize(superadmin, hradmin),
  upload.single('file'),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const rawResults = [];
    const successData = []; 
    const failedData = [];  

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => rawResults.push(data))
      .on('end', async () => {
        try {
          const validRoles = ['Super Admin', 'Payroll Admin', 'HR Admin', 'Employee', 'Finance'];
          const validPaymentModes = ['BANK', 'CASH', 'CHEQUE'];

          for (const row of rawResults) {
            let rowErrors = [];

            // 1. Structural/Shifted Data Check
            // If the row is malformed like "Rahul,S,Bosey9988", email might be undefined or missing '@'
            if (!row.email || !row.email.includes('@')) {
              rowErrors.push("Malformed Row or Invalid Email (Check CSV commas)");
            }

            // 2. Schema-Specific Validation
            if (!row.firstName) rowErrors.push("First Name is missing");
            if (!row.employeeId) rowErrors.push("Employee ID is missing");
            
            // Check Enum for Role
            if (!validRoles.includes(row.role)) {
              rowErrors.push(`Invalid Role: "${row.role || 'Empty'}"`);
            }

            // Check Enum for Payment Mode
            if (row.paymentMode && !validPaymentModes.includes(row.paymentMode)) {
              rowErrors.push(`Invalid Payment Mode: "${row.paymentMode}"`);
            }

            // 3. Duplicate Check (Only if row is structurally sound)
            if (rowErrors.length === 0) {
              const existingUser = await User.findOne({ 
                $or: [
                  { email: row.email }, 
                  { 'employeeDetails.basic.employeeId': row.employeeId }
                ]
              });

              if (existingUser) {
                rowErrors.push("Database Conflict: Email or Employee ID already exists");
              }
            }

            // 4. Bucket Assignment
            if (rowErrors.length > 0) {
              failedData.push({
                ...row,
                errorDetails: rowErrors.join(' | ')
              });
            } else {
              successData.push({
                ...row,
                status: 'READY'
              });
            }
          }

          fs.unlinkSync(req.file.path);

          res.status(200).json({
            success: true,
            summary: {
              total: rawResults.length,
              validCount: successData.length,
              errorCount: failedData.length
            },
            approved: successData,
            actionNeeded: failedData
          });

        } catch (err) {
          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
          res.status(500).json({ success: false, message: 'Processing failed', error: err.message });
        }
      });
  }
);
router.get('/download-template', (req, res) => {
  const template = "firstName,middleName,lastName,email,password,role,employeeId,doj,mobile,gender,location,designation,department,ctc,basicPercentage,dob,fatherName,pan,addressLine1,city,state,pincode,paymentMode,bankName,accountNumber,ifsc\nRahul,Sarath,Kumar,rahul@company.com,welcome@1,Employee,EMPk102,2026-02-01,9888877777,Male,Bangalore,Engineer,IT,1200000,40,1998-08-20,Rajesh Kumar,FGHIJ5678K,456 Tech Park,Bangalore,Karnataka,560001,BANK,ICICI Bank,00040506070,ICIC0000001";
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=employee_template.csv');
  res.status(200).send(template);
});
export default router;
