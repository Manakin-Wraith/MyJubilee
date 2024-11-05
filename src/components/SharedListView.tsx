import React, { useState, useEffect } from 'react';
import { ExternalLink, Gift } from 'lucide-react';
import { Wishlist } from '../types';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface SharedListViewProps {
  wishlistId: string;
}

const SharedListView: React.FC<SharedListViewProps> = ({ wishlistId }) => {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const wishlistRef = doc(db, 'wishlists', wishlistId);
        const wishlistDoc = await getDoc(wishlistRef);
        
        if (wishlistDoc.exists()) {
          setWishlist({ id: wishlistDoc.id, ...wishlistDoc.data() } as Wishlist);
        } else {
          setError('Wishlist not found');
        }
      } catch (err) {
        setError('Error fetching wishlist');
        console.error('Error fetching wishlist:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [wishlistId]);

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error || !wishlist) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          <p className="text-xl font-semibold text-red-600 mb-2">
            {error || 'Wishlist not found'}
          </p>
          <p className="text-gray-600">
            The wishlist you're looking for might have been deleted or is no longer available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8">
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="flex items-center justify-center bg-indigo-50 rounded-full p-4 mb-4">
          <Gift className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{wishlist.name}</h1>
        <p className="text-gray-600">Items in this shared wishlist:</p>
      </div>

      <ul className="space-y-4">
        {wishlist.items.map((item) => (
          <li 
            key={item.id} 
            className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors duration-200"
          >
            <p className="text-gray-800 font-medium mb-2">{item.description}</p>
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
              >
                <span className="mr-1">View Product</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SharedListView;