import React from "react";

interface BrandLogoProps {
  collapsed?: boolean;
  compact?: boolean;
  showText?: boolean;
}

export default function BrandLogo({ collapsed = false, compact = false, showText = true }: BrandLogoProps) {
  const size = compact ? 44 : collapsed ? 36 : 44;
  return (
    <div className={`erp-brand ${showText && !collapsed ? "erp-brand-with-text" : "erp-brand-centered"}`}>
      <div
        className="erp-brand-mark"
        style={{ width: size, height: size }}
        aria-label="ERP Education CRM"
      >
        <div className="erp-brand-glow" />
        <div className="erp-brand-letter">E</div>
      </div>
      {showText && !collapsed && (
        <div className="erp-brand-copy">
          <p className="erp-brand-title">ERP</p>
          <p className="erp-brand-subtitle">EDUCATION CRM</p>
        </div>
      )}
    </div>
  );
}
