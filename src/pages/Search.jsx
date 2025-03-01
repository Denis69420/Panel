// frontend/src/pages/Search.jsx
import React, { useState } from 'react';
import api from '../utils/api';

function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Call the backend with a single query parameter: q
      const res = await api.get('/search', { params: { q: query } });
      setResults(res.data);
    } catch (err) {
      setError('Search failed');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Search Panel</h1>
      
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex space-x-2">
          <input 
            type="text"
            className="w-full p-2 rounded bg-gray-700 text-white"
            placeholder="Enter any ID, name, etc."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded">
            Search
          </button>
        </div>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Identifier</th>
              <th className="px-4 py-2">Discord</th>
              <th className="px-4 py-2">License</th>
            </tr>
          </thead>
          <tbody>
            {results.map((player, index) => (
              <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                <td className="px-4 py-2">{player.id}</td>
                <td className="px-4 py-2">{player.name}</td>
                <td className="px-4 py-2">{player.identifier}</td>
                <td className="px-4 py-2">{player.discord}</td>
                <td className="px-4 py-2">{player.license}</td>
              </tr>
            ))}
            {results.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="text-center py-4">No results found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Search;
