import React, { useState } from 'react';
import { ExternalLink, Share2, ArrowLeft, Edit2, Trash2, Plus } from 'lucide-react';
import { Wishlist, WishlistItem } from '../types';
import { db } from '../lib/firebase';
import { doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';

interface ListDisplayProps {
  wishlist: Wishlist;
  onUpdateList: (updatedWishlist: Wishlist) => void;
  onDeleteList: (listId: string) => void;
  onBack: () => void;
}

const ListDisplay: React.FC<ListDisplayProps> = ({ wishlist, onUpdateList, onDeleteList, onBack }) => {
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Omit<WishlistItem, 'id'>>({ category: '', description: '', url: '' });
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const groupedItems = wishlist.items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, WishlistItem[]>);

  const handleEditItem = (item: WishlistItem) => {
    setEditingItem(item);
    setError(null);
  };

  const handleUpdateItem = async (updatedItem: WishlistItem) => {
    try {
      const updatedItems = wishlist.items.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      );
      
      const updatedWishlist = {
        ...wishlist,
        items: updatedItems,
        updatedAt: new Date()
      };

      const wishlistRef = doc(db, 'wishlists', wishlist.id);
      await updateDoc(wishlistRef, {
        items: updatedItems,
        updatedAt: Timestamp.fromDate(new Date())
      });

      onUpdateList(updatedWishlist);
      setEditingItem(null);
      setError(null);
    } catch (err) {
      console.error('Error updating item:', err);
      setError('Failed to update item. Please try again.');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const updatedItems = wishlist.items.filter(item => item.id !== itemId);
      const updatedWishlist = {
        ...wishlist,
        items: updatedItems,
        updatedAt: new Date()
      };

      const wishlistRef = doc(db, 'wishlists', wishlist.id);
      await updateDoc(wishlistRef, {
        items: updatedItems,
        updatedAt: Timestamp.fromDate(new Date())
      });

      onUpdateList(updatedWishlist);
      setError(null);
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item. Please try again.');
    }
  };

  const handleShare = () => {
    const shareableUrl = `${window.location.origin}/?sharedList=${wishlist.id}`;
    setShareUrl(shareableUrl);
    navigator.clipboard.writeText(shareableUrl);
  };

  const handleDeleteWishlist = async () => {
    if (!window.confirm('Are you sure you want to delete this wishlist?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'wishlists', wishlist.id));
      onDeleteList(wishlist.id);
      setError(null);
    } catch (err) {
      console.error('Error deleting wishlist:', err);
      setError('Failed to delete wishlist. Please try again.');
    }
  };

  const handleAddItem = async () => {
    if (!newItem.category || !newItem.description) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      const newItemWithId = { ...newItem, id: Date.now().toString() };
      const updatedItems = [...wishlist.items, newItemWithId];
      const updatedWishlist = {
        ...wishlist,
        items: updatedItems,
        updatedAt: new Date()
      };

      const wishlistRef = doc(db, 'wishlists', wishlist.id);
      await updateDoc(wishlistRef, {
        items: updatedItems,
        updatedAt: Timestamp.fromDate(new Date())
      });

      onUpdateList(updatedWishlist);
      setNewItem({ category: '', description: '', url: '' });
      setIsAddingItem(false);
      setError(null);
    } catch (err) {
      console.error('Error adding item:', err);
      setError('Failed to add item. Please try again.');
    }
  };

  return (
    <div className="max-w-screen-md flex-row bg-white shadow-md rounded-lg p-9">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-indigo-600 hover:text-indigo-800 flex items-center mr-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>
        <div className="flex space-x-4">
          <button onClick={handleShare} className="text-indigo-600 hover:text-indigo-800 flex items-center">
            <Share2 className="w-4 h-4 mr-1" /> Share
          </button>
          <button onClick={handleDeleteWishlist} className="text-red-600 hover:text-red-800 flex items-center">
            <Trash2 className="w-4 h-4 mr-1" /> Delete List
          </button>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">{wishlist.name}</h2>

      {shareUrl && (
        <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">
          Shareable link copied to clipboard: {shareUrl}
        </div>
      )}

      {Object.entries(groupedItems).map(([category, items]) => (
        <div key={category} className="mb-6">
          <h3 className="text-xl font-medium mb-2">{category}</h3>
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="bg-gray-50 p-3 rounded-md">
                {editingItem?.id === item.id ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateItem(editingItem);
                  }}>
                    <input
                      type="text"
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded mb-2"
                    />
                    <input
                      type="url"
                      value={editingItem.url || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded mb-2"
                      placeholder="Product URL (optional)"
                    />
                    <button type="submit" className="bg-green-500 text-white px-2 py-1 rounded mr-2">Save</button>
                    <button type="button" onClick={() => setEditingItem(null)} className="bg-gray-500 text-white px-2 py-1 rounded">Cancel</button>
                  </form>
                ) : (
                  <>
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
                    <div className="mt-2 flex space-x-2">
                      <button onClick={() => handleEditItem(item)} className="text-blue-600 hover:text-blue-800">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}

      {isAddingItem ? (
        <div className="mt-6 bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium mb-2">Add New Item</h3>
          <select
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
          >
            <option value="">Select a category</option>
            {Object.keys(groupedItems).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
            <option value="new">+ New Category</option>
          </select>
          {newItem.category === 'new' && (
            <input
              type="text"
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
              placeholder="Enter new category name"
            />
          )}
          <input
            type="text"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
            placeholder="Item description"
          />
          <input
            type="url"
            value={newItem.url || ''}
            onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
            placeholder="Product URL (optional)"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleAddItem}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              Add Item
            </button>
            <button
              onClick={() => {
                setIsAddingItem(false);
                setNewItem({ category: '', description: '', url: '' });
              }}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingItem(true)}
          className="mt-4 flex items-center justify-center w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Item
        </button>
      )}
    </div>
  );
};

export default ListDisplay;