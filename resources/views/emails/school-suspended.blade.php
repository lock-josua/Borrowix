<!DOCTYPE html>
<html lang="en">
<head>  
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your School Has Been Suspended — Borrowix</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap');
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #EDEDE8; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #EDEDE8; padding: 48px 16px;">
        <tr>
            <td align="center">
                <table width="580" cellpadding="0" cellspacing="0" style="max-width: 580px; width: 100%;">

                    <!-- ── LOGO BAR ── -->
                    <tr>
                        <td align="center" style="padding-bottom: 28px;">
                            <table cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="background-color: #111110; border-radius: 10px; padding: 10px 22px;">
                                        <span style="font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; letter-spacing: 0.08em; color: #ffffff; text-transform: uppercase;">Borrowix</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- ── MAIN CARD ── -->
                    <tr>
                        <td style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 24px rgba(0,0,0,0.07);">

                            <!-- Hero band -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #111110 0%, #2a2a28 100%); padding: 48px 48px 40px;">
                                        <!-- Decorative line accent -->
                                        <table cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                                            <tr>
                                                <td style="width: 36px; height: 3px; background-color: #C8F04A; border-radius: 2px;"></td>
                                                <td style="width: 10px; height: 3px;"></td>
                                                <td style="width: 12px; height: 3px; background-color: rgba(200,240,74,0.35); border-radius: 2px;"></td>
                                            </tr>
                                        </table>
                                        <h1 style="margin: 0 0 10px; font-family: 'DM Serif Display', Georgia, serif; font-size: 32px; font-weight: 400; color: #ffffff; line-height: 1.2; letter-spacing: -0.3px;">
                                            Your school has<br>been suspended.
                                        </h1>
                                        <p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.55); line-height: 1.6;">
                                            Your school account has been temporarily suspended.<br>Please review the details below.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Details section -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding: 36px 48px 0;">

                                        <!-- Label: Suspension Details -->
                                        <p style="margin: 0 0 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #9b9b93;">Suspension Details</p>

                                        <!-- Row 1: School Name -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom: 1px solid #F0F0EC; padding-bottom: 16px; margin-bottom: 16px;">
                                            <tr>
                                                <td>
                                                    <p style="margin: 0 0 3px; font-size: 11px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; color: #b0b0a8;">School Name</p>
                                                    <p style="margin: 0; font-size: 16px; font-weight: 600; color: #111110;">{{ $schoolName }}</p>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Row 2: Reason -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom: 1px solid #F0F0EC; padding-bottom: 16px; margin-bottom: 16px;">
                                            <tr>
                                                <td>
                                                    <p style="margin: 0 0 3px; font-size: 11px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; color: #b0b0a8;">Reason</p>
                                                    <p style="margin: 0; font-size: 16px; font-weight: 600; color: #111110;">{{ $reason }}</p>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Row 3: Contact -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                                            <tr>
                                                <td>
                                                    <p style="margin: 0 0 3px; font-size: 11px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; color: #b0b0a8;">Admin Email</p>
                                                    <p style="margin: 0; font-size: 16px; font-weight: 600; color: #111110;">{{ $adminEmail }}</p>
                                                </td>
                                            </tr>
                                        </table>

                                    </td>
                                </tr>
                            </table>

                            <!-- Support section -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="background-color: #F7F7F3; border-top: 1px solid #EBEBE5; padding: 28px 48px 32px;">
                                        <p style="margin: 0; font-size: 14px; color: #6b6b63; line-height: 1.6;">
                                            If you believe this was done in error or need to resolve the issue, please contact our support team. All logged-in users have been signed out of the school portal.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- ── FOOTER ── -->
                    <tr>
                        <td style="padding: 28px 0 0;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <p style="margin: 0 0 6px; font-size: 12px; color: #9b9b93;">
                                            &copy; {{ date('Y') }} Borrowix. All rights reserved.
                                        </p>
                                        <p style="margin: 0; font-size: 12px; color: #b8b8b0;">
                                            This email was sent because your school account was suspended.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

</body>
</html>
