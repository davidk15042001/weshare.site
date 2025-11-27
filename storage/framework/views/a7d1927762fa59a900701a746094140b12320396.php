<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Rechnung — LokalXperten</title>
  <style>
        /* styles.css
        Fixed A4-like invoice styling. Use print media when needed.
        */

        /* Page container sized for A4 portrait at 96dpi-ish; good for screen & print scaling */
        :root{
        --page-width: 794px; /* roughly 210mm at 96dpi */
        --page-padding: 44px;
        --muted: #666b6f;
        --accent: #0f2b60; /* dark blue similar to PDF headings */
        --border: #e4e7eb;
        --mono: "Helvetica Neue", Arial, sans-serif;
        }

        /* Page */
        body {
        font-family: var(--mono);
        background: #f6f7f9;
        padding: 32px;
        display: flex;
        justify-content: center;
        color: #1b1b1b;
        line-height: 1.4;
        }

        .page{
        width: var(--page-width);
        background: white;
        box-shadow: 0 6px 18px rgba(20,20,30,0.08);
        padding: var(--page-padding);
        box-sizing: border-box;
        margin-bottom: 24px;
        }

        /* Header */
        .invoice-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 24px;
        margin-bottom: 18px;
        }

        .branding {
        display: flex;
        gap: 18px;
        align-items: flex-start;
        }

        .logo {
        width: 110px;
        height: auto;
        object-fit: contain;
        border-radius: 4px;
        background: #fff;
        border: 1px solid var(--border);
        padding: 6px;
        }

        .company {
        font-size: 13px;
        color: var(--muted);
        }

        .company-name {
        margin: 0;
        font-size: 16px;
        color: var(--accent);
        font-weight: 700;
        letter-spacing: 0.1px;
        }

        /* invoice meta area on the right */
        .invoice-meta {
        text-align: right;
        font-size: 13px;
        color: var(--muted);
        min-width: 260px;
        }

        .meta-table {
        border-collapse: collapse;
        margin-top: 6px;
        width: 100%;
        font-size: 13px;
        }

        .meta-table td {
        padding: 3px 0;
        }

        .meta-table tr td:first-child {
        color: #333;
        font-weight: 600;
        padding-right: 8px;
        }

        /* Body titles */
        .title {
        margin: 6px 0 10px 0;
        color: var(--accent);
        font-size: 22px;
        letter-spacing: 0.2px;
        }

        /* content paragraphs */
        .greeting {
        margin: 8px 0 4px 0;
        font-weight: 600;
        }

        .lead {
        margin: 0 0 14px 0;
        color: #222;
        font-size: 14px;
        }

        /* Items Table */
        .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 12px;
        font-size: 13px;
        }

        .items-table thead th {
        text-align: left;
        padding: 10px 8px;
        border-bottom: 2px solid var(--border);
        font-weight: 700;
        color: #222;
        background: transparent;
        }

        .items-table td {
        padding: 10px 8px;
        border-bottom: 1px solid var(--border);
        vertical-align: top;
        }

        .col-pos { width: 5%; }
        .col-desc { width: 60%; }
        .col-qty { width: 8%; text-align: right; }
        .col-unit { width: 12%; text-align: right; }
        .col-total { width: 15%; text-align: right; font-weight: 600; }

        /* Totals block aligned to right */
        .totals {
        width: 320px;
        margin-left: auto;
        margin-top: 12px;
        border-top: 1px solid var(--border);
        padding-top: 8px;
        font-size: 14px;
        }

        .totals-row {
        display: flex;
        justify-content: space-between;
        padding: 6px 4px;
        color: var(--muted);
        }

        .totals-row.grand-total {
        font-size: 16px;
        color: #111;
        font-weight: 700;
        }

        /* Notes and bank details */
        .notes {
        margin-top: 18px;
        font-size: 13px;
        color: var(--muted);
        }

        .notes h3 {
        margin: 0 0 6px 0;
        font-size: 14px;
        color: var(--accent);
        }

        .bank {
        margin-top: 6px;
        font-weight: 600;
        color: #111;
        }

        /* Footer */
        .invoice-footer {
        margin-top: 28px;
        padding-top: 12px;
        border-top: 1px dashed var(--border);
        font-size: 12px;
        color: var(--muted);
        }

        /* Print-friendly adjustments */
        @media  print {
        body { background: white; padding: 0; }
        .page { box-shadow: none; margin: 0; width: 100%; padding: 28mm; }
        .logo { background: none; border: none; padding: 0; }
        }

  </style>
