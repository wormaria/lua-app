import { createContext, useContext, useState } from 'react';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [profile, setProfile] = useState({
    name: '',
    cuisines: ['Brazilian', 'Mexican'],
    lastPeriod: new Date(Date.now() - 18 * 86400000).toISOString(),
  });

  const updateProfile = (updates) =>
    setProfile(prev => ({ ...prev, ...updates }));

  return (
    <UserContext.Provider value={{ profile, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
