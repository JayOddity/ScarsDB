import type { ElementType } from 'react';

interface SectionDividerProps {
  label?: string;
  className?: string;
  as?: ElementType;
  labelClassName?: string;
}

export default function SectionDivider({
  label,
  className = 'mb-4',
  as: LabelTag = 'div',
  labelClassName = 'text-center font-heading text-xs text-honor-gold tracking-widest uppercase mb-1',
}: SectionDividerProps) {
  return (
    <div className={className}>
      {label && <LabelTag className={labelClassName}>{label}</LabelTag>}
      <div className="diamond-divider">
        <span className="diamond" />
      </div>
    </div>
  );
}
