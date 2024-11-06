import { useState, useEffect } from 'react';
import { Gift, User as UserIcon } from 'lucide-react';
import Onboarding from './components/Onboarding';
import ListCreation from './components/ListCreation';
import ListDisplay from './components/ListDisplay';
import SharedListView from './components/SharedListView';
import Profile from './components/Profile';
import Auth from './components/Auth';
import { Wishlist, User } from './types';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection,
  addDoc,
  Timestamp,
  doc,
  deleteDoc,
} from 'firebase/firestore';

function App() {
  const [step, setStep] = useState<
    'auth' | 'onboarding' | 'listCreation' | 'listDisplay' | 'sharedView' | 'profile'
  >('auth');
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [sharedListId, setSharedListId] = useState<string | null>(null);

  useEffect(() => {
    // First, check for shared list parameter
    const urlParams = new URLSearchParams(window.location.search);
    const sharedId = urlParams.get('sharedList');

    if (sharedId) {
      setSharedListId(sharedId);
      setStep('sharedView');
      return; // Exit early if it's a shared list view
    }

    // If no shared list, handle auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user as User);
        setStep('onboarding');
      } else {
        setUser(null);
        setStep('auth');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (user: User) => {
    setUser(user);
    setStep('onboarding');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setStep('auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleStartList = (listName: string) => {
    const newWishlist: Wishlist = {
      id: '',
      name: listName,
      items: [],
      userId: user!.uid,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    };
    setWishlist(newWishlist);
    setStep('listCreation');
  };

  const handleListCreated = async (items: Wishlist['items']) => {
    if (!wishlist || !user) return;

    try {
      const wishlistData = {
        name: wishlist.name,
        items,
        userId: user.uid,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      };

      const docRef = await addDoc(collection(db, 'wishlists'), wishlistData);
      const newWishlist = { ...wishlistData, id: docRef.id } as Wishlist;

      setWishlist(newWishlist);
      setWishlists([...wishlists, newWishlist]);
      setStep('listDisplay');
    } catch (error) {
      console.error('Error creating wishlist:', error);
    }
  };

  const handleDeleteList = async (listId: string) => {
    try {
      await deleteDoc(doc(db, 'wishlists', listId));
      setWishlists(wishlists.filter((w) => w.id !== listId));
      setStep('onboarding');
    } catch (error) {
      console.error('Error deleting wishlist:', error);
    }
  };

  const handleSelectList = (selectedWishlist: Wishlist) => {
    setWishlist(selectedWishlist);
    setStep('listDisplay');
  };

  return (
  <div className="min-h-screen flex flex-col items-center justify-center p-4">
    <header className="w-full max-w-2xl mb-8">
      <div className="flex items-center justify-between">
        {/* Left section with Icon and Title */}
        <div className="flex items-center">
          <Gift className="w-12 h-12 mr-2 text-indigo-600" />
          <h1 className="text-4xl font-bold text-gray-700">JUBILEE</h1>
        </div>

       {/* Profile Button */}
{user && step !== 'sharedView' && (
  <button
    onClick={() => setStep('profile')}
    className="flex flex-col items-center text-indigo-600 hover:text-indigo-800"
  >
    <UserIcon className="w-6 h-6 mb-1" />
    <span className="text-sm">{user.displayName || 'Profile'}</span>
  </button>
          )}
        </div>
      </header>

      {step === 'auth' && <Auth onLogin={handleLogin} />}
      {step === 'onboarding' && user && (
        <Onboarding
          onStartList={handleStartList}
          wishlists={wishlists}
          onSelectList={handleSelectList}
          onDeleteList={handleDeleteList}
          onLogout={handleLogout}
          userId={user.uid}
        />
      )}
      {step === 'listCreation' && wishlist && (
        <ListCreation
          listName={wishlist.name}
          onListCreated={handleListCreated}
        />
      )}
      {step === 'listDisplay' && wishlist && (
        <ListDisplay
          wishlist={wishlist}
          onUpdateList={setWishlist}
          onDeleteList={handleDeleteList}
          onBack={() => setStep('onboarding')}
        />
      )}
      {step === 'sharedView' && sharedListId && (
        <SharedListView wishlistId={sharedListId} />
      )}
      {step === 'profile' && user && (
        <Profile
          user={user}
          onBack={() => setStep('onboarding')}
          onUpdateUser={setUser}
        />
      )}
    </div>
  );
}

export default App;