// Types des entités de l'API

export interface User {
  idUser: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  profilPictureUrl?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
}

export interface Category {
  idCategory: string;
  title: string;
  slug: string;
  description?: string | null;
  iconUrl?: string | null;
}

export interface Article {
  idArticle: string;
  title: string;
  slug: string;
  summary?: string | null;
  content?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  presentationImageUrl?: string | null;
  categories: Category[];
  createdAt: string;
  updatedAt?: string | null;
}

export interface Emotion {
  idEmotion: string;
  title: string;
  description?: string | null;
  iconUrl?: string | null;
  level: 'LEVEL_1' | 'LEVEL_2';
  parentEmotionId?: string | null;
  parentEmotion?: Emotion | null;
  childEmotions: Emotion[];
}

// Types Auth
export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  loading: boolean;
}
