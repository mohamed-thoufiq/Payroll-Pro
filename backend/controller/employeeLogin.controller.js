import User from "../models/Usermodel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const employeeLogin = async (req, res) => {
  console.log("🟡 [POST /api/auth/employee/login] Request received");

  try {
    /* =====================================================
       1️⃣ REQUEST BODY VALIDATION
    ===================================================== */
    console.log("📥 Request body:", {
      email: req.body?.email,
      passwordProvided: !!req.body?.password
    });

    const { email, password } = req.body;

    if (!email || !password) {
      console.warn("⚠️ Missing email or password");
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    /* =====================================================
       2️⃣ FIND USER
    ===================================================== */
    console.log("🔍 Searching user by email:", email);

    const user = await User.findOne({ email });


    if (!user) {
      console.warn("❌ No employee account found for email:", email);
      return res.status(404).json({
        message: "No employee account found"
      });
    }

    console.log("✅ User found:", {
      userId: user._id,
      role: user.role,
      organizationId: user.organizationId
    });

    /* =====================================================
       3️⃣ PORTAL ACCESS CHECK
    ===================================================== */
    const enablePortal =
      user.employeeDetails?.basic?.enablePortal === true;

    console.log("🚪 Employee portal access:", enablePortal);

    if (!enablePortal) {
      console.warn("⛔ Portal access disabled for user:", user._id);
      return res.status(403).json({
        message: "Employee portal access is disabled. Contact HR."
      });
    }

    /* =====================================================
       4️⃣ PASSWORD VERIFICATION
    ===================================================== */
    console.log("🔐 Verifying password…");

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.warn("❌ Invalid password for user:", user._id);
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    console.log("✅ Password verified");

    /* =====================================================
       5️⃣ JWT CREATION (🔥 MAIN FIX HERE 🔥)
    ===================================================== */
    const payload = {
      userId: user._id,
      employeeId: user.employeeDetails?.basic?.employeeId , // 🔥 CRITICAL
      role: user.role,
      organizationId: user.organizationId,
      portal: "employee"
    };

    console.log("🧾 JWT payload:", payload);

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("🎟️ JWT token generated");

    /* =====================================================
       6️⃣ RESPONSE
    ===================================================== */
   res.status(200).json({
  message: "Employee login successful",
  token,
  user
});


    console.log("✅ Employee login success response sent");

  } catch (error) {
    console.error("🔥 Employee login error");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};
