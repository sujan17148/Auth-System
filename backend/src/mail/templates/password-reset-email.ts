export const passwordResetEmailTemplate = (firstName: string, resetLink: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Reset Password</title>
</head>

<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
<tr>
<td align="center">

<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#fff;padding:40px;border-radius:12px;">

<tr>
<td align="center">
<h1 style="margin:0;">Auth System</h1>
</td>
</tr>

<tr>
<td style="padding-top:35px;">

<p>Hello ${firstName},</p>

<p>
We received a request to reset your password.
Click the button below to create a new password.
</p>

<div style="text-align:center;margin:40px 0;">
<a
  href="${resetLink}"
  style="
    display:inline-block;
    background:#2563eb;
    color:#ffffff;
    text-decoration:none;
    padding:14px 32px;
    border-radius:8px;
    font-weight:bold;
    font-size:16px;
  "
>
Reset Password
</a>
</div>

<p style="font-weight:bold;color:#dc2626;">
This link expires in 5 minutes and can only be used once.
</p>

<p style="font-size:14px;color:#4b5563;">
If the button doesn't work, copy and paste the following link into your browser:
</p>

<p style="word-break:break-all;font-size:13px;color:#2563eb;">
${resetLink}
</p>

<p>
If you didn't request a password reset, you can safely ignore this email.
Your password will remain unchanged.
</p>

</td>
</tr>

<tr>
<td style="padding-top:40px;border-top:1px solid #e5e7eb;">
<p style="font-size:13px;color:#9ca3af;text-align:center;">
© ${new Date().getFullYear()} Auth System
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
