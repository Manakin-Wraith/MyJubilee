import React, { useState } from 'react';
import { Wishlist } from '../types';
import { Trash2 } from 'lucide-react';

interface OnboardingProps {
  onStartList: (listName: string) => void;
  wishlists: Wishlist[];
  onSelectList: (wishlist: Wishlist) => void;
  onDeleteList: (listId: string) => void;
  onLogout: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onStartList, wishlists, onSelectList, onDeleteList, onLogout }) => {
  const [listName, setListName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (listName.trim()) {
      onStartList(listName.trim());
    }
  };

  return (
    <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4 text-center">Your Wishlists</h2>
      {wishlists.length > 0 && (
        <div className="mb-6">
          <ul className="space-y-2">
            {wishlists.map((wishlist) => (
              <li key={wishlist.id} className="flex items-center justify-between">
                <button
                  onClick={() => onSelectList(wishlist)}
                  className="flex-grow text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md mr-2"
                >
                  {wishlist.name}
                </button>
                <button
                  onClick={() => onDeleteList(wishlist.id)}
                  className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-100"
                  title="Delete wishlist"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="listName" className="block text-sm font-medium text-gray-700 mb-2">
            Create a new wishlist
          </label>
          <input
            type="text"
            id="listName"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., Birthday Wishlist"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mb-4"
        >
          Create New List
        </button>
      </form>
      <button
        onClick={onLogout}
        className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Logout
      </button>
    </div>
  );
};

export default Onboarding;