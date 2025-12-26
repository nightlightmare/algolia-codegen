import { useState } from 'react';
import { searchClient } from './lib/algolia';
import type { AlgoliaHitType } from './types/algolia';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<AlgoliaHitType[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    setLoading(true);

    try {
      const { results } = await searchClient.search([
        {
          indexName: import.meta.env.VITE_ALGOLIA_INDEX_NAME,
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
    <div className="container">
      <h1>Algolia Search</h1>
      
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search..."
      />

      {loading && <p>Loading...</p>}

      <div className="results">
        {hits.map((hit) => (
          <div key={hit.objectID} className="hit">
            <h2>{hit.name}</h2>
            {/* Add more fields based on your AlgoliaHitType */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

