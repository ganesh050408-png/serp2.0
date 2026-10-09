import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, fetchUserProfile, updateUserProfile, UserProfileData, isUsernameTaken } from '../services/supabase';
import { travelStorage, UserProfile } from '../services/travelStorage';

interface AuthContextType {
  user: User | null;
  profile: UserProfileData | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (username: string, email: string, password: string) => Promise<{ success: boolean; requiresEmailConfirmation?: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Omit<UserProfileData, 'id' | 'created_at'>>) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync profile data to travelStorage for offline compatibility and seamless UI rendering
  const syncWithTravelStorage = (userProfile: UserProfileData | null, currentAuthUser: User | null) => {
    if (!userProfile && !currentAuthUser) return;
    const existing = travelStorage.getProfile();
    const displayName = userProfile?.full_name || userProfile?.username || currentAuthUser?.user_metadata?.username || currentAuthUser?.email?.split('@')[0] || 'Traveler';
    const email = userProfile?.email || currentAuthUser?.email || existing.email;

    const updated: UserProfile = {
      ...existing,
      name: displayName,
      email: email,
      avatar: displayName.charAt(0).toUpperCase() || 'U',
    };
    travelStorage.saveProfile(updated);
  };

  const loadProfile = useCallback(async (userId: string, currentUser?: User | null) => {
    try {
      const { data, error } = await fetchUserProfile(userId);
      if (data) {
        setProfile(data);
        syncWithTravelStorage(data, currentUser || null);
      } else if (!error) {
        // Fallback placeholder profile from auth user metadata if database row is initializing
        const fallbackProfile: UserProfileData = {
          id: userId,
          username: currentUser?.user_metadata?.username || currentUser?.email?.split('@')[0] || 'traveler',
          email: currentUser?.email || '',
          full_name: currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.username || 'Traveler',
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProfile(fallbackProfile);
        syncWithTravelStorage(fallbackProfile, currentUser || null);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      if (!mounted) return;
      if (error) {
        console.warn('Initial session check error:', error.message);
      }
      setSession(initialSession);
      setUser(initialSession?.user || null);

      if (initialSession?.user) {
        loadProfile(initialSession.user.id, initialSession.user).finally(() => {
          if (mounted) setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    // 2. Auth State Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      setUser(currentSession?.user || null);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (currentSession?.user) {
          await loadProfile(currentSession.user.id, currentSession.user);
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        travelStorage.clearSession();
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signUp = async (username: string, email: string, password: string) => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim();

    if (!cleanUsername || cleanUsername.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters.' };
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
      return { success: false, error: 'Username may only contain letters, numbers, underscores, hyphens, and dots.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please provide a valid email address.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    try {
      // Check username availability
      const taken = await isUsernameTaken(cleanUsername);
      if (taken) {
        return { success: false, error: `The username "${cleanUsername}" is already taken. Please choose another.` };
      }

      // Supabase Auth Registration
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            username: cleanUsername,
            full_name: username.trim(),
          },
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes('already registered')) {
          return { success: false, error: 'An account with this email address already exists. Please sign in instead.' };
        }
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Registration failed. Please try again.' };
      }

      // Check if email confirmation is required (session is null when email confirmation is active)
      if (data.user && !data.session) {
        return {
          success: true,
          requiresEmailConfirmation: true,
        };
      }

      // If user is directly logged in, load the newly generated profile
      if (data.session?.user) {
        await loadProfile(data.session.user.id, data.session.user);
      }

      return { success: true, requiresEmailConfirmation: false };
    } catch (err: any) {
      return { success: false, error: err.message || 'An unexpected error occurred during registration.' };
    }
  };

  const signIn = async (email: string, password: string) => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          return {
            success: false,
            error: 'Invalid email or password. If you haven’t registered on this project yet, please switch to the "Sign Up" tab to create your account first.',
          };
        }
        if (error.message.toLowerCase().includes('email not confirmed')) {
          return { success: false, error: 'Please verify your email address before signing in. Check your inbox for the confirmation link.' };
        }
        return { success: false, error: error.message };
      }

      if (data.user) {
        await loadProfile(data.user.id, data.user);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error or unable to connect. Please check your connection.' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out warning:', err);
    } finally {
      setUser(null);
      setProfile(null);
      setSession(null);
      travelStorage.clearSession();
    }
  };

  const updateProfileHandler = async (updates: Partial<Omit<UserProfileData, 'id' | 'created_at'>>) => {
    if (!user) {
      return { success: false, error: 'No authenticated user found.' };
    }

    try {
      if (updates.username) {
        const cleanUsername = updates.username.trim().toLowerCase();
        const taken = await isUsernameTaken(cleanUsername, user.id);
        if (taken) {
          return { success: false, error: `The username "${cleanUsername}" is already taken.` };
        }
        updates.username = cleanUsername;
      }

      const { data, error } = await updateUserProfile(user.id, updates);
      if (error) {
        return { success: false, error };
      }

      if (data) {
        setProfile(data);
        syncWithTravelStorage(data, user);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update profile.' };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id, user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        signUp,
        signIn,
        signOut,
        updateProfile: updateProfileHandler,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
