'use client';

import { createContext, useContext, useState } from 'react';

const ProfilePictureContext = createContext();

export function ProfilePictureProvider({ children }) {
  const [profilePicture, setProfilePicture] = useState({
    url: null,
    key: null,
    timestamp: Date.now(),
  });

  const updateProfilePicture = (url, key) => {
    setProfilePicture({
      url,
      key,
      timestamp: Date.now(), // Forces re-render
    });
  };

  return (
    <ProfilePictureContext.Provider value={{ profilePicture, updateProfilePicture }}>
      {children}
    </ProfilePictureContext.Provider>
  );
}

export function useProfilePicture() {
  const context = useContext(ProfilePictureContext);
  if (!context) {
    throw new Error('useProfilePicture must be used within ProfilePictureProvider');
  }
  return context;
}
