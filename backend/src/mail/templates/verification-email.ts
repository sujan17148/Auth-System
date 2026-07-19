export const verificationEmailTemplate = (firstName: string, otp: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your email</title>
</head>

<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:40px 20px;">
<tr>
<td align="center">

<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:12px;padding:40px;max-width:600px;">

<tr>
<td align="center">
<h1 style="margin:0;font-size:28px;color:#111827;">
Auth System
</h1>

<p style="margin:8px 0 0;color:#6b7280;">
Secure Authentication
</p>
</td>
</tr>

<tr>
<td style="padding-top:40px;">
<p style="margin:0;font-size:18px;">
Hi ${firstName},
</p>

<p style="margin:20px 0;font-size:16px;line-height:1.7;color:#374151;">
Thank you for creating your account.
Use the verification code below to verify your email address.
</p>
</td>
</tr>

<tr>
<td align="center" style="padding:20px 0 30px;">
<div style="
display:inline-block;
padding:18px 36px;
background:#f3f4f6;
border:2px dashed #d1d5db;
border-radius:10px;
font-size:38px;
font-weight:bold;
letter-spacing:10px;
color:#111827;
">
${otp}
</div>
</td>
</tr>

<tr>
<td>
<p style="margin:0;color:#dc2626;font-weight:bold;">
This code expires in 2 minutes.
</p>

<p style="margin-top:20px;color:#6b7280;line-height:1.7;">
If you didn't create an account, you can safely ignore this email.
No further action is required.
</p>
</td>
</tr>

<tr>
<td style="padding-top:40px;border-top:1px solid #e5e7eb;">
<p style="margin:0;color:#9ca3af;font-size:13px;text-align:center;">
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
