import { createContext, useContext, useState } from 'react';

const UserContext = createContext({});

export function UserProvider({ children }) {
  const [userData, setUserData] = useState({
    name: '',
    age: '',
    height: '',
    heightUnit: 'cm',
    weight: '',
    weightUnit: 'kg',
    sex: '',
    activityLevel: '',
    goals: [],
    medical_conditions: [],
  });

  const updateUser = (newData) => {
    setUserData(prev => ({ ...prev, ...newData }));
  };

  return (
    <UserContext.Provider value={{ userData, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);