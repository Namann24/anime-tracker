export default function ActionBar({ children, className = "" }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 md:gap-3 ${className}`}>
      {children}
    </div>
  );
}
