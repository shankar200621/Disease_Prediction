/** Animated flowing gradient text (split / shiny headline) */
export default function GradientText({ children, className = '', as: Tag = 'span' }) {
  return <Tag className={`text-gradient font-display ${className}`}>{children}</Tag>;
}
