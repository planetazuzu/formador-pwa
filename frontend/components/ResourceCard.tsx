'use client';

interface ResourceCardProps {
  title: string;
  type: string;
  url?: string;
  metadata?: any;
}

export default function ResourceCard({ title, type, url, metadata }: ResourceCardProps) {
  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tipo: {type}</p>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Ver recurso
        </a>
      )}
    </div>
  );
}

