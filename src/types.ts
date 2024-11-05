import { User as FirebaseUser } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

export interface WishlistItem {
  id: string;
  category: string;
  description: string;
  url?: string;
}

export interface Wishlist {
  id: string;
  name: string;
  items: WishlistItem[];
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface User extends FirebaseUser {
  username?: string;
}