'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, FileText, Maximize2, Minimize2 } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Escribe tu contenido en Markdown...',
  label,
  required = false,
}: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const markdownPreview = (
    <div className="h-full overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-gray-100" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3 text-gray-900 dark:text-gray-100" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100" {...props} />,
            p: ({ node, ...props }) => <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300" {...props} />,
            li: ({ node, ...props }) => <li className="ml-4" {...props} />,
            code: ({ node, inline, ...props }: any) => {
              if (inline) {
                return (
                  <code className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 rounded text-sm font-mono" {...props} />
                );
              }
              return (
                <code className="block p-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm font-mono overflow-x-auto mb-4" {...props} />
              );
            },
            pre: ({ node, ...props }) => <pre className="mb-4" {...props} />,
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4" {...props} />
            ),
            a: ({ node, ...props }) => (
              <a className="text-indigo-600 dark:text-indigo-400 hover:underline" {...props} />
            ),
            strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900 dark:text-gray-100" {...props} />,
            em: ({ node, ...props }) => <em className="italic" {...props} />,
            hr: ({ node, ...props }) => <hr className="my-6 border-gray-300 dark:border-gray-600" {...props} />,
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600" {...props} />
              </div>
            ),
            th: ({ node, ...props }) => (
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-100 dark:bg-gray-700 font-semibold text-left" {...props} />
            ),
            td: ({ node, ...props }) => (
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2" {...props} />
            ),
          }}
        >
          {value || '*Escribe algo para ver la vista previa...*'}
        </ReactMarkdown>
      </div>
    </div>
  );

  const editorContent = (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-4 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl' : ''}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          {label && (
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('edit')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'edit' 
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Solo editor"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'split' 
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Vista dividida"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'preview' 
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Solo preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className={`flex-1 flex overflow-hidden ${viewMode === 'split' ? 'flex-col md:flex-row' : ''}`}>
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-full md:w-1/2 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700' : 'w-full'} flex flex-col`}>
            <textarea
              required={required}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="flex-1 w-full px-4 py-3 bg-white dark:bg-gray-800 border-0 text-gray-900 dark:text-gray-100 focus:outline-none resize-none font-mono text-sm leading-relaxed"
              style={{ minHeight: '300px' }}
            />
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
              💡 <strong>Tip:</strong> Usa Markdown para formatear. Ejemplos: **negrita**, *cursiva*, `código`, # Título
            </div>
          </div>
        )}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-full md:w-1/2' : 'w-full'} flex flex-col`}>
            {markdownPreview}
          </div>
        )}
      </div>
    </div>
  );

  return editorContent;
}

