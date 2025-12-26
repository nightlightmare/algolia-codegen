'use client';

import { useState } from 'react';
import { searchClient } from '@/lib/algolia';
import type { AlgoliaHitType } from '@/types/algolia';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<AlgoliaHitType[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    setLoading(true);

    try {
      const { results } = await searchClient.search([
        {
          indexName: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!,
          query: searchQuery,
        },
      ]);

      setHits(results[0].hits as AlgoliaHitType[]);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Algolia Search</h1>
      
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search..."
        className="w-full p-2 border rounded mb-4"
      />

      {loading && <p>Loading...</p>}

      <div className="grid gap-4">
        {hits.map((hit) => (
          <div key={hit.objectID} className="p-4 border rounded">
            <h2 className="font-bold">{hit.name}</h2>
            {/* Add more fields based on your AlgoliaHitType */}
          </div>
        ))}
      </div>
    </div>
  );
}

