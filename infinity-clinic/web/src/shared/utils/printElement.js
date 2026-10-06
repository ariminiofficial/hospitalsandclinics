/**
 * Universal isolated document printer
 * Spawns an isolated invisible iframe to print ONLY the document itself,
 * guaranteeing zero modal chrome, zero background webpage artifacts, and exact 1-page A4 fitting.
 */
export function printElement(element, docTitle = 'Tax Invoice / Receipt') {
  if (!element) {
    window.print();
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${docTitle}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 14mm 12mm 14mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
            font-size: 12px !important;
            line-height: 1.4 !important;
          }

          .print-document {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
            border: none !important;
            box-shadow: none !important;
          }

          /* ===== MEDICAL TAX INVOICE STYLES ===== */
          .invoice-header {
            border-bottom: 2px solid #0f172a;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .invoice-header-top {
            display: flex;
            align-items: center;
            gap: 14px;
          }
          .invoice-brand-badge {
            width: 42px;
            height: 42px;
            background: #0c4a44;
            color: #ffffff;
            font-size: 28px;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            flex-shrink: 0;
            line-height: 1;
          }
          .invoice-brand-details {
            flex: 1;
          }
          .invoice-clinic-name {
            font-size: 21px;
            font-weight: 800;
            color: #0c4a44;
            margin: 0 0 2px 0;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            line-height: 1.15;
          }
          .invoice-clinic-tagline {
            font-size: 11.5px;
            font-weight: 600;
            color: #334155;
            margin: 0 0 2px 0;
          }
          .invoice-clinic-address {
            font-size: 10.5px;
            color: #64748b;
            margin: 0 0 2px 0;
            line-height: 1.35;
          }
          .invoice-clinic-legal {
            font-size: 10px;
            color: #475569;
            margin: 0;
            background: #f1f5f9;
            padding: 2px 6px;
            border-radius: 4px;
            display: inline-block;
          }

          .invoice-doc-title-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #0f172a;
            color: #ffffff;
            padding: 6px 12px;
            border-radius: 4px;
            margin-bottom: 12px;
          }
          .invoice-title-text {
            font-weight: 800;
            font-size: 13px;
            letter-spacing: 0.08em;
            color: #ffffff;
          }
          .invoice-copy-badge {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.05em;
            background: rgba(255, 255, 255, 0.2);
            color: #ffffff;
            padding: 2px 8px;
            border-radius: 4px;
          }

          .invoice-meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 12px;
          }
          .invoice-meta-card {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 5px;
            padding: 8px 12px;
          }
          .meta-card-title {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #475569;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 3px;
            margin-bottom: 5px;
          }
          .invoice-meta-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 2px 0;
            font-size: 11.5px;
            line-height: 1.35;
          }
          .meta-label {
            color: #64748b;
            font-weight: 500;
          }
          .meta-value {
            color: #0f172a;
            text-align: right;
          }
          .doc-code {
            font-family: monospace;
            font-size: 11.5px;
            background: #e2e8f0;
            padding: 1px 5px;
            border-radius: 3px;
            color: #0f172a;
            font-weight: 600;
          }
          .invoice-badge-paid {
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.05em;
            background: #dcfce7;
            color: #15803d;
            padding: 1px 6px;
            border-radius: 10px;
            border: 1px solid #bbf7d0;
            margin-left: 6px;
          }

          .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
            font-size: 11.5px;
          }
          .invoice-table th {
            background: #f1f5f9;
            color: #0f172a;
            border: 1px solid #cbd5e1;
            padding: 6px 8px;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 10.5px;
            letter-spacing: 0.03em;
          }
          .invoice-table td {
            border: 1px solid #cbd5e1;
            padding: 6px 8px;
            color: #1e293b;
            line-height: 1.35;
          }
          .table-subtext {
            font-size: 10px;
            color: #64748b;
            margin-top: 1px;
          }
          .invoice-subtotal-row td {
            background: #f8fafc;
            border-top: 1px solid #cbd5e1;
            padding: 4px 8px;
          }
          .invoice-tax-row td {
            background: #f8fafc;
            padding: 4px 8px;
          }
          .invoice-total-row td {
            background: #e6f4f1;
            border-top: 2px solid #0c4a44;
            border-bottom: 2px solid #0c4a44;
            padding: 8px;
            color: #0c4a44;
          }

          .invoice-amount-words {
            font-size: 11px;
            padding: 6px 10px;
            background: #f8fafc;
            border: 1px dashed #94a3b8;
            border-radius: 4px;
            margin-bottom: 12px;
            color: #0f172a;
            display: flex;
            gap: 6px;
          }
          .words-label {
            font-weight: 700;
            color: #475569;
          }
          .words-val {
            font-weight: 600;
            color: #0f172a;
          }

          .invoice-footer-grid {
            display: grid;
            grid-template-columns: 1.4fr 1fr;
            gap: 16px;
            align-items: flex-end;
            margin-bottom: 10px;
          }
          .terms-title {
            font-size: 10.5px;
            font-weight: 700;
            text-transform: uppercase;
            color: #334155;
            margin-bottom: 3px;
          }
          .terms-list {
            margin: 0;
            padding-left: 14px;
            font-size: 9.5px;
            color: #64748b;
            line-height: 1.4;
          }
          .invoice-sign-box {
            text-align: center;
            border: 1px solid #e2e8f0;
            background: #fafafa;
            border-radius: 4px;
            padding: 8px 12px;
          }
          .sign-clinic-header {
            font-size: 10.5px;
            font-weight: 700;
            color: #0f172a;
          }
          .sign-spacer {
            height: 38px;
          }
          .sign-line {
            border-top: 1px solid #0f172a;
            font-weight: 700;
            font-size: 11px;
            padding-top: 3px;
            color: #0f172a;
          }
          .sign-clinic {
            font-size: 10px;
            color: #64748b;
          }
          .invoice-bottom-msg {
            text-align: center;
            font-size: 9.5px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 6px;
            font-style: italic;
          }

          /* Prescription (Rx) Styles */
          .rx-doc-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
          }
          .rx-clinic-name {
            font-size: 19px;
            font-weight: 800;
            color: #0c4a44;
            margin: 0 0 2px 0;
            text-transform: uppercase;
          }
          .rx-clinic-tagline {
            font-size: 11.5px;
            font-weight: 600;
            color: #475569;
            margin: 0 0 2px 0;
          }
          .rx-clinic-contact {
            font-size: 10.5px;
            color: #64748b;
            margin: 0;
          }
          .rx-doctor-info {
            text-align: right;
          }
          .rx-doc-name {
            font-size: 15px;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 2px 0;
          }
          .rx-doc-spec {
            font-size: 11.5px;
            font-weight: 600;
            color: #0c4a44;
            margin: 0 0 2px 0;
          }
          .rx-doc-reg {
            font-size: 10.5px;
            color: #64748b;
            margin: 0;
          }
          .rx-header-divider {
            border-bottom: 2px solid #0f172a;
            margin-bottom: 12px;
          }
          .rx-patient-bar {
            display: grid;
            grid-template-columns: 1.5fr 1fr 1fr 1fr;
            gap: 10px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 6px 10px;
            border-radius: 4px;
            font-size: 11px;
            margin-bottom: 12px;
          }
          .rx-p-field .p-label {
            color: #64748b;
            margin-right: 4px;
          }
          .rx-clinical-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 6px 10px;
            border-radius: 4px;
            font-size: 11.5px;
            margin-bottom: 12px;
          }
          .rx-clin-row {
            padding: 2px 0;
          }
          .rx-clin-row .clin-label {
            color: #64748b;
            margin-right: 6px;
            font-weight: 500;
          }
          .rx-symbol-bar {
            display: flex;
            align-items: center;
            gap: 6px;
            margin: 10px 0 6px 0;
          }
          .rx-symbol {
            font-family: serif;
            font-size: 24px;
            font-weight: 900;
            color: #0c4a44;
            line-height: 1;
          }
          .rx-symbol-label {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #0f172a;
          }
          .rx-medicines-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
            font-size: 11.5px;
          }
          .rx-medicines-table th {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 5px 6px;
            font-weight: 700;
            text-align: left;
            font-size: 10.5px;
          }
          .rx-medicines-table td {
            border: 1px solid #cbd5e1;
            padding: 5px 6px;
          }
          .rx-investigations-box {
            margin: 12px 0;
            padding: 6px 10px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            font-size: 11px;
          }
          .inv-title {
            font-weight: 700;
            margin-bottom: 3px;
            color: #0f172a;
          }
          .inv-list {
            margin: 0;
            padding-left: 16px;
          }
          .rx-advice-box {
            margin: 12px 0;
            padding: 6px 10px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            font-size: 11px;
          }
          .advice-title {
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 2px;
          }
          .advice-text {
            margin: 0;
            color: #1e293b;
          }
          .rx-signature-container {
            display: grid;
            grid-template-columns: 1.4fr 1fr;
            gap: 16px;
            align-items: flex-end;
            margin-top: 18px;
            margin-bottom: 10px;
          }
          .rx-footer-note {
            font-size: 9.5px;
            color: #64748b;
            line-height: 1.35;
          }
          .rx-footer-note p {
            margin: 0 0 2px 0;
          }
          .rx-doctor-sign {
            text-align: center;
          }
          .rx-doctor-sign .sign-line {
            border-top: 1px solid #0f172a;
            font-weight: 700;
            font-size: 11px;
            padding-top: 2px;
            color: #0f172a;
          }
          .rx-doctor-sign .sign-qual {
            font-size: 10px;
            color: #64748b;
          }
          .rx-bottom-tagline {
            text-align: center;
            font-size: 9.5px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 6px;
          }
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
    </html>
  `);
  doc.close();

  iframe.contentWindow.focus();
  setTimeout(() => {
    iframe.contentWindow.print();
    setTimeout(() => {
      try {
        document.body.removeChild(iframe);
      } catch (e) {}
    }, 2000);
  }, 300);
}
