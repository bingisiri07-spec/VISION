import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from public.profiles
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Could not fetch user profile:', error.message);
      }
      if (data) {
        setProfile({ ...data, fullName: data.full_name });
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.warn('Profile fetch error:', err);
    }
  };

  useEffect(() => {
    // 1. Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // 2. Listen for auth state transitions (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sign up with Email + Password and optional Full Name
  const signUp = async ({ email, password, fullName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        },
      },
    });
    if (error) throw error;
    return data;
  };

  // Sign in with Email + Password
  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Sign out error:', error.message);
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  // Update user profile in public.profiles and auth.users metadata.
  // Accepts: fullName (required), contactNumber (optional), linkedinUrl (optional).
  const updateProfile = async ({ fullName, contactNumber, linkedinUrl }) => {
    if (!user) throw new Error('You must be signed in to update your profile.');

    const trimmed = (fullName || '').trim();
    if (!trimmed) {
      throw new Error('Full name cannot be blank.');
    }

    // Build the update payload with only defined fields
    const updatePayload = {
      full_name: trimmed,
      updated_at: new Date().toISOString(),
    };
    if (contactNumber !== undefined) updatePayload.contact_number = (contactNumber || '').trim() || null;
    if (linkedinUrl !== undefined) updatePayload.linkedin_url = (linkedinUrl || '').trim() || null;

    // 1. Update public.profiles row
    const { data, error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update profile row:', error.message);
      throw error;
    }

    // 2. Sync full_name to auth.users raw_user_meta_data
    try {
      await supabase.auth.updateUser({
        data: { full_name: trimmed },
      });
    } catch (metaErr) {
      console.warn('Could not sync user metadata in auth.users:', metaErr);
    }

    const normalizedProfile = data ? { ...data, fullName: data.full_name } : null;
    setProfile(normalizedProfile);
    return normalizedProfile;
  };

  // Derive display name from profile full_name, user_metadata full_name, or sensible fallback
  const userDisplayName = (profile?.full_name?.trim() || user?.user_metadata?.full_name?.trim() || '').trim();
  const firstName = userDisplayName ? userDisplayName.split(' ')[0] : 'Founder';

  // Update password in Supabase Auth
  const updatePassword = async (newPassword) => {
    if (!user) throw new Error('You must be signed in to update your password.');
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('Failed to update password:', error.message);
      throw error;
    }

    return data;
  };

  const value = {
    user,
    session,
    profile,
    userDisplayName,
    firstName,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