</head>
<body>
  <div class="page">
    <header class="invoice-header">
      <div class="branding">
        <!-- Place your logo file at assets/logo.png or update src -->
        <img src="<?php echo e(asset("assets/images/weShareSite.png")); ?>" alt="<?php echo e(config("app.name")); ?> Logo" class="logo" />
        <div class="company">
          <h1 class="company-name"><?php echo e(config("app.name")); ?></h1>
          <address>
            <?php echo config("services.company.address"); ?>

          </address>
          <div class="contact">
            Email: <a href="mailto:<?php echo e(config("mail.support.address")); ?>"><?php echo e(config("mail.support.address")); ?></a><br/>
            USt-IdNr.: <?php echo e(config("services.company.tax_id")); ?>

          </div>
        </div>
      </div>

      <div class="invoice-meta">
        <div class="bill-to">
          <strong>Abs.:</strong> <?php echo e(config("app.name")); ?>, <?php echo e(config("services.company.address")); ?>

          <div class="client">
            <strong>An:</strong><br/>
            <span class="client-name"><?php echo e($transaction->user->name); ?></span><br/>
           <?php echo $transaction->user->address; ?>

          </div>
        </div>

        <table class="meta-table" aria-hidden="true">
          <tr>
            <td><strong>Rechnungs-Nr.</strong></td>
            <td><?php echo e($transaction->transaction_code); ?></td>
          </tr>
          <tr>
            <td><strong>Kunden-Nr.</strong></td>
            <td><?php echo e($transaction->user->id); ?></td>
          </tr>
          <tr>
            <td><strong>Datum</strong></td>
            <td><?php echo e(date("d.m.Y", strtotime($transaction->updated_at))); ?></td>
          </tr>
          <tr>
            <td><strong>Leistung</strong></td>
            <td><?php echo e(translate($transaction->transaction_source)); ?></td>
          </tr>
        </table>
      </div>
    </header>

    <main class="invoice-body">
      <h2 class="title">Rechnung</h2>

      <p class="greeting">
        Sehr geehrte <?php echo e($transaction->user->name); ?>,
      </p>

      <p class="lead">
        Vielen Dank, dass Sie unseren Service genutzt haben. Hier ist die Rechnung für Ihren Kauf.
      </p>

      <section class="items">
        <table class="items-table" role="table">
          <thead>
            <tr>
              <th class="col-pos">Pos.</th>
              <th class="col-desc">Dienstleistung</th>
              <th class="col-qty">Menge</th>
              <th class="col-unit">Preis pro Einheit</th>
              <th class="col-total">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="col-pos">1</td>
              <td class="col-desc">
                <?php echo $transaction->narration; ?>

              </td>
              <td class="col-qty"><?php echo e($transaction->quantity); ?></td>
              <td class="col-unit"><?php echo e($transaction->currency); ?><?php echo e($transaction->plan->price); ?></td>
              <td class="col-total"><?php echo e($transaction->currency); ?><?php echo e($transaction->plan->price * $transaction->quantity); ?></td>
            </tr>
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row">
            <span>Summe exkl. MwSt.</span>
            <span><?php echo e($transaction->currency); ?><?php echo e($transaction->plan->price * $transaction->quantity); ?></span>
          </div>
          <div class="totals-row">
            <span>MwSt</span>
            <span><?php echo e($transaction->currency); ?><?php echo e($transaction->vat); ?></span>
          </div>
          <div class="totals-row grand-total">
            <span>Gesamtbetrag</span>
            <span><?php echo e($transaction->currency); ?><?php echo e(($transaction->plan->price * $transaction->quantity) + $transaction->vat); ?></span>
          </div>
        </div>
      </section>

      
    </main>

    <footer class="invoice-footer">
      
    </footer>
  </div>
</body>
</html>
<?php /**PATH C:\Laravel projects\weshare\resources\views/pdf/subscription-receipt.blade.php ENDPATH**/ ?>