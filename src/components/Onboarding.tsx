import React, { useState, useEffect } from 'react';
import { Wishlist } from '../types';
import { Trash2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

interface OnboardingProps {
  onStartList: (listName: string) => void;
  wishlists: Wishlist[];
  onSelectList: (wishlist: Wishlist) => void;
  onDeleteList: (listId: string) => void;
  onLogout: () => void;
  userId: string;
}

const Onboarding: React.FC<OnboardingProps> = ({
  onStartList,
  wishlists,
  onSelectList,
  onDeleteList,
  onLogout,
  userId
}) => {
  const [listName, setListName] = useState('');
  const [userWishlists, setUserWishlists] = useState<Wishlist[]>([]);

  useEffect(() => {
    const fetchWishlists = async () => {
      const wishlistsRef = collection(db, 'wishlists');
      const q = query(wishlistsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const lists: Wishlist[] = [];
      querySnapshot.forEach((doc) => {
        lists.push({ id: doc.id, ...doc.data() } as Wishlist);
      });
      setUserWishlists(lists);
    };

    fetchWishlists();
  }, [userId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (listName.trim()) {
      onStartList(listName.trim());
    }
  };

  const handleDeleteList = async (listId: string) => {
    try {
      await deleteDoc(doc(db, 'wishlists', listId));
      onDeleteList(listId);
    } catch (error) {
      console.error('Error deleting wishlist:', error);
    }
  };

  return (
    <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4 text-center">Your Wishlists</h2>
      {userWishlists.length > 0 && (
        <div className="mb-6">
          <ul className="space-y-2">
            {userWishlists.map((wishlist) => (
              <li key={wishlist.id} className="flex items-center justify-between">
                <button
                  onClick={() => onSelectList(wishlist)}
                  className="flex-grow text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md mr-2"
                >
                  {wishlist.name}
                </button>
                <button
                  onClick={() => handleDeleteList(wishlist.id)}
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