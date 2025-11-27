<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <title>Rechnung</title>

    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            color: #1b1b1b;
            margin: 0;
            padding: 0;
        }

        .page {
            width: 100%;
            padding: 25px 35px;
            box-sizing: border-box;
        }

        h1, h2, h3, h4 {
            margin: 0;
            padding: 0;
        }

        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .mt-10 { margin-top: 10px; }
        .mt-20 { margin-top: 20px; }
        .mb-5  { margin-bottom: 5px; }
        .mb-10 { margin-bottom: 10px; }
        .mb-15 { margin-bottom: 15px; }
        .mb-20 { margin-bottom: 20px; }

        /* Safe Table Layout */
        table {
            width: 100%;
            border-collapse: collapse;
        }

        .bordered td,
        .bordered th {
            border: 1px solid #ddd;
            padding: 6px;
        }

        /* Header styling */
        .branding-table td {
            vertical-align: top;
        }

        .logo {
            width: 90px;
            height: auto;
        }

        .company-info {
            font-size: 12px;
            color: #555;
        }

        .meta-table td {
            padding: 3px 0;
        }

        .meta-label {
            font-weight: bold;
            color: #333;
            width: 120px;
        }

        /* Items table */
        .items-table th {
            background: #f2f2f2;
            font-weight: bold;
            border: 1px solid #ccc;
            padding: 8px;
        }

        .items-table td {
            border: 1px solid #ccc;
            padding: 8px;
        }

        /* Totals */
        .totals-table {
            width: 300px;
            float: right;
            margin-top: 10px;
        }

        .totals-table td {
            padding: 6px;
            border: 1px solid #ddd;
        }

        .totals-table .label {
            font-weight: bold;
        }

        /* Footer */
        .footer {
            margin-top: 40px;
            font-size: 11px;
            color: #777;
            border-top: 1px dashed #ccc;
            padding-top: 10px;
            text-align: center;
        }
    </style>
</head>

<body>
<div class="page">

    <!-- HEADER -->
    <table class="branding-table">
        <tr>
            <td width="120">
                <img src="<?php echo e(public_path('assets/images/weShareSite.png')); ?>" class="logo" alt="Logo">
            </td>

            <td class="company-info">
                <h2 style="color:#0f2b60; font-size:18px; margin-bottom:5px;">
                    <?php echo e(config('app.name')); ?>

                </h2>

                <?php echo config('services.company.address'); ?><br>
                Email: <?php echo e(config('mail.support.address')); ?><br>
                USt-IdNr.: <?php echo e(config('services.company.tax_id')); ?>

            </td>

            <td class="text-right company-info">
                <strong>Abs.:</strong> <?php echo e(config('app.name')); ?><br>
                <?php echo config('services.company.address'); ?><br><br>

                <strong>An:</strong><br>
                <?php echo e($transaction->user->name); ?><br>
                <?php echo $transaction->user->address; ?>

            </td>
        </tr>
    </table>

    <br>

    <!-- INVOICE META -->
    <table class="meta-table mt-10">
        <tr>
            <td class="meta-label">Rechnungs-Nr.:</td>
            <td><?php echo e($transaction->transaction_code); ?></td>
        </tr>
        <tr>
            <td class="meta-label">Kunden-Nr.:</td>
            <td><?php echo e($transaction->user->id); ?></td>
        </tr>
        <tr>
            <td class="meta-label">Datum:</td>
            <td><?php echo e(date('d.m.Y', strtotime($transaction->updated_at))); ?></td>
        </tr>
        <tr>
            <td class="meta-label">Leistung:</td>
            <td><?php echo e(translate($transaction->transaction_source)); ?></td>
        </tr>
    </table>

    <h2 class="mt-20" style="color:#0f2b60;">Rechnung</h2>

    <p class="mt-10">
        Sehr geehrte/r <?php echo e($transaction->user->name); ?>,<br><br>
        Vielen Dank, dass Sie unseren Service genutzt haben.
        Hier ist die Rechnung für Ihren Kauf.
    </p>

    <!-- ITEMS TABLE -->
    <table class="items-table mt-20">
        <thead>
            <tr>
                <th width="40">Pos.</th>
                <th>Dienstleistung</th>
                <th width="60">Menge</th>
                <th width="100">Preis</th>
                <th width="100">Total</th>
            </tr>
        </thead>

        <tbody>
            <tr>
                <td>1</td>
                <td><?php echo $transaction->narration; ?></td>
                <td><?php echo e($transaction->quantity); ?></td>
                <td><?php echo e($transaction->currency); ?><?php echo e($transaction->plan->price); ?></td>
                <td><?php echo e($transaction->currency); ?><?php echo e($transaction->plan->price * $transaction->quantity); ?></td>
            </tr>
        </tbody>
    </table>

    <!-- TOTALS -->
    <table class="totals-table">
        <tr>
            <td class="label">Summe exkl. MwSt.</td>
            <td><?php echo e($transaction->currency); ?><?php echo e($transaction->plan->price * $transaction->quantity); ?></td>
        </tr>
        <tr>
            <td class="label">MwSt.</td>
            <td><?php echo e($transaction->currency); ?><?php echo e($transaction->vat); ?></td>
        </tr>
        <tr>
            <td class="label">Gesamtbetrag</td>
            <td><strong><?php echo e($transaction->currency); ?><?php echo e(($transaction->plan->price * $transaction->quantity) + $transaction->vat); ?></strong></td>
        </tr>
    </table>

    <div style="clear: both;"></div>

    <!-- FOOTER -->
    <div class="footer">
        <?php echo e(config('app.name')); ?> – <?php echo e(config('services.company.address')); ?>

        | Email: <?php echo e(config('mail.support.address')); ?>

    </div>

</div>
</body>
</html>
<?php /**PATH C:\Laravel projects\weshare\resources\views/pdf/subscription-receipt.blade.php ENDPATH**/ ?>