import { User as FirebaseUser } from 'firebase/auth';

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
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends FirebaseUser {
  username?: string;
}