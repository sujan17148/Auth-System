export const welcomeEmailTemplate = (firstName: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Welcome to Auth System</title>
</head>

<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
<tr>
<td align="center">

<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:40px;border-radius:12px;">

<tr>
<td align="center">
<h1 style="margin:0;">🎉 Welcome to Auth System</h1>
</td>
</tr>

<tr>
<td style="padding-top:35px;">

<p>Hello ${firstName},</p>

<p>
Welcome aboard! Your account has been successfully created and you're all set to start using Auth System.
</p>

<p>
You can now securely sign in, manage your account, and access all available features.
</p>

<div style="text-align:center;margin:40px 0;">
<span
  style="
    display:inline-block;
    background:#ecfdf5;
    color:#166534;
    padding:14px 32px;
    border-radius:8px;
    font-weight:bold;
    font-size:16px;
  "
>
✓ Account Ready
</span>
</div>

<p>
If you have any questions or run into any issues, we're always happy to help.
</p>

<p>
Thank you for choosing Auth System. We hope you enjoy your experience!
</p>

<p style="margin-top:30px;">
Best regards,<br />
<strong>The Auth System Team</strong>
</p>

</td>
</tr>

<tr>
<td style="padding-top:40px;border-top:1px solid #e5e7eb;">
<p style="font-size:13px;color:#9ca3af;text-align:center;">
© ${new Date().getFullYear()} Auth System. All rights reserved.
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
