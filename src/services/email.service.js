require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Banking website" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegistrationEmail(userEmail, name) {
  const subject = 'Welcome to Banking Website!';
  const displayName = String(name || 'there').trim() || 'there';
  const safeName = displayName.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);

  const text = `Hello ${displayName},

Welcome to Banking Website! Your account has been created successfully.

You can now sign in and start managing your account securely.

If you did not create this account, please contact our support team immediately.

Best regards,
The Banking Website Team`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Banking Website</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f6fb; font-family: Arial, Helvetica, sans-serif; color: #1f2937;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f6fb;">
          <tr>
            <td align="center" style="padding: 32px 16px;">
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden;">
                <tr>
                  <td align="center" style="padding: 32px 40px; background-color: #123c69;">
                    <p style="margin: 0 0 10px; color: #bfdbfe; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">Banking Website</p>
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; line-height: 1.25; font-weight: 700;">Welcome aboard!</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6;">Hello ${safeName},</p>
                    <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6;">Your account has been created successfully. You can now sign in and start managing your account securely.</p>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 24px; background-color: #eff6ff; border-radius: 10px;">
                      <tr>
                        <td style="padding: 18px 20px; border-left: 4px solid #2563eb;">
                          <p style="margin: 0; color: #1e3a5f; font-size: 15px; line-height: 1.55;"><strong>Your account is ready.</strong><br>Sign in whenever you are ready to get started.</p>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0 0 28px; padding: 16px; background-color: #fff8e7; border-radius: 8px; color: #6b4f16; font-size: 14px; line-height: 1.55;">If you did not create this account, please contact our support team immediately.</p>
                    <p style="margin: 0; font-size: 16px; line-height: 1.6;">Best regards,<br><strong>The Banking Website Team</strong></p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 20px 40px; background-color: #f8fafc; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.5;">This is an automated account notification. Please do not reply to this email.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`;

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionReceipt({ email, name, amount, toUser }) {
  const subject = 'Transaction Receipt';
  const displayName = String(name || 'there').trim() || 'there';
  const safeName = displayName.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);

  const text = `Hello ${displayName},

Your transaction of INR ${amount} has been successfully processed.

Best regards,
The Banking Website Team`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Transaction Receipt</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f6fb; font-family: Arial, Helvetica, sans-serif; color: #1f2937;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f6fb;">
          <tr>
            <td align="center" style="padding: 32px 16px;">
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden;">
                <tr>
                  <td align="center" style="padding: 32px 40px; background-color: #123c69;">
                    <p style="margin: 0 0 10px; color: #bfdbfe; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">Banking Website</p>
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; line-height: 1.25; font-weight: 700;">Transaction Successful</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6;">Hello ${safeName},</p>
                    <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6;">Your transaction of <strong>INR ${amount}</strong> has been successfully processed.</p>
                    <p style="margin: 0; font-size: 16px; line-height: 1.6;">Best regards,<br><strong>The Banking Website Team</strong></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`;

  await sendEmail(email, subject, text, html);
}

async function sendTransactionFailed({ email, name, amount, fromUserAccount, toUserAccount }) {
  const subject = 'Transaction Failed';
  const displayName = String(name || 'there').trim() || 'there';
  const safeName = displayName.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);

  const text = `Hello ${displayName},

Your transaction of INR ${amount} could not be processed due to insufficient balance.

Best regards,
The Banking Website Team`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Transaction Failed</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f6fb; font-family: Arial, Helvetica, sans-serif; color: #1f2937;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f6fb;">
          <tr>
            <td align="center" style="padding: 32px 16px;">
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden;">
                <tr>
                  <td align="center" style="padding: 32px 40px; background-color: #991b1b;">
                    <p style="margin: 0 0 10px; color: #fecaca; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">Banking Website</p>
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; line-height: 1.25; font-weight: 700;">Transaction Failed</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6;">Hello ${safeName},</p>
                    <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6;">Your transaction of <strong>INR ${amount}</strong> could not be completed.</p>
                    <p style="margin: 0; font-size: 16px; line-height: 1.6;">Best regards,<br><strong>The Banking Website Team</strong></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`;

  await sendEmail(email, subject, text, html);
}

async function sendTransactionEmail(first, name, amount, toUser) {
  if (typeof first === 'object' && first !== null) {
    return sendTransactionReceipt(first);
  }
  return sendTransactionReceipt({ email: first, name, amount, toUser });
}

module.exports = {
  sendRegistrationEmail,
  sendTransactionReceipt,
  sendTransactionFailed,
  sendTransactioFailed: sendTransactionFailed,
  sendTransactionEmail
};
