import '../styles/global.css';
import { useState, createContext, useContext } from 'react';

export const RoleContext = createContext(null);
export const useRole = () => useContext(RoleContext);

export default function App({ Component, pageProps }) {
  const [roleKey, setRoleKey] = useState(null);

  return (
    <RoleContext.Provider value={{ roleKey, setRoleKey }}>
      <Component {...pageProps} />
    </RoleContext.Provider>
  );
}