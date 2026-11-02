import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/Usermodel.js';

async function updateUsers() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const mainOrgId = new mongoose.Types.ObjectId('69739e7eb3185ad914c57171');
  const hashedPassword = await bcrypt.hash('12345678', 10);

  // 1. Super Admin
  const admin = await User.findOneAndUpdate(
    { $or: [{ email: 'admin@payroll.com' }, { email: 'syed@gmail.com' }] },
    {
      $set: {
        name: 'Super Admin',
        email: 'admin@payroll.com',
        role: 'Super Admin',
        password: hashedPassword,
        organizationId: mainOrgId,
        onboardingCompleted: true,
        status: 'Active'
      }
    },
    { new: true, upsert: true }
  );
  console.log('✅ Super Admin configured:', admin.email);

  // 2. HR Admin
  const hr = await User.findOneAndUpdate(
    { $or: [{ email: 'hr@payroll.com' }, { email: 'sabir@gmail.com' }] },
    {
      $set: {
        name: 'HR Admin',
        email: 'hr@payroll.com',
        role: 'HR Admin',
        password: hashedPassword,
        organizationId: mainOrgId,
        onboardingCompleted: true,
        status: 'Active'
      }
    },
    { new: true, upsert: true }
  );
  console.log('✅ HR Admin configured:', hr.email);

  // 3. Payroll Admin
  const payroll = await User.findOneAndUpdate(
    { $or: [{ email: 'payroll@payroll.com' }, { email: 'zeeshan@gmail.com' }] },
    {
      $set: {
        name: 'Payroll Admin',
        email: 'payroll@payroll.com',
        role: 'Payroll Admin',
        password: hashedPassword,
        organizationId: mainOrgId,
        onboardingCompleted: true,
        status: 'Active'
      }
    },
    { new: true, upsert: true }
  );
  console.log('✅ Payroll Admin configured:', payroll.email);

  // 4. Finance Admin
  const finance = await User.findOneAndUpdate(
    { $or: [{ email: 'finance@payroll.com' }, { email: 'thoufiq@gmail.com' }] },
    {
      $set: {
        name: 'Finance Admin',
        email: 'finance@payroll.com',
        role: 'Finance',
        password: hashedPassword,
        organizationId: mainOrgId,
        onboardingCompleted: true,
        status: 'Active'
      }
    },
    { new: true, upsert: true }
  );
  console.log('✅ Finance configured:', finance.email);

  // 5. Employee
  const employee = await User.findOneAndUpdate(
    { $or: [{ email: 'employee@payroll.com' }, { email: 'rizz@gmail.com' }] },
    {
      $set: {
        name: 'Demo Employee',
        email: 'employee@payroll.com',
        role: 'Employee',
        password: hashedPassword,
        organizationId: mainOrgId,
        onboardingCompleted: true,
        status: 'Active',
        'employeeDetails.basic.firstName': 'Demo',
        'employeeDetails.basic.lastName': 'Employee',
        'employeeDetails.basic.employeeId': 'EMP-001',
        'employeeDetails.basic.email': 'employee@payroll.com',
        'employeeDetails.basic.enablePortal': true,
        'employeeDetails.basic.department': 'Engineering'
      }
    },
    { new: true, upsert: true }
  );
  console.log('✅ Employee configured:', employee.email);

  console.log('\n🎉 All 5 generic role accounts are ready with password "12345678"!');
  await mongoose.disconnect();
}

updateUsers().catch(err => {
  console.error('❌ Error updating users:', err);
  process.exit(1);
});
