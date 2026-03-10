export default function LayoutShell({ children, className = "", maxWidth = "1400px" }) {
  return (
    <div
      className={`layout-shell w-full ${className}`}
      style={{ maxWidth }}
    >
      {children}
    </div>
  );
}
