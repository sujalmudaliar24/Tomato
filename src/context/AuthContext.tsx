import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {

  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const subscriber = auth().onAuthStateChanged(
      async (firebaseUser) => {

        if (firebaseUser) {
          await firebaseUser.reload();
        }

        setUser(firebaseUser);
        setLoading(false);
      }
    );

    return subscriber;

  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);