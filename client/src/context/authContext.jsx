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
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  };

  const fetchUserProfile = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    // Try fetching from profiles table
    try {
      // First attempt: fetch all fields
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, bio, location')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      if (data) {
        setUserProfile({
          id: data.id,
          email: session.user.email,
          name: data.full_name,
          username: data.username,
          avatar_url: data.avatar_url,
          bio: data.bio,
          location: data.location,
          created_at: session.user.created_at,
        });
        return;
      }
    } catch (err) {
      console.warn(
        'Extended profile fetch failed, trying basic fields. Run SQL migration.',
        err
      );
      // Fallback: fetch only basic fields (compatibility mode)
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, username')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setUserProfile({
          id: data.id,
          email: session.user.email,
          name: data.full_name,
          username: data.username,
          avatar_url: '', // Default or from metadata if available
          bio: '',
          location: '',
          created_at: session.user.created_at,
        });
        return;
      }
    }

    if (session.user.user_metadata) {
      // Fallback to metadata if DB record is missing (common with RLS issues)
      console.log('Using user_metadata fallback');
      const { full_name, username, avatar_url } = session.user.user_metadata;
      setUserProfile({
        id: session.user.id,
        email: session.user.email,
        name: full_name,
        username: username,
        avatar_url: avatar_url,
        bio: '',
        location: '',
        created_at: session.user.created_at,
      });
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserProfile().then(() => setLoading(false));
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      if (session) fetchUserProfile();
      else setUserProfile(null);
    });
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
