<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Subscription Activated</title></head>
<body style="font-family:sans-serif;color:#1f2937;max-width:520px;margin:0 auto;padding:32px 16px;">
  <h2 style="color:#059669;">Subscription Activated!</h2>
  <p>Hi {{ $schoolName }},</p>
  <p>Your <strong>{{ ucfirst($plan) }} Plan</strong> subscription has been activated. ₱{{ number_format($amount) }} has been charged.</p>
  <p>Your next billing date is <strong>{{ $nextBilling->format('F j, Y') }}</strong>.</p>
  <p>Thank you for subscribing to Borrowix!</p>
</body>
</html>