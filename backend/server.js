import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from './config/passport.js';
import connectDB from './config/db.js';
import http from 'http'

// Routes
import authRoutes from './routes/auth.js';
import onboardingRoutes from './routes/onboarding.js';
import userRoutes from './routes/users.js';
import superadminRoutes from './routes/superadmin.js';
import settingsRoutes from './routes/settings.route.js';
import rolesRoutes from './routes/roles.route.js';  
import payrollRoutes from './routes/payroll.routes.js';  
import reportRoutes from './routes/report.route.js';  
import payslipRoutes from './routes/payslip.route.js'; 
import reimbursementRoutes from './routes/reimbursement.routes.js'; 
import notificationRoutes from './routes/notification.route.js';
import leaveRoute from './routes/leaveRequest.routes.js';
import { initSocket } from "./utils/socket.js";
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

const app = express();
const server = http.createServer(app);

// 🔥 attach socket.io here
initSocket(server);

// ------------------ SECURITY & MIDDLEWARE ------------------
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
// Express 5 compatible NoSQL sanitization
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    mongoSanitize.sanitize(req.body);
  }
  if (req.params && typeof req.params === 'object') {
    mongoSanitize.sanitize(req.params);
  }
  next();
});

// Rate Limiting for Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // max 100 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again after 15 minutes' }
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'payroll_session_secret_f839d2c8e19b4a5d892716490ab76e2',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production"
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// ------------------ ROUTES ------------------
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/organization',rolesRoutes) 
app.use('/api/payroll',payrollRoutes)
app.use('/api/payslips',payslipRoutes)
app.use('/api/reports',reportRoutes)
app.use('/api/reimbursements',reimbursementRoutes)
app.use('/api/notification',notificationRoutes)
app.use('/api/attendance',leaveRoute)

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Payroll API is running' });
}); 

/* -------------------- START SERVER -------------------- */
const PORT = process.env.PORT || 5000;

try {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
} catch (err) {
  console.error('❌ Failed to start server:', err);
}