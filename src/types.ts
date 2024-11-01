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
  }
  
  export interface User {
    id: string;
    username: string;
  }