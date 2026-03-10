export default function Section({ children, className = "", as = "section" }) {
  const Tag = as;
  return <Tag className={`section-stack ${className}`}>{children}</Tag>;
}
