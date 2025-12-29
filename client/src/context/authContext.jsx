import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const signInUser = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, msg: error.message };
    }
  };
  const signUpNewUser = async (email, password, name, username) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: name,
            username: username,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: data.user.id,
            full_name: name,
            username: username,
          },
        ]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
          return { success: false, msg: profileError.message };
        }
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, msg: error.message };
    }
  };

  const signOutUser = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        // If the session is missing, we should still clear local state
        if (error.message.includes('Auth session missing')) {
          setSession(null);
          setUserProfile(null);
          // Forcefully clear local storage if Supabase fails
          localStorage.removeItem(
            'sb-' + import.meta.env.VITE_SUPABASE_URL + '-auth-token'
          );
        }
      }
    } catch (error) {
      console.error('Unexpected error signing out:', error);
    } finally {
      // Always clear local state to ensure UI updates
      setSession(null);
      setUserProfile(null);
    }
    return { success: true };
  };

  const fetchUserProfile = async (currentSession = session) => {
    // If no session is passed and no state session, check supabase
    let activeSession = currentSession;
    if (!activeSession) {
      const { data } = await supabase.auth.getSession();
      activeSession = data.session;
    }

    if (!activeSession) {
      setUserProfile(null);
      return;
    }

    try {
      // First attempt: fetch all fields
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, bio, location')
        .eq('id', activeSession.user.id)
        .single();

      if (error) throw error;

      if (data) {
        setUserProfile({
          id: data.id,
          email: activeSession.user.email,
          name: data.full_name,
          username: data.username,
          avatar_url: data.avatar_url,
          bio: data.bio,
          location: data.location,
          created_at: activeSession.user.created_at,
        });
        return;
      }
    } catch (err) {
      console.warn('Extended profile fetch failed, trying basic fields.', err);
      // Fallback logic remains same...
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, username')
          .eq('id', activeSession.user.id)
          .single();

        if (data) {
          setUserProfile({
            id: data.id,
            email: activeSession.user.email,
            name: data.full_name,
            username: data.username,
            avatar_url: '',
            bio: '',
            location: '',
            created_at: activeSession.user.created_at,
          });
          return;
        }
      } catch (fallbackErr) {
        console.error('Fallback profile fetch failed', fallbackErr);
      }
    }

    // Final fallback to metadata
    if (activeSession.user.user_metadata) {
      const { full_name, username, avatar_url } =
        activeSession.user.user_metadata;
      setUserProfile({
        id: activeSession.user.id,
        email: activeSession.user.email,
        name: full_name,
        username: username,
        avatar_url: avatar_url,
        bio: '',
        location: '',
        created_at: activeSession.user.created_at,
      });
    }
  };

  useEffect(() => {
    let mounted = true;

    // Initial session check
    const initializeAuth = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (mounted) {
          setSession(initialSession);
          if (initialSession) {
            await fetchUserProfile(initialSession);
          } else {
            setUserProfile(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (mounted) {
        setSession(newSession);

        if (newSession) {
          // Verify if profile needs update (e.g. user just logged in)
          if (!userProfile || userProfile.id !== newSession.user.id) {
            // Don't set loading true here to prevent full screen flash,
            // but could use a 'revalidating' state if needed.
            await fetchUserProfile(newSession);
          }
        } else {
          setUserProfile(null);
        }

        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        setSession,
        signInUser,
        signUpNewUser,
        signOutUser,
        userProfile,
        fetchUserProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
