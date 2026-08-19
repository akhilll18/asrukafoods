import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';

// ============================================
// CREATE AUTH CONTEXT
// ============================================
const AuthContext = createContext();

// ============================================
// AUTH PROVIDER COMPONENT
// ============================================
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================================
  // FETCH USER PROFILE
  // ============================================
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // ============================================
  // INITIALIZE AUTH STATE
  // ============================================
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // ============================================
    // LISTEN FOR AUTH CHANGES
    // ============================================
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        
        if (session?.user) {
          setUser(session.user);
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // ============================================
  // SIGN UP
  // ============================================
  const signUp = async (email, password, name, phone) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            name, 
            phone,
          },
        },
      });

      if (error) throw error;

      toast.success('Registration successful! Please verify your email.');
      return { success: true, data };
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      return { success: false, error: error.message };
    }
  };

  // ============================================
  // SIGN IN
  // ============================================
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Welcome back!');
      return { success: true, data };
    } catch (error) {
      toast.error(error.message || 'Login failed');
      return { success: false, error: error.message };
    }
  };

  // ============================================
  // SIGN IN WITH GOOGLE
  // ============================================
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      toast.error('Google login failed');
      return { success: false, error: error.message };
    }
  };

  // ============================================
  // GUEST LOGIN
  // ============================================
  const guestLogin = async (name, phone) => {
    try {
      const guestEmail = `guest_${Date.now()}@temp.com`;
      const guestPassword = Math.random().toString(36).slice(-8);
      
      const { data, error } = await supabase.auth.signUp({
        email: guestEmail,
        password: guestPassword,
        options: {
          data: { 
            name: name || 'Guest', 
            phone: phone || '',
            is_guest: true,
          },
        },
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Create profile for guest
        await supabase.from('profiles').upsert({
          id: data.user.id,
          name: name || 'Guest',
          phone: phone || '',
          is_guest: true,
        });
      }
      
      toast.success('Continuing as guest');
      return { success: true };
    } catch (error) {
      toast.error('Guest login failed');
      return { success: false, error: error.message };
    }
  };

  // ============================================
  // LOGOUT
  // ============================================
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      toast.success('Logged out successfully');
      return { success: true };
    } catch (error) {
      toast.error('Logout failed');
      return { success: false, error: error.message };
    }
  };

  // ============================================
  // UPDATE PROFILE
  // ============================================
  const updateProfile = async (data) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Refresh profile
      const updatedProfile = await fetchProfile(user.id);
      setProfile(updatedProfile);
      
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Update failed');
      return { success: false, error: error.message };
    }
  };

  // ============================================
  // RESET PASSWORD
  // ============================================
  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      toast.success('Password reset email sent');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Reset failed');
      return { success: false, error: error.message };
    }
  };

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    guestLogin,
    logout,
    updateProfile,
    resetPassword,
    isAuthenticated: !!user,
    isGuest: profile?.is_guest || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// USE AUTH HOOK
// ============================================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;