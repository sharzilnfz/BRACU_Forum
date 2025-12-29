import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);
  const [userProfile, setUserProfile] = useState(null);

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
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, username')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error(
        'Error fetching profile from DB, using metadata fallback:',
        error
      );
    }

    if (data) {
      setUserProfile({
        id: data.id,
        email: session.user.email,
        name: data.full_name,
        username: data.username,
      });
    } else if (session.user.user_metadata) {
      // Fallback to metadata if DB record is missing (common with RLS issues)
      console.log('Using user_metadata fallback');
      const { full_name, username } = session.user.user_metadata;
      setUserProfile({
        id: session.user.id,
        email: session.user.email,
        name: full_name,
        username: username,
      });
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserProfile();
      else setUserProfile(null);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
