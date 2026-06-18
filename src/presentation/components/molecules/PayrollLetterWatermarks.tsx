"use client";

interface PayrollLetterWatermarksProps {
  logoUrl?: string | null;
  /** Marca de agua superior absoluta (carta de trabajo). Amonestación usa logo en flujo. */
  showHeader?: boolean;
}

/** Marca de agua superior + central (folio) para cartas laborales. */
export function PayrollLetterWatermarks({ logoUrl, showHeader = true }: PayrollLetterWatermarksProps) {
  if (!logoUrl) return null;

  return (
    <>
      {showHeader && (
        <img
          src={logoUrl}
          alt=""
          aria-hidden
          className="payroll-header-watermark"
          crossOrigin="anonymous"
        />
      )}
      <img
        src={logoUrl}
        alt=""
        aria-hidden
        className="contract-watermark"
        crossOrigin="anonymous"
      />
    </>
  );
}
