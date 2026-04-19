import React, { createContext, useContext, useState, useEffect } from 'react';

interface BatterySaverContextType {
  isBatterySaver: boolean;
  toggleBatterySaver: () => void;
}

const BatterySaverContext = createContext<BatterySaverContextType>({
  isBatterySaver: false,
  toggleBatterySaver: () => {},
});

export const BatterySaverProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBatterySaver, setIsBatterySaver] = useState(() => {
    return localStorage.getItem('batterySaver') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('batterySaver', String(isBatterySaver));
    if (isBatterySaver) {
      document.body.classList.add('battery-saver');
    } else {
      document.body.classList.remove('battery-saver');
    }
  }, [isBatterySaver]);

  const toggleBatterySaver = () => setIsBatterySaver((prev) => !prev);

  return (
    <BatterySaverContext.Provider value={{ isBatterySaver, toggleBatterySaver }}>
      {children}
    </BatterySaverContext.Provider>
  );
};

export const useBatterySaver = () => useContext(BatterySaverContext);
