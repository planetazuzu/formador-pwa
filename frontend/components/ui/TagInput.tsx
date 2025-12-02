'use client';

import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  maxTags?: number;
  className?: string;
}

export default function TagInput({
  tags,
  onChange,
  placeholder = 'Añadir etiqueta...',
  suggestions = [],
  maxTags,
  className = '',
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const addTag = (tag: string) => {
    if (maxTags && tags.length >= maxTags) {
      return;
    }

    const normalizedTag = tag.toLowerCase().trim();
    if (normalizedTag && !tags.includes(normalizedTag)) {
      onChange([...tags, normalizedTag]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(suggestion.toLowerCase())
  );

  return (
    <div className={`relative ${className}`}>
      <div className="flex flex-wrap gap-2 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl min-h-[42px] focus-within:ring-2 focus-within:ring-indigo-500">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-sm"
          >
            {tag}
            <button
              onClick={() => removeTag(index)}
              className="hover:text-indigo-900 dark:hover:text-indigo-300 focus-visible-ring rounded"
              aria-label={`Eliminar etiqueta ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          disabled={maxTags ? tags.length >= maxTags : false}
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto z-10">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => addTag(suggestion)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus-visible-ring"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

