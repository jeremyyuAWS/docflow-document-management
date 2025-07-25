import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp, History, Sparkles } from 'lucide-react';
import Fuse from 'fuse.js';
import type { Customer, CustomerDocument } from '../types';
import { format } from 'date-fns';

interface SmartSearchProps {
  customers: Customer[];
  documents: Record<string, CustomerDocument[]>;
  onSearchResult?: (results: SearchResult[]) => void;
}

interface SearchResult {
  type: 'customer' | 'document';
  item: Customer | CustomerDocument;
  score: number;
  matches?: Array<{
    key: string;
    value: string;
    indices: number[][];
  }>;
}

interface SearchHistory {
  query: string;
  timestamp: Date;
  resultCount: number;
}

interface SearchSuggestion {
  text: string;
  type: 'recent' | 'trending' | 'smart';
  score?: number;
}

function SmartSearch({ customers, documents, onSearchResult }: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Fuse.js instances
  const customerFuse = new Fuse(customers, {
    keys: ['full_name', 'email', 'company', 'role'],
    threshold: 0.3,
    includeMatches: true,
    includeScore: true
  });

  const documentFuse = new Fuse(
    Object.values(documents).flat(),
    {
      keys: ['name', 'type', 'status'],
      threshold: 0.3,
      includeMatches: true,
      includeScore: true
    }
  );

  useEffect(() => {
    // Handle click outside to close suggestions
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query) {
      performSearch(query);
    } else {
      setResults([]);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setIsSearching(true);

    try {
      // Search in customers
      const customerResults = customerFuse.search(searchQuery).map(result => ({
        type: 'customer' as const,
        item: result.item,
        score: result.score || 0,
        matches: result.matches
      }));

      // Search in documents
      const documentResults = documentFuse.search(searchQuery).map(result => ({
        type: 'document' as const,
        item: result.item,
        score: result.score || 0,
        matches: result.matches
      }));

      // Combine and sort results
      const combinedResults = [...customerResults, ...documentResults]
        .sort((a, b) => a.score - b.score)
        .slice(0, 10);

      setResults(combinedResults);
      if (onSearchResult) {
        onSearchResult(combinedResults);
      }

      // Update search history
      if (searchQuery.trim()) {
        const newHistory: SearchHistory = {
          query: searchQuery,
          timestamp: new Date(),
          resultCount: combinedResults.length
        };
        setSearchHistory(prev => [newHistory, ...prev].slice(0, 10));
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const generateSuggestions = () => {
    const suggestions: SearchSuggestion[] = [];

    // Add recent searches
    searchHistory.slice(0, 3).forEach(history => {
      suggestions.push({
        text: history.query,
        type: 'recent'
      });
    });

    // Add trending suggestions based on document types
    const documentTypes = new Set(Object.values(documents).flat().map(doc => doc.type));
    documentTypes.forEach(type => {
      suggestions.push({
        text: `${type} documents`,
        type: 'trending'
      });
    });

    // Add smart suggestions based on overdue documents
    const overdueCount = Object.values(documents).flat().filter(doc => doc.status === 'overdue').length;
    if (overdueCount > 0) {
      suggestions.push({
        text: 'Overdue documents',
        type: 'smart',
        score: overdueCount
      });
    }

    return suggestions;
  };

  const handleFocus = () => {
    setSuggestions(generateSuggestions());
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className={`h-5 w-5 ${isSearching ? 'text-blue-500' : 'text-gray-400'}`} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Search customers, documents, or type # for filters..."
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {(showSuggestions || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto"
          >
            {showSuggestions && suggestions.length > 0 && (
              <div className="p-2">
                <div className="text-sm font-medium text-gray-500 px-3 py-2">
                  Suggestions
                </div>
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center justify-between group"
                    >
                      <div className="flex items-center">
                        {suggestion.type === 'recent' && (
                          <History className="h-4 w-4 text-gray-400 mr-2" />
                        )}
                        {suggestion.type === 'trending' && (
                          <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
                        )}
                        {suggestion.type === 'smart' && (
                          <Sparkles className="h-4 w-4 text-yellow-500 mr-2" />
                        )}
                        <span className="text-gray-700">{suggestion.text}</span>
                      </div>
                      {suggestion.score && (
                        <span className="text-sm text-gray-500 group-hover:text-gray-700">
                          {suggestion.score} items
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="p-2">
                <div className="text-sm font-medium text-gray-500 px-3 py-2">
                  Results
                </div>
                <div className="space-y-1">
                  {results.map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      {result.type === 'customer' && (
                        <div>
                          <div className="font-medium text-gray-900">
                            {(result.item as Customer).full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {(result.item as Customer).company} • {(result.item as Customer).email}
                          </div>
                        </div>
                      )}
                      {result.type === 'document' && (
                        <div>
                          <div className="font-medium text-gray-900">
                            {(result.item as CustomerDocument).name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {(result.item as CustomerDocument).type} • Due: {
                              format(new Date((result.item as CustomerDocument).due_date), 'MMM d, yyyy')
                            }
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {query && results.length === 0 && !isSearching && (
              <div className="p-4 text-center text-gray-500">
                No results found for "{query}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SmartSearch;