<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Trial Expired</title></head>
<body style="font-family:sans-serif;color:#1f2937;max-width:520px;margin:0 auto;padding:32px 16px;">
  <h2 style="color:#DC2626;">Your trial has expired</h2>
  <p>Hi {{ $schoolName }},</p>
  <p>Your 14-day free trial on <strong>Borrowix</strong> has expired. Your staff and students can no longer access the system until you subscribe.</p>
  <p style="margin:24px 0;">
    <a href="{{ $loginUrl ?? '#' }}" style="background:#D97706;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">Subscribe Now</a>
  </p>
  <p style="font-size:12px;color:#6b7280;">Log in as admin to choose a plan and restore access for your school.</p>
</body>
</html>