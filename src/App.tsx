import { useState, useEffect } from 'react';
import { Gift } from 'lucide-react';
import Onboarding from './components/Onboarding';
import ListCreation from './components/ListCreation';
import ListDisplay from './components/ListDisplay';
import SharedListView from './components/SharedListView';
import Auth from './components/Auth';
import { Wishlist, User } from './types';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

function App() {
  const [step, setStep] = useState<'auth' | 'onboarding' | 'listCreation' | 'listDisplay' | 'sharedView'>('auth');
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [sharedListId, setSharedListId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user as User);
        setStep('onboarding');
      } else {
        setUser(null);
        setStep('auth');
      }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const sharedId = urlParams.get('sharedList');
    if (sharedId) {
      setSharedListId(sharedId);
      setStep('sharedView');
    }

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
      id: Date.now().toString(),
      name: listName,
      items: [],
      userId: user!.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setWishlist(newWishlist);
    setStep('listCreation');
  };

  const handleListCreated = async (items: Wishlist['items']) => {
    if (!wishlist || !user) return;

    try {
      const wishlistData = {
        ...wishlist,
        items,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      };

      const docRef = await addDoc(collection(db, 'wishlists'), wishlistData);
      const newWishlist = { ...wishlistData, id: docRef.id };
      
      setWishlist(newWishlist);
      setWishlists([...wishlists, newWishlist]);
      setStep('listDisplay');
    } catch (error) {
      console.error('Error creating wishlist:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <header className="w-full max-w-2xl mb-8 flex items-center justify-center">
        <Gift className="w-12 h-12 mr-2 text-indigo-600" />
        <h1 className="text-4xl font-bold text-gray-800">JUBILEE</h1>
      </header>
      {step === 'auth' && <Auth onLogin={handleLogin} />}
      {step === 'onboarding' && user && (
        <Onboarding
          onStartList={handleStartList}
          wishlists={wishlists}
          onSelectList={setWishlist}
          onDeleteList={(id) => setWishlists(wishlists.filter(w => w.id !== id))}
          onLogout={handleLogout}
          userId={user.uid}
        />
      )}
      {step === 'listCreation' && wishlist && (
        <ListCreation listName={wishlist.name} onListCreated={handleListCreated} />
      )}
      {step === 'listDisplay' && wishlist && (
        <ListDisplay
          wishlist={wishlist}
          onUpdateList={setWishlist}
          onDeleteList={() => {
            setWishlists(wishlists.filter(w => w.id !== wishlist.id));
            setStep('onboarding');
          }}
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