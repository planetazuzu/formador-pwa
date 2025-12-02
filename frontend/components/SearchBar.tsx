'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { db, Activity, Resource, Session } from '@/lib/db';

export interface SearchResult {
  type: 'activity' | 'resource' | 'session';
  id: string;
  title: string;
  description?: string;
  url: string;
}

interface SearchBarProps {
  onResultClick?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ onResultClick, placeholder = 'Buscar...', className = '' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const performSearch = async () => {
      setIsSearching(true);
      setIsOpen(true);

      try {
        const searchTerm = query.toLowerCase().trim();
        const allResults: SearchResult[] = [];

        // Buscar en actividades
        const activities = await db.activities.toArray();
        activities.forEach((activity) => {
          const titleMatch = activity.title.toLowerCase().includes(searchTerm);
          const contentMatch = JSON.stringify(activity.content).toLowerCase().includes(searchTerm);
          
          if (titleMatch || contentMatch) {
            allResults.push({
              type: 'activity',
              id: activity.activityId,
              title: activity.title,
              description: (activity.content as any)?.description || '',
              url: `/admin/activities/${activity.activityId}`,
            });
          }
        });

        // Buscar en recursos
        const resources = await db.resources.toArray();
        resources.forEach((resource) => {
          const titleMatch = resource.title.toLowerCase().includes(searchTerm);
          const descriptionMatch = (resource.description || '').toLowerCase().includes(searchTerm);
          
          if (titleMatch || descriptionMatch) {
            allResults.push({
              type: 'resource',
              id: resource.resourceId,
              title: resource.title,
              description: resource.description,
              url: `/admin/resources/${resource.resourceId}`,
            });
          }
        });

        // Buscar en sesiones
        const sessions = await db.sessions.toArray();
        sessions.forEach((session) => {
          const titleMatch = session.title.toLowerCase().includes(searchTerm);
          const descriptionMatch = (session.description || '').toLowerCase().includes(searchTerm);
          
          if (titleMatch || descriptionMatch) {
            allResults.push({
              type: 'session',
              id: session.sessionId,
              title: session.title,
              description: session.description,
              url: `/admin/sessions/${session.sessionId}`,
            });
          }
        });

        // Ordenar por relevancia (títulos primero)
        allResults.sort((a, b) => {
          const aTitleMatch = a.title.toLowerCase().startsWith(searchTerm);
          const bTitleMatch = b.title.toLowerCase().startsWith(searchTerm);
          if (aTitleMatch && !bTitleMatch) return -1;
          if (!aTitleMatch && bTitleMatch) return 1;
          return 0;
        });

        setResults(allResults.slice(0, 10)); // Limitar a 10 resultados
      } catch (error) {
        console.error('Error searching:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result);
    } else {
      window.location.href = result.url;
    }
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    } else if (e.key === 'Enter' && results.length > 0) {
      handleResultClick(results[0]);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      activity: 'Actividad',
      resource: 'Recurso',
      session: 'Sesión',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      activity: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      resource: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      session: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Buscar"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-96 overflow-y-auto z-50">
          {results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleResultClick(result)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 focus-visible-ring"
            >
              <div className="flex items-start gap-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(result.type)}`}>
                  {getTypeLabel(result.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {result.title}
                  </div>
                  {result.description && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mt-1">
                      {result.description}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && !isSearching && results.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 text-center text-gray-500 dark:text-gray-400">
          No se encontraron resultados
        </div>
      )}
    </div>
  );
}

