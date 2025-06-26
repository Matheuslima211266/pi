
import { useState } from 'react';

export const useZoneClickHandler = ({ isEnemy, onDrawCard, onDeckMill }) => {
  const [zoneActionMenu, setZoneActionMenu] = useState(null);
  const [expandedZone, setExpandedZone] = useState(null);

  const handleZoneClick = (zoneName, event) => {
    event.stopPropagation();
    
    // Per tutte le zone, mostra sempre l'espansione per visualizzare il contenuto
    // Il menu delle azioni viene mostrato solo per il giocatore locale
    if (isEnemy) {
      // Per l'avversario, mostra solo la visualizzazione
      setExpandedZone(zoneName);
      return;
    }
    
    // Per il giocatore locale, mostra il menu delle azioni
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
    if (!zoneActionMenu) return;
    
    const { zoneName } = zoneActionMenu;
    
    switch (action) {
      case 'draw':
        if (zoneName === 'deck' && onDrawCard) {
          onDrawCard();
        }
        break;
      case 'mill':
        if (zoneName === 'deck' && onDeckMill) {
          onDeckMill(1);
        }
        break;
      case 'mill3':
        if (zoneName === 'deck' && onDeckMill) {
          onDeckMill(3);
        }
        break;
      case 'mill5':
        if (zoneName === 'deck' && onDeckMill) {
          onDeckMill(5);
        }
        break;
      case 'shuffle':
        console.log(`Shuffle ${zoneName}`);
        // Qui dovresti implementare la logica per mescolare
        break;
      case 'view':
        setExpandedZone(zoneName);
        break;
      case 'search':
        console.log(`Search in ${zoneName}`);
        setExpandedZone(zoneName);
        break;
      default:
        console.log(`Unknown action: ${action} for zone: ${zoneName}`);
    }
    
    setZoneActionMenu(null);
  };

  const getAvailableActions = (zoneName) => {
    const actions = [];
    
    switch (zoneName) {
      case 'deck':
        actions.push(
          { id: 'draw', label: 'Pesca 1', icon: '🎯' },
          { id: 'mill', label: 'Mill 1', icon: '💀' },
          { id: 'mill3', label: 'Mill 3', icon: '💀💀💀' },
          { id: 'mill5', label: 'Mill 5', icon: '💀×5' },
          { id: 'shuffle', label: 'Mescola', icon: '🔄' },
          { id: 'search', label: 'Cerca', icon: '🔍' },
          { id: 'view', label: 'Visualizza', icon: '👁️' }
        );
        break;
      case 'extraDeck':
        actions.push(
          { id: 'view', label: 'Visualizza', icon: '👁️' },
          { id: 'search', label: 'Cerca', icon: '🔍' }
        );
        break;
      case 'graveyard':
        actions.push(
          { id: 'view', label: 'Visualizza', icon: '👁️' },
          { id: 'shuffle', label: 'Mescola nel Deck', icon: '🔄' }
        );
        break;
      case 'banished':
      case 'banishedFaceDown':
        actions.push(
          { id: 'view', label: 'Visualizza', icon: '👁️' }
        );
        break;
      case 'fieldSpell':
        actions.push(
          { id: 'view', label: 'Visualizza', icon: '👁️' }
        );
        break;
      default:
        actions.push(
          { id: 'view', label: 'Visualizza', icon: '👁️' }
        );
    }
    
    return actions;
  };

  return {
    zoneActionMenu,
    setZoneActionMenu,
    expandedZone,
    setExpandedZone,
    handleZoneClick,
    handleZoneAction,
    getAvailableActions
  };
};
