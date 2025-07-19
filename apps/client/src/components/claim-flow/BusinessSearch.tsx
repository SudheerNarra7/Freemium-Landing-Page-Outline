'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Business {
  placeId: string;
  name: string;
  address: string;
}

export default function BusinessSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        setLoading(true);
        axios
          .get(`/api/business/find-google-place?query=${query}`)
          .then((res) => {
            setResults(res.data);
          })
          .catch((err) => {
            console.error(err);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setResults([]);
      }
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Claim Your Business Listing
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            We'll find your business and you can confirm the details.
          </p>
        </div>

        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your business name or phone number"
            className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {loading && <p className="mt-2 text-sm text-gray-500">Searching...</p>}
        </div>

        {results.length > 0 && (
          <ul className="space-y-2">
            {results.map((business) => (
              <li
                key={business.placeId}
                className="p-4 transition-colors duration-200 ease-in-out bg-white border border-gray-200 rounded-md cursor-pointer hover:bg-gray-100"
              >
                <p className="font-semibold text-gray-900">{business.name}</p>
                <p className="text-sm text-gray-600">{business.address}</p>
              </li>
            ))}
          </ul>
        )}
        <button className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Locate Your Business...
        </button>
      </div>
    </div>
  );
}
