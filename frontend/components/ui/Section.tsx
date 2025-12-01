import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export default function Section({ 
  children, 
  title, 
  description,
  className = '' 
}: SectionProps) {
  return (
    <section className={`mb-8 ${className}`}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm text-muted dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

