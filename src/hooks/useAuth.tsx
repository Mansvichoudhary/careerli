import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiRequest } from '@/lib/api';

interface User { id: string; email: string; }
interface Session { token: string; }
interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: 'student' | 'mentor' | 'admin';
  location: string | null;
  university: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  skills: string[];
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, metadata: { full_name: string; role: 'student' | 'mentor' }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user) return;
    const data = await apiRequest<Profile>(`/profiles/${user.id}`);
    setProfile(data);
  };

  useEffect(() => {
    const token = localStorage.getItem('careerli_token');
    const userRaw = localStorage.getItem('careerli_user');
    if (token && userRaw) {
      const parsedUser = JSON.parse(userRaw) as User;
      setSession({ token });
      setUser(parsedUser);
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, metadata: { full_name: string; role: 'student' | 'mentor' }) => {
    try {
      await apiRequest('/auth/register', 'POST', { email, password, ...metadata });
      return signIn(email, password);
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const data = await apiRequest<{ token: string; user: User; profile: Profile | null }>('/auth/login', 'POST', { email, password });
      localStorage.setItem('careerli_token', data.token);
      localStorage.setItem('careerli_user', JSON.stringify(data.user));
      setSession({ token: data.token });
      setUser(data.user);
      setProfile(data.profile);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithGoogle = async () => ({ error: new Error('Google OAuth is not available in custom backend mode.') });

  const signOut = async () => {
    localStorage.removeItem('careerli_token');
    localStorage.removeItem('careerli_user');
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const isAdmin = profile?.role === 'admin';

  return <AuthContext.Provider value={{ user, session, profile, isAdmin, loading, signUp, signIn, signInWithGoogle, signOut, refreshProfile }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
