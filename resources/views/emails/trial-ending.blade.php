<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Trial Ending Soon</title></head>
<body style="font-family:sans-serif;color:#1f2937;max-width:520px;margin:0 auto;padding:32px 16px;">
  <h2 style="color:#D97706;">Your trial ends in {{ $daysRemaining }} {{ Str::plural('day', $daysRemaining) }}</h2>
  <p>Hi {{ $schoolName }},</p>
  <p>Your 14-day free trial on <strong>Borrowix</strong> will expire in <strong>{{ $daysRemaining }} {{ Str::plural('day', $daysRemaining) }}</strong>.</p>
  <p>To continue using the system without interruption, please subscribe before your trial ends.</p>
  <p style="margin:24px 0;">
    <a href="{{ $loginUrl ?? '#' }}" style="background:#D97706;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">Subscribe Now</a>
  </p>
  <p style="font-size:12px;color:#6b7280;">If you have questions, reply to this email or contact your Borrowix representative.</p>
</body>
</html>