<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice Notification</title>
</head>
<body style="font-family: Arial, sans-serif; background:#f2f3f7; margin:0; padding:20px;">

    <div style="max-width:650px; margin:0 auto; background:#ffffff; border-radius:10px; padding:30px; box-shadow:0 4px 14px rgba(0,0,0,0.08);">

        <h2 style="margin-top:0; font-size:26px; color:#222;">
            Your Invoice is Ready
        </h2>

        <p style="font-size:15px; color:#444; line-height:1.7;">
            Hello <?php echo e($transaction->user->name); ?>,<br><br>

            Thank you for choosing our services. We truly appreciate your trust and confidence in the work we do.<br><br>

            This is to notify you that the invoice for your recent service request has been successfully generated.
            A professionally formatted PDF copy of the invoice is attached to this email for your review.
            The document includes a detailed breakdown of the service provided, the applicable charges, and all relevant billing information.<br><br>

            Please take a few minutes to go through the invoice. If you have any questions, need clarification on any item,
            or believe an adjustment is required, feel free to reach out. Our team is always available to help and ensure everything is clear and accurate.<br><br>

            We kindly request that payment be completed within the stated due date to avoid any interruptions in your service.<br><br>

            Thank you once again for your continued support.
            We are grateful to have you, and we look forward to working with you again on future projects.
        </p>

        <p style="margin-top:30px; font-size:14px; color:#666;">
            Warm regards,<br>
            <strong><?php echo e(config("app.name")); ?></strong><br>
        </p>

    </div>
</body>
</html>
<?php /**PATH C:\Laravel projects\weshare\resources\views/emails/invoice-mail.blade.php ENDPATH**/ ?>