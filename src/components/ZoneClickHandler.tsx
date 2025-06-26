
import { useState } from 'react';

export const useZoneClickHandler = ({ isEnemy, onDrawCard, onDeckMill }) => {
  const [zoneActionMenu, setZoneActionMenu] = useState(null);
  const [expandedZone, setExpandedZone] = useState(null);

  const handleZoneClick = (zoneName, event) => {
    if (isEnemy && (zoneName === 'deck' || zoneName === 'extraDeck')) {
      // Per l'avversario, alcune zone possono solo essere visualizzate
      setExpandedZone(zoneName);
      return;
    }
    
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setZoneActionMenu({
      zoneName,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      }
    });
  };

  const handleZoneAction = (action) => {
    const { zoneName } = zoneActionMenu;
    
    switch (action) {
      case 'draw':
        if (zoneName === 'deck') {
          onDrawCard && onDrawCard();
        }
        break;
      case 'mill':
        if (zoneName === 'deck') {
          onDeckMill && onDeckMill(1);
        }
        break;
      case 'mill3':
        if (zoneName === 'deck') {
          onDeckMill && onDeckMill(3);
        }
        break;
      case 'shuffle':
        console.log(`Shuffle ${zoneName}`);
        break;
      case 'view':
        setExpandedZone(zoneName);
        break;
    }
    
    setZoneActionMenu(null);
  };

  return {
    zoneActionMenu,
    setZoneActionMenu,
    expandedZone,
    setExpandedZone,
    handleZoneClick,
    handleZoneAction
  };
};
