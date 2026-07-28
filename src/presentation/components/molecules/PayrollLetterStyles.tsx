export function PayrollLetterStyles() {
  return (
    <style jsx global>{`
      .payroll-letter-document {
        position: relative;
        box-sizing: border-box;
        background: #fff;
        color: #111;
        width: 100%;
        max-width: 210mm;
        min-height: auto;
        margin: 0 auto;
        padding: 25mm 20mm;
        font-family: "Times New Roman", Times, serif;
        font-size: 13px;
        line-height: 1.55;
        overflow: visible;
      }
      .payroll-letter-content {
        position: relative;
        z-index: 1;
      }
      .payroll-letter-logo-spacer {
        width: 72px;
        min-height: 72px;
        flex-shrink: 0;
      }
      .payroll-letter-date {
        margin: 0 0 20px;
        text-align: right;
        font-size: 12px;
      }
      .payroll-header-watermark {
        position: absolute;
        top: 0;
        left: 0;
        width: 72px;
        height: 72px;
        object-fit: contain;
        opacity: 0.16;
        z-index: 0;
        pointer-events: none;
        user-select: none;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .payroll-letter-document .contract-watermark {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: min(65%, 420px);
        max-height: 65%;
        object-fit: contain;
        opacity: 0.14;
        z-index: 0;
        pointer-events: none;
        user-select: none;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .payroll-letter-title {
        text-align: center;
        font-weight: bold;
        font-size: 15px;
        text-transform: uppercase;
        margin: 20px 0 16px;
        letter-spacing: 0.5px;
      }
      .payroll-letter-body {
        text-align: justify;
        margin-bottom: 12px;
      }
      .payroll-letter-body p {
        margin: 0 0 12px;
        text-indent: 0;
      }
      .payroll-letter-signature {
        margin-top: 48px;
        text-align: center;
      }
      .payroll-letter-signature-name {
        font-weight: bold;
        text-transform: uppercase;
        margin-bottom: 4px;
      }
      .payroll-letter-signature-role {
        font-size: 12px;
        margin: 0;
      }
      .payroll-letter-place {
        text-align: right;
        margin-top: 24px;
        font-size: 12px;
      }
      .payroll-header {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        margin-bottom: 8px;
        padding-bottom: 12px;
        border-bottom: 2px solid #111;
      }
      .payroll-header-text {
        flex: 1;
        min-width: 0;
      }
      .payroll-company-name {
        font-weight: bold;
        font-size: 15px;
        text-transform: uppercase;
        margin: 0 0 4px;
      }
      .payroll-company-meta {
        margin: 0;
        font-size: 12px;
      }
      @media print {
        .no-print {
          display: none !important;
        }
        .payroll-letter-document {
          max-width: 100% !important;
          width: 100% !important;
          min-height: auto !important;
          padding: 25mm 20mm !important;
          margin: 0 !important;
        }
        .payroll-header-watermark {
          position: fixed !important;
          top: 25mm !important;
          left: 20mm !important;
          width: 2.5cm !important;
          height: 2.5cm !important;
          opacity: 0.18 !important;
        }
        .payroll-letter-document .contract-watermark {
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          width: 14cm !important;
          max-width: 14cm !important;
          max-height: 14cm !important;
          opacity: 0.18 !important;
        }
      }
    `}</style>
  );
}
