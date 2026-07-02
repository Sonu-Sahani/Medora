import nodemailer from "nodemailer";

console.log({
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS_EXISTS: !!process.env.SMTP_PASS,
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to,
    subject,
    html,
  });
};

// Reusable OTP email layout
const otpEmailTemplate = ({ title, subtitle, otp, footerNote }) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb,#0d9488);padding:32px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:800;">
                Med<span style="color:#bfdbfe;">ora</span>
              </h1>
              <p style="color:#bfdbfe;margin:6px 0 0;font-size:13px;">Healthcare Management Platform</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px;">
              <h2 style="color:#1e293b;font-size:20px;margin:0 0 8px;">${title}</h2>
              <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px;">${subtitle}</p>
              <div style="background:#eff6ff;border:2px dashed #93c5fd;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
                <p style="color:#64748b;font-size:12px;margin:0 0 8px;letter-spacing:1px;text-transform:uppercase;">Your OTP Code</p>
                <p style="color:#2563eb;font-size:40px;font-weight:800;letter-spacing:12px;margin:0;">${otp}</p>
                <p style="color:#94a3b8;font-size:11px;margin:8px 0 0;">Expires in 10 minutes</p>
              </div>
              <p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:0;">${footerNote}</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #f1f5f9;">
              <p style="color:#cbd5e1;font-size:11px;margin:0;">
                © ${new Date().getFullYear()} Medora Healthcare. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Email Verification OTP
export const sendEmailVerificationOTP = async (email, name, otp) => {
  await sendEmail({
    to: email,
    subject: "Medora - Verify Your Email Address",
    html: otpEmailTemplate({
      title: "Verify Your Email",
      subtitle: `Hi <strong>${name}</strong>, welcome to Medora! Please verify your email address using the OTP below.`,
      otp,
      footerNote:
        "If you didn't create a Medora account, please ignore this email.",
    }),
  });
};

// Password Reset OTP
export const sendPasswordResetOTP = async (email, name, otp) => {
  await sendEmail({
    to: email,
    subject: "Medora - Password Reset OTP",
    html: otpEmailTemplate({
      title: "Password Reset Request",
      subtitle: `Hi <strong>${name}</strong>, we received a request to reset your Medora account password.`,
      otp,
      footerNote:
        "If you didn't request this, please ignore this email. Your password will remain unchanged. Never share this OTP with anyone.",
    }),
  });
};

// Doctor Credentials Email
export const sendDoctorCredentials = async (email, name, password, specialty) => {
  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb,#0d9488);padding:32px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:800;">
                Med<span style="color:#bfdbfe;">ora</span>
              </h1>
              <p style="color:#bfdbfe;margin:6px 0 0;font-size:13px;">Healthcare Management Platform</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px;">
              <h2 style="color:#1e293b;font-size:20px;margin:0 0 8px;">Welcome to Medora, Dr. ${name}!</h2>
              <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px;">
                Your doctor account has been created by the Medora admin team. You've been onboarded as a
                <strong>${specialty}</strong> specialist. Use the credentials below to log in to your dashboard.
              </p>
              <div style="background:#eff6ff;border:2px dashed #93c5fd;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                <p style="color:#64748b;font-size:11px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Email</p>
                <p style="color:#1e293b;font-size:15px;font-weight:700;margin:0 0 14px;">${email}</p>
                <p style="color:#64748b;font-size:11px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Temporary Password</p>
                <p style="color:#2563eb;font-size:20px;font-weight:800;letter-spacing:2px;margin:0;">${password}</p>
              </div>
              <p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:0;">
                For security, please log in and change your password immediately from your Profile Settings.
                Keep your credentials confidential.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #f1f5f9;">
              <p style="color:#cbd5e1;font-size:11px;margin:0;">
                © ${new Date().getFullYear()} Medora Healthcare. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await sendEmail({
    to: email,
    subject: "Medora - Your Doctor Account Credentials",
    html,
  });
};

export default sendEmail;