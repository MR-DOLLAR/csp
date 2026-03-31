import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, doc, getDoc, setDoc, onAuthStateChanged, serverTimestamp, collection, query, where, getDocs, deleteDoc } from '../firebase';
import { UserProfile, UserRole } from '../types';
import { User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isSupervisor: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        } else {
          // Check if there's a pre-created profile by email
          const q = query(collection(db, 'users'), where('email', '==', firebaseUser.email));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            // Claim the existing profile
            const existingDoc = querySnapshot.docs[0];
            const existingData = existingDoc.data() as UserProfile;
            
            // If the document ID is not the UID, we should probably migrate it or just update it
            // For simplicity and security rules (which often use match /users/{userId}), 
            // we'll create a new doc with UID and delete the old one if needed, 
            // or just update the existing one if it was already using UID (unlikely if pre-created)
            
            const updatedProfile: UserProfile = {
              ...existingData,
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || existingData.name,
              profileUpdated: true,
              updatedAt: serverTimestamp() as any
            };
            
            await setDoc(doc(db, 'users', firebaseUser.uid), updatedProfile);
            if (existingDoc.id !== firebaseUser.uid) {
              await deleteDoc(doc(db, 'users', existingDoc.id));
            }
            setProfile(updatedProfile);
          } else {
            // Create initial profile
            const initialRole: UserRole = firebaseUser.email === "revanthkumaryallanuru103@gmail.com" ? 'admin' : 'student';
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'Anonymous',
              email: firebaseUser.email || '',
              role: initialRole,
              createdAt: serverTimestamp() as any,
              profileUpdated: false
            };
            try {
              await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
              setProfile(newProfile);
            } catch (err) {
              console.error("Error creating profile:", err);
            }
          }
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    isSupervisor: profile?.role === 'supervisor',
    isStudent: profile?.role === 'student'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
