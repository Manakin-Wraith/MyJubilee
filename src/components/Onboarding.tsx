import React, { useState, useEffect } from 'react';
import { Wishlist } from '../types';
import { Trash2, Gift, Loader } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

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
  onSelectList,
  onDeleteList,
  onLogout,
  userId
}) => {
  const [listName, setListName] = useState('');
  const [userWishlists, setUserWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const wishlistsRef = collection(db, 'wishlists');
      // Remove orderBy to prevent index requirement
      const q = query(
        wishlistsRef,
        where('userId', '==', userId)
      );

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const lists: Wishlist[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            lists.push({
              id: doc.id,
              name: data.name,
              items: data.items || [],
              userId: data.userId,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date()
            } as Wishlist);
          });
          // Sort lists client-side
         lists.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
         setUserWishlists(lists);
         setLoading(false);
         setError(null);
        },
        (err) => {
          console.error('Error fetching wishlists:', err);
          setError('Failed to load wishlists. Please try again.');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up wishlist listener:', err);
      setError('Failed to initialize wishlist tracking');
      setLoading(false);
    }
  }, [userId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (listName.trim()) {
      onStartList(listName.trim());
      setListName('');
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!window.confirm('Are you sure you want to delete this wishlist?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'wishlists', listId));
      onDeleteList(listId);
    } catch (err) {
      console.error('Error deleting wishlist:', err);
      setError('Failed to delete wishlist. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-center space-x-2">
          <Loader className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="text-gray-600">Loading your wishlists...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4 text-center">Your Wishlists</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {userWishlists.length > 0 ? (
        <div className="mb-6">
          <ul className="space-y-2">
            {userWishlists.map((wishlist) => (
              <li key={wishlist.id} className="flex items-center justify-between bg-gray-50 rounded-lg overflow-hidden">
                <button
                  onClick={() => onSelectList(wishlist)}
                  className="flex-grow text-left px-4 py-3 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <Gift className="w-5 h-5 text-indigo-600 mr-2" />
                    <div>
                      <span className="font-medium">{wishlist.name}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({wishlist.items?.length || 0} items)
                      </span>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleDeleteList(wishlist.id)}
                  className="p-3 text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors duration-200"
                  title="Delete wishlist"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mb-6 text-center py-6 bg-gray-50 rounded-lg">
          <Gift className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">You haven't created any wishlists yet.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="listName" className="block text-sm font-medium text-gray-700 mb-2">
            Create a new wishlist
          </label>
          <input
            type="text"
            id="listName"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
        className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 mt-1"
      >
        Logout
      </button>
    </div>
  );
};

export default Onboarding;