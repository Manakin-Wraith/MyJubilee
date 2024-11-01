import React, { useState, useEffect } from 'react';
import { ExternalLink, Gift } from 'lucide-react';
import { Wishlist, WishlistItem } from '../types';

interface SharedListViewProps {
  wishlistId: string;
}

const SharedListView: React.FC<SharedListViewProps> = ({ wishlistId }) => {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulating API call to fetch the shared wishlist
    const fetchWishlist = async () => {
      try {
        // In a real application, you would make an API call here
        // For now, we'll use localStorage to simulate data fetching
        const storedWishlists = localStorage.getItem('wishlists');
        if (storedWishlists) {
          const wishlists: Wishlist[] = JSON.parse(storedWishlists);
          const foundWishlist = wishlists.find(w => w.id === wishlistId);
          if (foundWishlist) {
            setWishlist(foundWishlist);
          } else {
            setError('Wishlist not found');
          }
        } else {
          setError('No wishlists available');
        }
      } catch (err) {
        setError('Error fetching wishlist');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [wishlistId]);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error || !wishlist) {
    return <div className="text-center text-red-600">{error || 'Wishlist not found'}</div>;
  }

  const groupedItems = wishlist.items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, WishlistItem[]>);

  return (
    <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center justify-center mb-6">
        <Gift className="w-8 h-8 mr-2 text-indigo-600" />
        <h1 className="text-3xl font-bold text-gray-800">JUBILEE</h1>
      </div>
      <h2 className="text-2xl font-semibold mb-4 text-center">{wishlist.name}</h2>
      <p className="text-gray-600 mb-6 text-center">Shared Wishlist</p>

      {Object.entries(groupedItems).map(([category, items]) => (
        <div key={category} className="mb-6">
          <h3 className="text-xl font-medium mb-2">{category}</h3>
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="bg-gray-50 p-3 rounded-md">
                <p className="text-gray-800">{item.description}</p>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 flex items-center mt-2"
                  >
                    View Product <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default SharedListView;