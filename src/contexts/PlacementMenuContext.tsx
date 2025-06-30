import React, { createContext, useContext, useState, useCallback } from 'react';

interface PlacementMenuContextType {
  placementMenu: any;
  openPlacementMenu: (zoneName: string, slotIndex: number, event: any, selectedCard: any) => void;
  closePlacementMenu: () => void;
}

const PlacementMenuContext = createContext<PlacementMenuContextType | undefined>(undefined);

export const usePlacementMenu = () => {
  const context = useContext(PlacementMenuContext);
  if (!context) {
    throw new Error('usePlacementMenu must be used within a PlacementMenuProvider');
  }
  return context;
};

export const PlacementMenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [placementMenu, setPlacementMenu] = useState(null);

  const openPlacementMenu = useCallback((zoneName, slotIndex, event, selectedCard) => {
    if (selectedCard && event) {
      event.preventDefault();
      event.stopPropagation();
      
      // Usa le coordinate del click per posizionare il menu
      const rect = event.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      const menuData = {
        zoneName,
        slotIndex,
        x: x,
        y: y,
        card: selectedCard
      };
      
      setPlacementMenu(menuData);
    }
  }, []);

  const closePlacementMenu = useCallback(() => {
    setPlacementMenu(null);
  }, []);

  return (
    <PlacementMenuContext.Provider value={{ placementMenu, openPlacementMenu, closePlacementMenu }}>
      {children}
    </PlacementMenuContext.Provider>
  );
}; 