export default function GlassCard({ children, className = '', hover = false, as: Tag = 'div', ...props }) {
  return (
    <Tag
      className={`glass ${hover ? 'glass-hover' : ''} p-6 ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
