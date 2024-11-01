import { useState, useEffect } from 'react';
import { Gift } from 'lucide-react';
import Onboarding from './components/Onboarding';
import ListCreation from './components/ListCreation';
import ListDisplay from './components/ListDisplay';
import SharedListView from './components/SharedListView';
import Auth from './components/Auth';
import { Wishlist, User } from './types';


function App() {
  const [step, setStep] = useState<'auth' | 'onboarding' | 'listCreation' | 'listDisplay' | 'sharedView'>('auth');
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [sharedListId, setSharedListId] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setStep('onboarding');
    }

    const storedWishlists = localStorage.getItem('wishlists');
    if (storedWishlists) {
      setWishlists(JSON.parse(storedWishlists));
    }

    // Check if there's a shared list ID in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const sharedId = urlParams.get('sharedList');
    if (sharedId) {
      setSharedListId(sharedId);
      setStep('sharedView');
    }
  }, []);

  const handleLogin = (user: User) => {
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    setStep('onboarding');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setStep('auth');
  };

  const handleStartList = (listName: string) => {
    const newWishlist: Wishlist = { id: Date.now().toString(), name: listName, items: [], userId: user!.id };
    setWishlist(newWishlist);
    setStep('listCreation');
  };

  const handleListCreated = (items: Wishlist['items']) => {
    const updatedWishlist = { ...wishlist!, items };
    setWishlist(updatedWishlist);
    setWishlists([...wishlists, updatedWishlist]);
    localStorage.setItem('wishlists', JSON.stringify([...wishlists, updatedWishlist]));
    setStep('listDisplay');
  };

  const handleUpdateList = (updatedWishlist: Wishlist) => {
    setWishlist(updatedWishlist);
    const updatedWishlists = wishlists.map(list => list.id === updatedWishlist.id ? updatedWishlist : list);
    setWishlists(updatedWishlists);
    localStorage.setItem('wishlists', JSON.stringify(updatedWishlists));
  };

  const handleDeleteList = (listId: string) => {
    const updatedWishlists = wishlists.filter(list => list.id !== listId);
    setWishlists(updatedWishlists);
    localStorage.setItem('wishlists', JSON.stringify(updatedWishlists));
    setStep('onboarding');
  };

  const handleSelectList = (selectedWishlist: Wishlist) => {
    setWishlist(selectedWishlist);
    setStep('listDisplay');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <header className="w-full max-w-2xl mb-8 flex items-center justify-center">
        <Gift className="w-12 h-12 mr-2 text-indigo-600" />
        <h1 className="text-4xl font-bold text-gray-800">JUBILEE</h1>
      </header>
      {step === 'auth' && <Auth onLogin={handleLogin} />}
      {step === 'onboarding' && (
        <Onboarding
          onStartList={handleStartList}
          wishlists={wishlists}
          onSelectList={handleSelectList}
          onDeleteList={handleDeleteList}
          onLogout={handleLogout}
        />
      )}
      {step === 'listCreation' && wishlist && (
        <ListCreation listName={wishlist.name} onListCreated={handleListCreated} />
      )}
      {step === 'listDisplay' && wishlist && (
        <ListDisplay
          wishlist={wishlist}
          onUpdateList={handleUpdateList}
          onDeleteList={handleDeleteList}
          onBack={() => setStep('onboarding')}
        />
      )}
      {step === 'sharedView' && sharedListId && (
        <SharedListView wishlistId={sharedListId} />
      )}
    </div>
  );
}

export default App;