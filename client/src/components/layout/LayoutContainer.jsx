export default function LayoutContainer({ children, className = "", maxWidth = "1200px" }) {
  return (
    <div
      className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${className}`}
      style={{ maxWidth }}
    >
      {children}
    </div>
  );
}
