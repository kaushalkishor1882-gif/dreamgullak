"use server"; // Ensures this runs only on server

import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER;     // your email
const EMAIL_PASS = process.env.EMAIL_PASS;     // your Gmail App Password
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;   // admin email
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL; // dynamic base URL
const SECRET_TOKEN = process.env.ADMIN_SECRET_TOKEN; // admin token

if (!EMAIL_USER || !EMAIL_PASS || !ADMIN_EMAIL || !BASE_URL || !SECRET_TOKEN) {
  console.warn("⚠️ Missing required environment variables in .env");
}

// ✅ Create transporter (once)
const transporter =
  EMAIL_USER && EMAIL_PASS
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      })
    : null;

// ✅ Send email to user
export async function sendUserEmail(to: string, message: string, subject = "Withdrawal Request Update", html?: string) {
  try {
    if (!transporter) {
      console.log("⚠️ Email not sent: transporter not configured");
      return;
    }

    await transporter.sendMail({
      from: EMAIL_USER,
      to,
      subject,
      text: html ? undefined : message,
      html: html || undefined,
    });

    console.log("✅ User email sent to:", to);
  } catch (error) {
    console.error("❌ Error sending user email:", error);
  }
}

// ✅ Send notification to admin with Approve/Reject links
export async function sendAdminNotification(
  userEmail: string,
  amount: number,
  withdrawalId: string
) {
  try {
    if (!transporter) {
      console.log("⚠️ Admin alert not sent: transporter not configured");
      return;
    }

    // ✅ Construct links using BASE_URL
    const approveLink = `${BASE_URL}/api/admin/withdraw/approve?withdrawalId=${withdrawalId}&token=${SECRET_TOKEN}`;
    const rejectLink = `${BASE_URL}/api/admin/withdraw/reject?withdrawalId=${withdrawalId}&token=${SECRET_TOKEN}`;

    const htmlMessage = `
      <p>New withdrawal request from <b>${userEmail}</b>: ₹${amount}</p>
      <p>
        <a href="${approveLink}" style="padding:10px 20px; background:green; color:white; text-decoration:none; border-radius:5px;">Approve</a>
        &nbsp;
        <a href="${rejectLink}" style="padding:10px 20px; background:red; color:white; text-decoration:none; border-radius:5px;">Reject</a>
      </p>
    `;

    await transporter.sendMail({
      from: EMAIL_USER,
      to: ADMIN_EMAIL,
      subject: `New Withdrawal Request from ${userEmail}`,
      html: htmlMessage,
    });

    console.log("✅ Admin notification sent with approve/reject links.");
  } catch (error) {
    console.error("❌ Error sending admin notification:", error);
  }
}
