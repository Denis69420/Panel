// frontend/src/pages/Search.jsx
import React, { useState } from 'react';
import api from '../utils/api'; // Your Axios instance with JWT & baseURL

function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResults([]);

    try {
      // GET /api/search?q={query}
      const res = await api.get('/search', { params: { q: query } });
      // The response is the flattened array from the backend
      setResults(res.data);
    } catch (err) {
      console.error(err);
      setError('Search failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Universal DB Search</h1>
      <form onSubmit={handleSearch} className="mb-4 flex space-x-2">
        <input
          type="text"
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="Enter any identifier (e.g. steam:11000014c9775ba)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded">
          Search
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {results.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-2">Table</th>
                <th className="px-4 py-2">Column</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Row Data</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="px-4 py-2">{item.tableName}</td>
                  <td className="px-4 py-2">{item.columnName}</td>
                  <td className="px-4 py-2">{item.dataType}</td>
                  <td className="px-4 py-2 whitespace-pre-wrap">
                    {JSON.stringify(item.row, null, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && !error && <p>No results found.</p>
      )}
    </div>
  );
}

export default Search;
