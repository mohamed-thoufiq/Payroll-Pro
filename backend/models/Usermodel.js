import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { encryptField, decryptField } from '../utils/crypto.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },

    role: {
      type: String,
      enum: ['Super Admin', 'Payroll Admin', 'HR Admin', 'Employee', 'Finance'],
      required: true,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },

    onboardingCompleted: { type: Boolean, default: false },
    
    employeeDetails: {
      basic: {
        firstName: String,
        middleName: String,
        lastName: String,
        employeeId: String,
        doj: String,
        email: String,
        mobile: String,
        gender: String,
        location: String,
        designation: String,
        department: String,
        isDirector: Boolean,
        enablePortal: Boolean,
      },
      salary: {
        ctc: Number,
        basicPercentage: Number,
      },
      personal: {
        dob: String,
        fatherName: String,
        pan: String,
        addressLine1: String,
        addressLine2: String,
        city: String,
        state: String,
        pincode: String,
      },
      payment: {
        mode: {
          type: String,
          enum: ['BANK', 'CASH', 'CHEQUE'],
        },
        details: {
          type: Object,
          default: {},
        },
      },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (this.employeeDetails?.personal?.pan) {
    this.employeeDetails.personal.pan = encryptField(this.employeeDetails.personal.pan);
  }
  if (this.employeeDetails?.payment?.details?.accountNumber) {
    this.employeeDetails.payment.details.accountNumber = encryptField(this.employeeDetails.payment.details.accountNumber);
  }
});

userSchema.post(['init', 'save'], function (doc) {
  if (doc?.employeeDetails?.personal?.pan) {
    doc.employeeDetails.personal.pan = decryptField(doc.employeeDetails.personal.pan);
  }
  if (doc?.employeeDetails?.payment?.details?.accountNumber) {
    doc.employeeDetails.payment.details.accountNumber = decryptField(doc.employeeDetails.payment.details.accountNumber);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);

