interface LiquidGlassProps {
  size?: number;
  tint?: string; // CSS color value for the tint overlay
  children?: React.ReactNode;
  className?: string;
  blur?: "sm" | "md" | "lg" | "xl";
}

export function LiquidGlass({ 
  size = 120, 
  tint = "rgba(255, 255, 255, 0.1)", // Default subtle white tint
  children,
  className = "",
  blur = "xl"
}: LiquidGlassProps) {
  const blurAmount = {
    sm: "blur(8px)",
    md: "blur(12px)",
    lg: "blur(16px)",
    xl: "blur(20px)",
  }[blur];

  return (
    <div
      className={`relative rounded-full ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      {/* Main glass circle */}
      <div
        className="absolute inset-0 rounded-full border border-white/20"
        style={{
          background: tint,
          backdropFilter: blurAmount,
          WebkitBackdropFilter: blurAmount,
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1)
          `,
        }}
      />
      
      {/* Highlight gradient for 3D effect */}
      <div 
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 50%)
          `,
        }}
      />
      
      {/* Content */}
      {children && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          {children}
        </div>
      )}
    </div>
  );
}
