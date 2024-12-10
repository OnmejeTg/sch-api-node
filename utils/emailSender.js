import asyncHandler from "express-async-handler";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const sendOtp = asyncHandler(async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const sendCompanyMail = await transporter.sendMail({
    from: "adusaater@gmail.com",
    to: email,
    subject: "Mcss UChi",
    html: ` 
        <p>Dear User,
            <br>
            Thank you for registering with us. Your One Time Password (OTP) for email verification is:
            <br>
            <b>${otp}</b>
            <br>
            Please use this OTP to complete the verification process. If you have any questions or concerns, feel free to reach out to our support team.
            <br>
            Best regards,
            <br>
            Dannon Team
        </p>`,

    headers: {
      "x-priority": "1",
      "x-msmail-priority": "High",
      importance: "high",
    },
  });
  if (
    sendCompanyMail &&
    sendCompanyMail.response &&
    sendCompanyMail.response.startsWith("250")
  ) {
    return true;
  } else {
    return false;
  }
});

export { sendOtp };
