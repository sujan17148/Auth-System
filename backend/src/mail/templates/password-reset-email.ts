export const passwordResetEmailTemplate = (firstName: string, otp: string): string => `
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
Use the code below to continue.
</p>

<div style="
margin:35px auto;
display:inline-block;
padding:18px 36px;
background:#f3f4f6;
border:2px dashed #d1d5db;
border-radius:10px;
font-size:38px;
font-weight:bold;
letter-spacing:10px;
">
${otp}
</div>

<p style="color:#dc2626;font-weight:bold;">
This code expires in 2 minutes.
</p>

<p>
If you didn't request a password reset, simply ignore this email.
Your account remains secure.
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
