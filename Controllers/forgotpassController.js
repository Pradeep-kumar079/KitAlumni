const User = require("../Models/UserModel");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const SibApiV3Sdk = require("sib-api-v3-sdk");

// ================== FORGOT PASSWORD ==================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    console.log("🟡 GENERATED TOKEN:", resetToken);

    // ✅ Save SAME token (IMPORTANT 🔥)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // ✅ Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;

    // ================== BREVO ==================
    const client = SibApiV3Sdk.ApiClient.instance;

    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY missing in .env");
    }

    client.authentications["api-key"].apiKey =
      process.env.BREVO_API_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    await apiInstance.sendTransacEmail({
      sender: {
        email: "pradeepk9348@gmail.com",
        name: "KIT Alumni",
      },
      to: [{ email }],
      subject: "Password Reset Request",
      htmlContent: `
        <h2>Hello ${user.username || "User"}</h2>
        <p>You requested a password reset.</p>
        <p>Click below to reset your password:</p>
        <a href="${resetUrl}" 
          style="background:#007bff;color:white;padding:10px 15px;border-radius:5px;text-decoration:none;">
          Reset Password
        </a>
      `,
    });

    res.json({
      success: true,
      message: "Reset link sent to email!",
    });

  } catch (error) {
    console.error("BREVO FORGOT ERROR:", error.response?.body || error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================== RESET PASSWORD ==================
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    console.log("🔴 TOKEN FROM URL:", token);

    // ✅ Find user using SAME token
    const user = await User.findOne({
      resetPasswordToken: token,
    });

    console.log("🟢 USER FOUND:", user ? user.email : "No user");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token not found in DB",
      });
    }

    // ✅ Update password
    user.password = await bcrypt.hash(password, 10);

    // ✅ Clear token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully!",
    });

  } catch (error) {
    console.error("Reset Password Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};