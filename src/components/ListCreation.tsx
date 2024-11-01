import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { WishlistItem } from '../types';

interface ListCreationProps {
  listName: string;
  onListCreated: (items: WishlistItem[]) => void;
}

const ListCreation: React.FC<ListCreationProps> = ({ listName, onListCreated }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [currentItem, setCurrentItem] = useState<Omit<WishlistItem, 'id'>>({ category: '', description: '', url: '' });

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const removeCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category));
    setItems(items.filter(item => item.category !== category));
  };

  const addItem = () => {
    if (currentItem.category && currentItem.description) {
      const newItem: WishlistItem = { ...currentItem, id: Date.now().toString() };
      setItems([...items, newItem]);
      setCurrentItem({ category: '', description: '', url: '' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onListCreated(items);
  };

  return (
    <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Creating: {listName}</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Add Categories</h3>
        <div className="flex mb-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., Shoes"
          />
          <button
            onClick={addCategory}
            className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <span key={category} className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center">
              {category}
              <button onClick={() => removeCategory(category)} className="ml-2 text-red-500 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            id="category"
            value={currentItem.category}
            onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Item Description
          </label>
          <textarea
            id="description"
            value={currentItem.description}
            onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Describe the item you're looking for"
            rows={3}
          ></textarea>
        </div>
        <div className="mb-4">
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            Product URL (optional)
          </label>
          <input
            type="url"
            id="url"
            value={currentItem.url}
            onChange={(e) => setCurrentItem({ ...currentItem, url: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="https://example.com/product"
          />
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mb-4 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Add Item
        </button>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Finish List
        </button>
      </form>
    </div>
  );
};

export default ListCreation;